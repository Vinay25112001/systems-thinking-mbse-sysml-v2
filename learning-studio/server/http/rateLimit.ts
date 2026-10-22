// In-process rate limits (SECURITY_ARCHITECTURE.md §4.4). Single process only; several processes (D2) need a shared
// store. Nothing here is persisted: client IPs live only in memory, inside the window.
//   (login, IP)  after 5 failures each further attempt waits 1 s, 2 s, 4 s … (capped at 60 s); after 10 failures in
//                15 min the pair is locked for 15 min
//   account      after 50 failures in an hour the account is locked for an hour (persisted on the credential; an admin
//                may unlock it sooner) — M2 review L5: timed, not permanent, and answered with the generic 429 text
//   IP           at most 30 login attempts per minute
//   session      at most 600 requests per minute
//   password     change attempts: at most 5 per session in 15 minutes, and at most 10 wrong current passwords per
//                account in an hour (M2 review M6: a stolen session cannot brute-force the real password, and each
//                attempt is a 128 MiB scrypt)
// Every map is swept periodically (prune(), M2 review L6), so keys that are never touched again do not accumulate.
export type LimitDecision = { ok: true } | { ok: false; retryAfterSeconds: number; reason: 'delay' | 'locked' | 'ip' | 'session' }

const MIN = 60_000
export const PASSWORD_CHANGE_LIMITS = { perSession: 5, sessionWindowMs: 15 * MIN, accountFailures: 10, accountWindowMs: 60 * MIN }
export const ACCOUNT_LOCK_MS = 60 * MIN

export class RateLimiter {
  private pairs = new Map<string, number[]>() // failure times per (login, ip)
  private pairLock = new Map<string, number>() // locked until (ms)
  private ipAttempts = new Map<string, number[]>()
  private accountFailures = new Map<string, number[]>()
  private sessionHits = new Map<string, number[]>()
  private pwSession = new Map<string, number[]>() // password-change attempts per session
  private pwAccount = new Map<string, number[]>() // wrong current passwords per account
  private now: () => number
  constructor(now: () => number = Date.now) {
    this.now = now
  }
  private recent(m: Map<string, number[]>, key: string, windowMs: number): number[] {
    const t = this.now()
    const list = (m.get(key) ?? []).filter((x) => t - x < windowMs)
    if (list.length) m.set(key, list)
    else m.delete(key)
    return list
  }

  /** Before checking a password. Counts the attempt against the IP. */
  checkLogin(login: string, ip: string): LimitDecision {
    const t = this.now()
    const ipList = this.recent(this.ipAttempts, ip, MIN)
    if (ipList.length >= 30) return { ok: false, retryAfterSeconds: Math.ceil((ipList[0] + MIN - t) / 1000), reason: 'ip' }
    ipList.push(t)
    this.ipAttempts.set(ip, ipList)
    const key = `${login}\u0000${ip}`
    const until = this.pairLock.get(key)
    if (until && until > t) return { ok: false, retryAfterSeconds: Math.ceil((until - t) / 1000), reason: 'locked' }
    const fails = this.recent(this.pairs, key, 15 * MIN)
    if (fails.length >= 5) {
      const wait = Math.min(60_000, 1000 * 2 ** (fails.length - 5))
      const next = fails[fails.length - 1] + wait
      if (next > t) return { ok: false, retryAfterSeconds: Math.ceil((next - t) / 1000), reason: 'delay' }
    }
    return { ok: true }
  }
  /** After a failed password. Returns true when the pair has just been locked (for the audit log). */
  loginFailed(login: string, ip: string): { pairLocked: boolean } {
    const t = this.now()
    const key = `${login}\u0000${ip}`
    const fails = this.recent(this.pairs, key, 15 * MIN)
    fails.push(t)
    this.pairs.set(key, fails)
    if (fails.length >= 10) {
      this.pairLock.set(key, t + 15 * MIN)
      this.pairs.delete(key)
      return { pairLocked: true }
    }
    return { pairLocked: false }
  }
  /** Failures of one existing account across all IPs in the last hour, including this one. */
  accountFailed(userId: string): number {
    const list = this.recent(this.accountFailures, userId, 60 * MIN)
    list.push(this.now())
    this.accountFailures.set(userId, list)
    return list.length
  }
  loginSucceeded(login: string, ip: string) {
    const key = `${login}\u0000${ip}`
    this.pairs.delete(key)
    this.pairLock.delete(key)
  }
  /** Before a password change: counts the attempt against the session; refuses when the session or the account is over
   *  its limit. */
  //  The account lock applies to the sessions that existed when it started: someone holding a stolen session cannot lock
  //  the owner out of the remedy, because a fresh sign-in (which needs the password) is not affected (review N2).
  checkPasswordChange(userId: string, sessionKey: string, sessionCreatedMs = 0): LimitDecision {
    const t = this.now()
    const L = PASSWORD_CHANGE_LIMITS
    const acc = this.recent(this.pwAccount, userId, L.accountWindowMs)
    if (acc.length >= L.accountFailures && sessionCreatedMs <= acc[L.accountFailures - 1]) return { ok: false, retryAfterSeconds: Math.ceil((acc[0] + L.accountWindowMs - t) / 1000), reason: 'locked' }
    const ses = this.recent(this.pwSession, sessionKey, L.sessionWindowMs)
    if (ses.length >= L.perSession) return { ok: false, retryAfterSeconds: Math.ceil((ses[0] + L.sessionWindowMs - t) / 1000), reason: 'session' }
    ses.push(t)
    this.pwSession.set(sessionKey, ses)
    return { ok: true }
  }
  passwordChangeFailed(userId: string) {
    const list = this.recent(this.pwAccount, userId, PASSWORD_CHANGE_LIMITS.accountWindowMs)
    list.push(this.now())
    this.pwAccount.set(userId, list)
  }
  /** Drops every expired entry (run on start and hourly by the server). Returns the number of keys still held. */
  prune(): number {
    const t = this.now()
    const sweep = (m: Map<string, number[]>, windowMs: number) => {
      for (const [k, list] of m) {
        const keep = list.filter((x) => t - x < windowMs)
        if (keep.length) m.set(k, keep)
        else m.delete(k)
      }
    }
    sweep(this.pairs, 15 * MIN)
    sweep(this.ipAttempts, MIN)
    sweep(this.accountFailures, 60 * MIN)
    sweep(this.sessionHits, MIN)
    sweep(this.pwSession, PASSWORD_CHANGE_LIMITS.sessionWindowMs)
    sweep(this.pwAccount, PASSWORD_CHANGE_LIMITS.accountWindowMs)
    for (const [k, until] of this.pairLock) if (until <= t) this.pairLock.delete(k)
    return this.pairs.size + this.ipAttempts.size + this.accountFailures.size + this.sessionHits.size + this.pwSession.size + this.pwAccount.size + this.pairLock.size
  }
  hitSession(tokenHash: string): LimitDecision {
    const list = this.recent(this.sessionHits, tokenHash, MIN)
    if (list.length >= 600) return { ok: false, retryAfterSeconds: Math.ceil((list[0] + MIN - this.now()) / 1000), reason: 'session' }
    list.push(this.now())
    this.sessionHits.set(tokenHash, list)
    return { ok: true }
  }
}
