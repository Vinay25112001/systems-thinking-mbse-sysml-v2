// Check & submit readiness for the Week 1 Team Record: the status uses the same checks as the Team enterprise view, so
// "ready" means what the instructor will check first. Rebuild review F02: "ready" needs every part, the AI usage
// statement, a current export and the instructor's approval with a valid, past date; a complete record whose proposal
// is only submitted for approval is labeled "pending-approval", never "ready"; generic concerns and vague needs never
// reach the minimums.
import { describe, expect, it } from 'vitest'
import { TEAM_KEY } from '../workbench/week1/team'
import { TEAM_FIXTURE } from '../workbench/week1/teamFixture'
import { teamRecordStatus } from './modelInputs'

const TODAY = '2026-10-18'
const exported = { exportedMdAt: 20, exportedJsonAt: 21, updatedAt: 10 }
const status = (p: Record<string, unknown>) => teamRecordStatus({ [TEAM_KEY]: { ...TEAM_FIXTURE, ...exported, ...p } }, TODAY)

describe('Team Record readiness', () => {
  it('an empty record is not ready, and every part says what is missing', () => {
    const st = teamRecordStatus({}, TODAY)
    expect(st.ready).toBe(false)
    expect(st.state).toBe('not-ready')
    expect(st.parts.map((p) => p.id)).toEqual(['charter', 'proposal', 'context', 'register', 'needs', 'ai', 'export', 'approval'])
    for (const p of st.parts) expect(p.check.issues.length, p.id).toBeGreaterThan(0)
  })
  it('a complete, approved record exported after its last change is ready', () => {
    const st = status({})
    expect(st.state).toBe('ready')
    expect(st.ready).toBe(true)
  })
  it('a complete record is not ready until both files are exported, or after an edit since the export', () => {
    expect(teamRecordStatus({ [TEAM_KEY]: TEAM_FIXTURE }, TODAY).ready).toBe(false)
    expect(status({ updatedAt: 99 }).ready).toBe(false)
  })
  it('F02: a proposal only submitted for approval is labeled, never ready', () => {
    const st = status({ proposal: { ...TEAM_FIXTURE.proposal, decision: 'pending', decidedOn: '' } })
    expect(st.state).toBe('pending-approval')
    expect(st.ready).toBe(false)
    expect(st.parts.find((p) => p.id === 'approval')!.check.issues[0]).toMatch(/required before the Week 2 submission/)
  })
  it('F02: “revise”, a future date or a nonsense date is never ready', () => {
    for (const p of [{ decision: 'revise' }, { decidedOn: '2026-12-01' }, { decidedOn: '2099-99-99' }]) expect(status({ proposal: { ...TEAM_FIXTURE.proposal, ...p } }).state, JSON.stringify(p)).toBe('not-ready')
  })
  it('F02: no AI usage statement means not ready', () => {
    const st = status({ aiStatement: '' })
    expect(st.state).toBe('not-ready')
    expect(st.parts.find((p) => p.id === 'ai')!.check.ok).toBe(false)
  })
  it('F02: generic concerns and vague needs do not reach the minimums', () => {
    const generic = status({ stakeholders: TEAM_FIXTURE.stakeholders.map((s) => ({ ...s, concerns: [{ ...s.concerns[0], text: 'They are concerned about overall safety and costs.' }] })) })
    expect(generic.parts.find((p) => p.id === 'register')!.check.ok).toBe(false)
    const vague = status({ needs: TEAM_FIXTURE.needs.map((n, i) => ({ ...n, text: `${TEAM_FIXTURE.stakeholders[i].name} need good service when possible.` })) })
    expect(vague.parts.find((p) => p.id === 'needs')!.check.ok).toBe(false)
    expect(vague.state).toBe('not-ready')
  })
  it('one stakeholder short makes the record not ready, and the register part names the reason', () => {
    const st = status({ stakeholders: TEAM_FIXTURE.stakeholders.slice(0, 7) })
    expect(st.ready).toBe(false)
    expect(st.parts.find((p) => p.id === 'register')!.check.issues[0]).toMatch(/At least 8/)
  })
})
