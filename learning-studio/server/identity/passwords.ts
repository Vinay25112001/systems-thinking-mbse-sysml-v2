// Local password credentials (SECURITY_ARCHITECTURE.md §4.1): scrypt N=2^17, r=8, p=1, 16-byte salt, 64-byte key,
// stored self-describing as scrypt$v=1$N=131072,r=8,p=1$<salt b64>$<hash b64>. Verification is constant-time; an unknown
// account still runs one scrypt against a dummy hash, so timing does not reveal which accounts exist. Async scrypt runs
// on the libuv pool and never blocks the event loop.
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto'

// Bounded scrypt work (M2 review M6). Each scrypt at N=2^17 holds 128 MiB and a libuv thread for ~200 ms; without a
// bound, one signed-in user sending password changes could fill the 4-thread pool and stall everyone's sign-in. At most
// SCRYPT_CONCURRENCY run at once; the rest wait in a queue in which sign-in ('high') always goes before password changes
// and account administration ('low'). A full queue answers 503 instead of growing without limit.
export const SCRYPT_CONCURRENCY = 2
export const SCRYPT_QUEUE_LIMIT = 64
export type Priority = 'high' | 'low'
export class ScryptBusy extends Error {
  constructor() {
    super('The course server is busy; try again in a moment.')
    this.name = 'ScryptBusy'
  }
}
export class Semaphore {
  private active = 0
  private high: (() => void)[] = []
  private low: (() => void)[] = []
  /** Most tasks seen running at once (for tests and diagnostics). */
  peak = 0
  readonly limit: number
  readonly queueLimit: number
  constructor(limit: number, queueLimit: number) {
    this.limit = limit
    this.queueLimit = queueLimit
  }
  get waiting() {
    return this.high.length + this.low.length
  }
  async run<T>(priority: Priority, fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit) {
      if (this.waiting >= this.queueLimit) throw new ScryptBusy()
      await new Promise<void>((resolve) => (priority === 'high' ? this.high : this.low).push(resolve))
    } else this.active++
    this.peak = Math.max(this.peak, this.active)
    try {
      return await fn()
    } finally {
      const next = this.high.shift() ?? this.low.shift()
      if (next) next() // the slot passes straight to the next waiter (active stays the same)
      else this.active--
    }
  }
}
export const scryptGate = new Semaphore(SCRYPT_CONCURRENCY, SCRYPT_QUEUE_LIMIT)

const rawScrypt = (pw: string, salt: Buffer, len: number, o: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) => scryptCb(pw, salt, len, o, (e, k) => (e ? reject(e) : resolve(k))))
const scrypt = (pw: string, salt: Buffer, len: number, o: ScryptOptions, priority: Priority) => scryptGate.run(priority, () => rawScrypt(pw, salt, len, o))

const MAXMEM = 256 * 1024 * 1024 // Node's 32 MiB default rejects N=2^17
const KEYLEN = 64

export async function hashPassword(password: string, N: number, priority: Priority = 'low'): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password.normalize('NFC'), salt, KEYLEN, { N, r: 8, p: 1, maxmem: MAXMEM }, priority)
  return `scrypt$v=1$N=${N},r=8,p=1$${salt.toString('base64')}$${key.toString('base64')}`
}

const PARSE = /^scrypt\$v=1\$N=(\d+),r=(\d+),p=(\d+)\$([A-Za-z0-9+/=]+)\$([A-Za-z0-9+/=]+)$/

export async function verifyPassword(password: string, stored: string, priority: Priority = 'high'): Promise<boolean> {
  const m = PARSE.exec(stored)
  if (!m) return false
  const [N, r, p] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const salt = Buffer.from(m[4], 'base64')
  const want = Buffer.from(m[5], 'base64')
  const got = await scrypt(password.normalize('NFC'), salt, want.length, { N, r, p, maxmem: MAXMEM }, priority)
  return got.length === want.length && timingSafeEqual(got, want)
}

const dummy = new Map<number, Promise<string>>()
/** Spends one scrypt of the same cost when the account does not exist (no timing oracle). */
export async function burnDummy(password: string, N: number): Promise<void> {
  if (!dummy.has(N)) dummy.set(N, hashPassword('dummy-password-for-timing', N, 'high'))
  await verifyPassword(password, await dummy.get(N)!, 'high')
}

// RFC 4648 base32 without padding; 15 random bytes → 24 characters (~120 bits), printed once.
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
export function randomBase32(bytes = 15): string {
  const b = randomBytes(bytes)
  let bits = 0
  let value = 0
  let out = ''
  for (const x of b) {
    value = (value << 8) | x
    bits += 8
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31]
  return out
}
/** A temporary password: 24 base32 characters, grouped for reading aloud (the hyphens are part of it). */
export const temporaryPassword = () => randomBase32(15).match(/.{1,6}/g)!.join('-')

// a small bundled list of the most common passwords (policy §4.1, D1); compared case-insensitively
const COMMON = new Set(['password', 'password1', 'password123', '123456789012', 'qwertyuiop', 'iloveyou', 'letmein', 'welcome', 'admin', 'changeme', 'sunshine', 'football', 'baseball', 'monkey', 'dragon', 'master', 'trustno1', 'passw0rd', 'qwerty123456', '1q2w3e4r5t6y', 'abc123456789', 'correcthorsebatterystaple'])
export const MIN_PASSWORD_LENGTH = 12

/** The reason a new password is refused, or null. No composition rules; no forced rotation. */
export function passwordProblem(pw: string, who: { login: string; displayName: string }): string | null {
  if (pw.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`
  if (pw.length > 256) return 'Use at most 256 characters.'
  const lower = pw.toLowerCase()
  if (COMMON.has(lower) || COMMON.has(lower.replace(/[^a-z0-9]/g, '')) || COMMON.has(lower.replace(/[^a-z]/g, ''))) return 'That password is too common.'
  const parts = [who.login, ...who.displayName.split(/\s+/)].map((x) => x.toLowerCase()).filter((x) => x.length >= 3)
  if (parts.some((x) => lower.includes(x))) return 'The password must not contain your name or login.'
  return null
}
