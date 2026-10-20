// Week 1 "Team enterprise" view (the Lab L1 tool): the team's own Week 1 Team Record, part by part, with a completeness check
// on every part, the AI usage statement, and the two exports (Markdown record, JSON model inputs). A teammate's JSON
// export can be imported, so every member's Practice can finish from one shared record. All checks live in team.ts and
// needQuality.ts (pure, tested both ways). Needs (review F01): the tool checks structure and subject, warns on the
// subjective criteria, and the team confirms the six checks per need; an unjustified warning stops a need counting.
// Sign-off review 2026-10-19: the lecture's need form and six-check gate (M1), PRT as parts inside the boundary (M2), the
// problem, mission and goals with a need → goal trace (M3), REL rows (Mo1), all read from labBrief.ts via team.ts.
import { Download, Plus, Trash2, Upload } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { useWorkbench } from '../context'
import { downloadText } from '../download'
import { StateChip } from '../ui'
import { COURSE_ROLES, MERGED_ROLE } from './logic'
import { NEED_FORM, NEED_PRIORITY_DEFINITION, PRT_MEANING, REL_TYPES } from '../../content/lectures/week01/labBrief'
import { SELF_CHECK } from './needQuality'
import { ROLES, STAGES } from './stakeholders'
import { useTeamRecord } from '../../project/adapters/useTeamRecord'
import { recordHasContent } from '../../project/adapters/week1'
import { TeamImportDialog, TeamProjectBanner, type PendingImport } from '../../project/adapters/TeamProject'
import {
  MIN_AI_WORDS, MIN_CONFLICTS, MIN_RELATIONSHIPS, MISSION_ID, PRIORITIES, PRIORITY_LABEL, TEAM_KEY, EMPTY_REL_ROW, needsMinimum, relVerb, type RelRow, approvalOf, checkAiStatement, checkCharterPart, checkContextPart, checkExported, checkNeedsPart, checkProposal, checkRegister, concernIssue, importModelInputs, needStatus,
  nextId, teamMarkdown, teamModelInputs, EMPTY_NEED_ROW, type ContextRow, type IdPrefix, type NeedRow, type PartCheck, type StakeholderRow, type TeamRecord,
} from './team'

function Part({ id, n, title, check, children }: { id: string; n?: number; title: string; check: PartCheck; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} className="rounded border border-wb-line bg-wb-panel" data-testid={id}>
      <div className="wb-ph">
        <h2 id={`${id}-h`}>{n ? `Part ${n} · ${title}` : title}</h2>
        <span className="wb-sp" />
        <StateChip ok={check.ok}>{check.ok ? 'complete' : 'incomplete'}</StateChip>
      </div>
      <div className="space-y-2 p-3">
        {children}
        <div className={`wb-note ${check.ok ? 'ok' : 'warn'} m-0`} role="status" data-testid={`${id}-check`}>
          {check.ok ? (
            <>✓ {check.detail}</>
          ) : (
            <>
              <strong>Still needed:</strong>
              <ul className="m-0 mt-1 list-disc space-y-0.5 pl-5">
                {check.issues.slice(0, 6).map((x) => (
                  <li key={x}>{x}</li>
                ))}
                {check.issues.length > 6 && <li>and {check.issues.length - 6} more</li>}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

const Field = ({ label, children, id }: { label: string; id: string; children: ReactNode }) => (
  <label className="block" htmlFor={id}>
    <span className="wb-label">{label}</span>
    {children}
  </label>
)

function NeedItem({ x, r, uid, onChange, onRemove }: { x: NeedRow; r: TeamRecord; uid: string; onChange: (p: Partial<NeedRow>) => void; onRemove: () => void }) {
  const st = needStatus(x, r)
  const a = st.assessment
  // editing what the team confirmed clears the confirmation, so a tick always refers to the current wording
  const edit = (p: Partial<NeedRow>) => onChange({ ...p, selfCheck: {} })
  const started = !!(x.text || x.name || x.rationale)
  return (
    <li className="rounded border border-wb-line p-2" data-testid={`team-${x.id}`}>
      <div className="flex flex-wrap items-end gap-2">
        <span className="wb-mono text-[11px]">{x.id}</span>
        <Field label="Short name" id={`${uid}-${x.id}-n`}>
          <input id={`${uid}-${x.id}-n`} className="wb-input w-48" value={x.name} onChange={(e) => onChange({ name: e.target.value })} />
        </Field>
        <Field label="Source stakeholder(s), e.g. STK-001" id={`${uid}-${x.id}-s`}>
          <input id={`${uid}-${x.id}-s`} className="wb-input mono w-44" value={x.sources} onChange={(e) => onChange({ sources: e.target.value })} />
        </Field>
        <Field label="Answers concern(s), e.g. CON-001" id={`${uid}-${x.id}-k`}>
          <input id={`${uid}-${x.id}-k`} className="wb-input mono w-44" value={x.concerns} onChange={(e) => onChange({ concerns: e.target.value })} />
        </Field>
        <Field label={`Goal it serves (${MISSION_ID} or MGO-nnn)`} id={`${uid}-${x.id}-g`}>
          <input id={`${uid}-${x.id}-g`} className="wb-input mono w-32" value={x.goal} onChange={(e) => onChange({ goal: e.target.value })} />
        </Field>
        <Field label="Priority (MITRE category)" id={`${uid}-${x.id}-p`}>
          <select id={`${uid}-${x.id}-p`} className="wb-select" value={x.priority} onChange={(e) => onChange({ priority: e.target.value as NeedRow['priority'] })}>
            <option value="">Choose…</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p} title={p ? NEED_PRIORITY_DEFINITION[p] : undefined}>
                {p ? PRIORITY_LABEL[p] : ''}
              </option>
            ))}
          </select>
        </Field>
        <button type="button" className="wb-btn ghost ml-auto" aria-label={`Remove ${x.id}`} onClick={onRemove}>
          <Trash2 size={12} aria-hidden />
        </button>
      </div>
      <div className="mt-2 grid gap-2">
        <Field label={`Need statement (recommended form: “${NEED_FORM}”)`} id={`${uid}-${x.id}-t`}>
          <textarea id={`${uid}-${x.id}-t`} rows={2} className="wb-textarea" value={x.text} onChange={(e) => edit({ text: e.target.value })} />
        </Field>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Condition (if not in the statement)" id={`${uid}-${x.id}-c`}>
            <input id={`${uid}-${x.id}-c`} className="wb-input w-full" value={x.conditions} onChange={(e) => edit({ conditions: e.target.value })} />
          </Field>
          <Field label="Rationale (why they need it)" id={`${uid}-${x.id}-r`}>
            <input id={`${uid}-${x.id}-r`} className="wb-input w-full" value={x.rationale} onChange={(e) => onChange({ rationale: e.target.value })} />
          </Field>
        </div>
      </div>
      {started && (
        <div className="mt-2 space-y-1 text-[12.5px]" data-testid={`team-${x.id}-assessment`}>
          <ul className="m-0 list-none space-y-0.5 p-0">
            {a.gates.map((g) => (
              <li key={g.id} className={g.ok ? 'text-wb-ok' : 'text-wb-bad'}>
                <strong>{g.ok ? 'Checked' : 'Fix'}:</strong> {g.message}
              </li>
            ))}
            {a.warnings.map((w) => (
              <li key={w.id} className="text-wb-warn">
                <strong>Warning:</strong> {w.message}
              </li>
            ))}
            {a.advice.map((x) => (
              <li key={x.id} className="text-wb-muted" data-testid="need-advice">
                <strong>Note:</strong> {x.message}
              </li>
            ))}
          </ul>
          {a.warnings.length > 0 && (
            <Field label="Justification, if a warning stays: why this wording is right for your stakeholder" id={`${uid}-${x.id}-j`}>
              <input id={`${uid}-${x.id}-j`} className="wb-input w-full" value={x.justification} onChange={(e) => onChange({ justification: e.target.value })} />
            </Field>
          )}
          <fieldset className="m-0 rounded border border-wb-line p-2" data-testid={`team-${x.id}-selfcheck`}>
            <legend className="px-1 text-[12px] font-semibold">Self-check: confirm each of the six checks for this wording</legend>
            <ul className="m-0 list-none space-y-1 p-0">
              {SELF_CHECK.map((c) => (
                <li key={c.id}>
                  <label className="flex items-start gap-2">
                    <input type="checkbox" className="mt-0.5" checked={!!x.selfCheck[c.id]} onChange={(e) => onChange({ selfCheck: { ...x.selfCheck, [c.id]: e.target.checked } })} />
                    <span>
                      {c.label} <span className="text-wb-muted">{c.tool}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        </div>
      )}
      <p className={`m-0 mt-1 text-[12px] ${st.counts ? 'text-wb-ok' : 'text-wb-warn'}`} data-testid={`team-${x.id}-status`}>
        {st.counts ? 'Counts toward the minimum.' : `Does not count yet: ${st.reasons[0]}`}
      </p>
    </li>
  )
}

export default function TeamView() {
  const wb = useWorkbench()
  // My Project (A22, roadmap P1.6): the record is read and written through the project when one exists (useTeamRecord);
  // without a project the tool keeps its legacy behaviour on the workbench artefact.
  const [r, set, mode] = useTeamRecord()
  const uid = useId()
  const [importMsg, setImportMsg] = useState('')
  const [pending, setPending] = useState<PendingImport | null>(null)
  const slug = (r.team.trim() || 'NN').replace(/[^A-Za-z0-9-]+/g, '-')
  const exportMd = () => {
    const ok = downloadText(`team-${slug}-week1-record.md`, teamMarkdown(r), 'text/markdown')
    if (ok) set({ exportedMdAt: Date.now() })
    if (ok) setImportMsg('')
    wb.log('export', ok ? 'Exported the Week 1 Team Record (Markdown)' : 'Export failed: downloads are blocked in this browser')
  }
  const exportJson = () => {
    const ok = downloadText(`team-${slug}-week1-model-inputs.json`, JSON.stringify(teamModelInputs(r), null, 2), 'application/json')
    if (ok) set({ exportedJsonAt: Date.now() })
    if (ok) setImportMsg('')
    wb.log('export', ok ? 'Exported the Week 1 model inputs (JSON)' : 'Export failed: downloads are blocked in this browser')
  }
  const legacyReplace = (res: TeamRecord, file: string) => {
    if (recordHasContent(r)) wb.setArtefact<TeamRecord>(`${TEAM_KEY}.previous`, () => r)
    wb.setArtefact<TeamRecord>(TEAM_KEY, () => ({ ...res, updatedAt: Date.now() }))
    setImportMsg(`Imported ${res.stakeholders.length} stakeholders and ${res.needs.length} needs from ${file}. Export again to finish the last step.`)
    wb.log('info', `Imported the Team Record from ${file}`)
  }
  // Never a silent overwrite (architecture §1.1 finding 3): in project mode the file goes through the project's import
  // plan; in legacy mode a record with content is replaced only after a confirmation (the previous record is kept).
  const importJson = async (file: File | undefined) => {
    if (!file) return
    try {
      const text = await file.text()
      if (mode === 'project') return setPending({ file: file.name, text })
      const res = importModelInputs(text)
      if ('error' in res) {
        setImportMsg(`Not imported: ${res.error}`)
        return
      }
      if (!recordHasContent(r)) return legacyReplace(res, file.name)
      setPending({ file: file.name, text, record: res })
    } catch (e) {
      setImportMsg(`Not imported: ${file.name} could not be read (${e instanceof Error ? e.message : String(e)}).`)
    }
  }
  const c1 = checkCharterPart(r.charter)
  const c2 = checkProposal(r.proposal)
  const c3 = checkContextPart(r)
  const c4 = checkRegister(r)
  const c5 = checkNeedsPart(r)
  const c6 = checkAiStatement(r)
  const cx = checkExported(r)
  const approved = approvalOf(r.proposal) === 'approved'

  const setCtx = (i: number, p: Partial<ContextRow>) => set({ context: r.context.map((x, j) => (j === i ? { ...x, ...p } : x)) })
  const setStk = (i: number, p: Partial<StakeholderRow>) => set({ stakeholders: r.stakeholders.map((x, j) => (j === i ? { ...x, ...p } : x)) })
  const setNeed = (i: number, p: Partial<NeedRow>) => set({ needs: r.needs.map((x, j) => (j === i ? { ...x, ...p } : x)) })
  const setRel = (i: number, p: Partial<RelRow>) => set({ relationships: r.relationships.map((x, j) => (j === i ? { ...x, ...p } : x)) })
  const setGoal = (i: number, text: string) => set({ proposal: { ...r.proposal, goals: r.proposal.goals.map((g, j) => (j === i ? { ...g, text } : g)) } })
  const nm = needsMinimum(r.charter)
  const issue = (prefix: IdPrefix) => {
    const id = nextId(r, prefix)
    return { id, issued: { ...r.issued, [prefix]: Number(id.split('-')[1]) } }
  }

  return (
    <div className="wb-view-body" data-testid="view-team">
      <TeamProjectBanner mode={mode} />
      {pending && (
        <TeamImportDialog
          pending={pending}
          mode={mode}
          current={r}
          onClose={(m) => (setPending(null), m && setImportMsg(m))}
          onLegacyConfirm={(res) => (setPending(null), legacyReplace(res, pending.file))}
        />
      )}
      <p className="m-0 max-w-[90ch] text-[13px] text-wb-muted">Your team’s own enterprise, not AeroLink. One member can enter the record and export the model inputs; teammates import that file to see and continue the same record. Everything is saved in this browser, so export after every working session.</p>
      <div className="flex flex-wrap items-end gap-2" data-testid="team:export">
        <Field label="Team name or number" id={`${uid}-team`}>
          <input id={`${uid}-team`} className="wb-input w-40" value={r.team} onChange={(e) => set({ team: e.target.value })} />
        </Field>
        <button type="button" className="wb-btn primary" onClick={exportMd}>
          <Download size={13} aria-hidden /> Export Team Record (.md)
        </button>
        <button type="button" className="wb-btn primary" onClick={exportJson}>
          <Download size={13} aria-hidden /> Export model inputs (.json)
        </button>
        <label className="wb-btn" htmlFor={`${uid}-imp`}>
          <Upload size={13} aria-hidden /> Import model inputs (.json)
          <input id={`${uid}-imp`} type="file" accept=".json,application/json" className="sr-only" onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              void importJson(f)
            }} />
        </label>
        <StateChip ok={cx.ok}>{cx.ok ? (approved ? 'exported' : 'exported: submitted for approval') : 'not exported'}</StateChip>
      </div>
      {importMsg && (
        <p className="wb-note m-0" role="status" data-testid="team-import-msg">
          {importMsg}
        </p>
      )}
      {!cx.ok && <p className="m-0 text-[12px] text-wb-muted">{cx.detail}</p>}

      <Part id="team-charter" n={1} title="Team charter" check={c1}>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={r.charter.threePersonTeam} onChange={(e) => set({ charter: { ...r.charter, threePersonTeam: e.target.checked } })} />
          Three-person team (AI &amp; Data Management merges with Architecture)
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {COURSE_ROLES.map((role, i) => {
            const merged = r.charter.threePersonTeam && role === MERGED_ROLE
            return (
              <Field key={role} label={`${role}${merged ? ' (merged with Architecture)' : ''}: lead’s initials`} id={`${uid}-role${i}`}>
                <input id={`${uid}-role${i}`} className="wb-input mono w-28" disabled={merged} value={merged ? '' : (r.charter.roles[role] ?? '')} onChange={(e) => set({ charter: { ...r.charter, roles: { ...r.charter.roles, [role]: e.target.value } } })} />
              </Field>
            )
          })}
        </div>
        <Field label="Decision rules: how the team decides when members disagree" id={`${uid}-dr`}>
          <textarea id={`${uid}-dr`} rows={2} className="wb-textarea" value={r.charter.decisionRules} onChange={(e) => set({ charter: { ...r.charter, decisionRules: e.target.value } })} />
        </Field>
        <Field label="Communication norms: where you talk, reply times, meetings" id={`${uid}-cn`}>
          <textarea id={`${uid}-cn`} rows={2} className="wb-textarea" value={r.charter.norms} onChange={(e) => set({ charter: { ...r.charter, norms: e.target.value } })} />
        </Field>
        <Field label="Owned ID prefixes, one member per line (e.g. “JS: STK, CON, NEED”); ENT, EXT, STK, CON and NEED each need one owner" id={`${uid}-px`}>
          <textarea id={`${uid}-px`} rows={3} className="wb-textarea wb-mono" value={r.charter.prefixes} onChange={(e) => set({ charter: { ...r.charter, prefixes: e.target.value } })} />
        </Field>
      </Part>

      <Part id="team-proposal" n={2} title="Enterprise proposal (ENT-001)" check={c2}>
        <p className="m-0 text-[12px] text-wb-muted">Your proposal names the enterprise and, inside it, the system of interest your team will engineer.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Enterprise name" id={`${uid}-pn`}>
            <input id={`${uid}-pn`} className="wb-input w-full" value={r.proposal.name} onChange={(e) => set({ proposal: { ...r.proposal, name: e.target.value } })} />
          </Field>
          <Field label="Domain" id={`${uid}-pd`}>
            <input id={`${uid}-pd`} className="wb-input w-full" value={r.proposal.domain} onChange={(e) => set({ proposal: { ...r.proposal, domain: e.target.value } })} />
          </Field>
        </div>
        <Field label="Problem statement: the problem or opportunity the enterprise addresses (one sentence)" id={`${uid}-pb`}>
          <input id={`${uid}-pb`} className="wb-input w-full" value={r.proposal.problem} onChange={(e) => set({ proposal: { ...r.proposal, problem: e.target.value } })} />
        </Field>
        <Field label={`Mission, ${MISSION_ID}: a purpose, not a product (one sentence)`} id={`${uid}-pp`}>
          <input id={`${uid}-pp`} className="wb-input w-full" value={r.proposal.purpose} onChange={(e) => set({ proposal: { ...r.proposal, purpose: e.target.value } })} />
        </Field>
        <div>
          <span className="wb-label">Goals (MGO-002 …): what the mission is broken into; every need traces to the mission or a goal</span>
          <ul className="m-0 list-none space-y-1 p-0" data-testid="team-goals">
            {r.proposal.goals.map((g, i) => (
              <li key={g.id} className="flex items-center gap-2">
                <span className="wb-mono text-[11px]">{g.id}</span>
                <input aria-label={`${g.id} goal`} className="wb-input w-full" value={g.text} onChange={(e) => setGoal(i, e.target.value)} />
                <button type="button" className="wb-btn ghost" aria-label={`Remove ${g.id}`} onClick={() => set({ proposal: { ...r.proposal, goals: r.proposal.goals.filter((_, j) => j !== i) } })}>
                  <Trash2 size={12} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="wb-btn mt-1" onClick={() => { const n = issue('MGO'); set({ proposal: { ...r.proposal, goals: [...r.proposal.goals, { id: n.id, text: '' }] }, issued: n.issued }) }}>
            <Plus size={12} aria-hidden /> Add a goal
          </button>
        </div>
        <Field label="System of interest (one sentence)" id={`${uid}-ps`}>
          <input id={`${uid}-ps`} className="wb-input w-full" value={r.proposal.soi} onChange={(e) => set({ proposal: { ...r.proposal, soi: e.target.value } })} />
        </Field>
        <div>
          <span className="wb-label">Inside the boundary (PRT): each {PRT_MEANING}; in Week 8 each becomes a part of your system</span>
          <ul className="m-0 list-none space-y-1 p-0" data-testid="team-inside">
            {r.proposal.inside.map((x, i) => (
              <li key={x.id} className="flex items-center gap-2">
                <span className="wb-mono text-[11px]">{x.id}</span>
                <input aria-label={`${x.id} name`} className="wb-input w-full" value={x.name} onChange={(e) => set({ proposal: { ...r.proposal, inside: r.proposal.inside.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)) } })} />
                <button type="button" className="wb-btn ghost" aria-label={`Remove ${x.id}`} onClick={() => set({ proposal: { ...r.proposal, inside: r.proposal.inside.filter((_, j) => j !== i) } })}>
                  <Trash2 size={12} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="wb-btn mt-1" onClick={() => { const n = issue('PRT'); set({ proposal: { ...r.proposal, inside: [...r.proposal.inside, { id: n.id, name: '' }] }, issued: n.issued }) }}>
            <Plus size={12} aria-hidden /> Add an element inside the boundary
          </button>
        </div>
        <Field label="Why it suits a 14-week project (one paragraph)" id={`${uid}-pw`}>
          <textarea id={`${uid}-pw`} rows={4} className="wb-textarea" value={r.proposal.why} onChange={(e) => set({ proposal: { ...r.proposal, why: e.target.value } })} />
        </Field>
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Instructor’s decision" id={`${uid}-pdc`}>
            <select id={`${uid}-pdc`} className="wb-select w-full" value={r.proposal.decision} onChange={(e) => set({ proposal: { ...r.proposal, decision: e.target.value as TeamRecord['proposal']['decision'] } })}>
              <option value="">Choose…</option>
              <option value="pending">Submitted for approval (not yet approved)</option>
              <option value="approved">Approved</option>
              <option value="revise">Revise and resubmit</option>
            </select>
          </Field>
          <Field label="Date of the decision or of the submission (YYYY-MM-DD)" id={`${uid}-pdt`}>
            <input id={`${uid}-pdt`} className="wb-input w-full" value={r.proposal.decidedOn} onChange={(e) => set({ proposal: { ...r.proposal, decidedOn: e.target.value } })} />
          </Field>
        </div>
      </Part>

      <Part id="team-context" n={3} title="Context: external systems and actors (EXT)" check={c3}>
        {r.context.length > 0 && (
          <div className="overflow-x-auto">
            <table className="wb-table" data-testid="team-context-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Kind</th>
                  <th scope="col">What crosses the boundary</th>
                  <th scope="col">Direction</th>
                  <th scope="col">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {r.context.map((c, i) => (
                  <tr key={`${c.id}-${i}`}>
                    <td className="wb-mono text-[11px]">{c.id}</td>
                    <td>
                      <input aria-label={`${c.id} name`} className="wb-input w-full" value={c.name} onChange={(e) => setCtx(i, { name: e.target.value })} />
                    </td>
                    <td>
                      <select aria-label={`${c.id} kind`} className="wb-select" value={c.kind} onChange={(e) => setCtx(i, { kind: e.target.value as ContextRow['kind'] })}>
                        <option value="">Choose…</option>
                        <option value="system">System</option>
                        <option value="actor">Actor (person or organization)</option>
                      </select>
                    </td>
                    <td>
                      <input aria-label={`${c.id} what crosses the boundary`} className="wb-input w-full" value={c.crosses} onChange={(e) => setCtx(i, { crosses: e.target.value })} />
                    </td>
                    <td>
                      <select aria-label={`${c.id} direction`} className="wb-select" value={c.direction} onChange={(e) => setCtx(i, { direction: e.target.value as ContextRow['direction'] })}>
                        <option value="">Choose…</option>
                        <option value="in">Into the system</option>
                        <option value="out">Out of the system</option>
                        <option value="both">Both ways</option>
                      </select>
                    </td>
                    <td>
                      <button type="button" className="wb-btn ghost" aria-label={`Remove ${c.id}`} onClick={() => set({ context: r.context.filter((_, j) => j !== i) })}>
                        <Trash2 size={12} aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button type="button" className="wb-btn" onClick={() => { const n = issue('EXT'); set({ context: [...r.context, { id: n.id, name: '', kind: '', crosses: '', direction: '' }], issued: n.issued }) }}>
          <Plus size={12} aria-hidden /> Add an external system or actor
        </button>
      </Part>

      <Part id="team-register" n={4} title="Stakeholder register (STK, CON)" check={c4}>
        <p className="m-0 text-[12px] text-wb-muted">
          What the tool checks in a concern: that it is not only a general quality (safety, cost, noise…) and that it carries at least one concrete detail: a number or time, a condition, a place, an affected group, or a consequence. What it cannot check: whether the detail is true or the concern important. You and the instructor judge that. A stakeholder can have several concerns, each with its own CON ID.
        </p>
        <ol className="m-0 list-none space-y-2 p-0" data-testid="team-stakeholders">
          {r.stakeholders.map((s, i) => (
            <li key={`${s.id}-${i}`} className="rounded border border-wb-line p-2" data-testid={`team-${s.id}`}>
              <div className="flex flex-wrap items-end gap-2">
                <span className="wb-mono text-[11px]">{s.id}</span>
                <Field label="Stakeholder" id={`${uid}-${s.id}-${i}-n`}>
                  <input id={`${uid}-${s.id}-${i}-n`} className="wb-input w-56" value={s.name} onChange={(e) => setStk(i, { name: e.target.value })} />
                </Field>
                <Field label="Role" id={`${uid}-${s.id}-${i}-r`}>
                  <select id={`${uid}-${s.id}-${i}-r`} className="wb-select" value={s.role} onChange={(e) => setStk(i, { role: e.target.value })}>
                    <option value="">Choose…</option>
                    {ROLES.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Life-cycle stage" id={`${uid}-${s.id}-${i}-s`}>
                  <select id={`${uid}-${s.id}-${i}-s`} className="wb-select" value={s.stage} onChange={(e) => setStk(i, { stage: e.target.value })}>
                    <option value="">Choose…</option>
                    {STAGES.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Internal or external" id={`${uid}-${s.id}-${i}-i`}>
                  <select id={`${uid}-${s.id}-${i}-i`} className="wb-select" value={s.side} onChange={(e) => setStk(i, { side: e.target.value as StakeholderRow['side'] })}>
                    <option value="">Choose…</option>
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                  </select>
                </Field>
                <Field label="Approving authority" id={`${uid}-${s.id}-${i}-a`}>
                  <select id={`${uid}-${s.id}-${i}-a`} className="wb-select" value={s.approving} onChange={(e) => setStk(i, { approving: e.target.value as StakeholderRow['approving'] })}>
                    <option value="">Choose…</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </Field>
                <button type="button" className="wb-btn ghost ml-auto" aria-label={`Remove ${s.id}`} onClick={() => set({ stakeholders: r.stakeholders.filter((_, j) => j !== i) })}>
                  <Trash2 size={12} aria-hidden />
                </button>
              </div>
              <ul className="m-0 mt-2 list-none space-y-1 p-0" data-testid={`team-${s.id}-concerns`}>
                {s.concerns.map((c, k) => {
                  const problem = c.text.trim() ? concernIssue(c, s.name) : ''
                  return (
                    <li key={`${c.id}-${k}`}>
                      <div className="flex items-end gap-2">
                        <Field label={`Concern ${c.id}: what, for whom, where or when`} id={`${uid}-${c.id}-${k}`}>
                          <input id={`${uid}-${c.id}-${k}`} className="wb-input w-full min-w-[16rem]" value={c.text} onChange={(e) => setStk(i, { concerns: s.concerns.map((y, j) => (j === k ? { ...y, text: e.target.value } : y)) })} />
                        </Field>
                        <button type="button" className="wb-btn ghost" aria-label={`Remove ${c.id}`} onClick={() => setStk(i, { concerns: s.concerns.filter((_, j) => j !== k) })}>
                          <Trash2 size={12} aria-hidden />
                        </button>
                      </div>
                      {problem && <p className="m-0 text-[12px] text-wb-warn">{problem}</p>}
                    </li>
                  )
                })}
              </ul>
              <button type="button" className="wb-btn mt-1" onClick={() => { const n = issue('CON'); set({ stakeholders: r.stakeholders.map((x, j) => (j === i ? { ...x, concerns: [...x.concerns, { id: n.id, text: '' }] } : x)), issued: n.issued }) }}>
                <Plus size={12} aria-hidden /> Add a concern for {s.id}
              </button>
              <div className="mt-2 grid gap-2 sm:grid-cols-[auto_1fr]">
                <Field label="Influence (1–5)" id={`${uid}-${s.id}-${i}-f`}>
                  <select id={`${uid}-${s.id}-${i}-f`} className="wb-select" value={s.influence} onChange={(e) => setStk(i, { influence: e.target.value })}>
                    <option value="">Choose…</option>
                    {['1', '2', '3', '4', '5'].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Reason for the rating" id={`${uid}-${s.id}-${i}-w`}>
                  <input id={`${uid}-${s.id}-${i}-w`} className="wb-input w-full" value={s.reason} onChange={(e) => setStk(i, { reason: e.target.value })} />
                </Field>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="wb-btn"
          onClick={() => {
            const s = issue('STK')
            const k = nextId({ ...r, issued: s.issued }, 'CON')
            set({ stakeholders: [...r.stakeholders, { id: s.id, name: '', role: '', stage: '', side: '', approving: '', concerns: [{ id: k, text: '' }], influence: '', reason: '' }], issued: { ...s.issued, CON: Number(k.split('-')[1]) } })
          }}
        >
          <Plus size={12} aria-hidden /> Add a stakeholder
        </button>
        <div data-testid="team-relationships">
          <span className="wb-label">
            Relationships (REL): at least {MIN_RELATIONSHIPS}, at least {MIN_CONFLICTS} of them a conflict between two stakeholders’ concerns. Read a row as “from … to”: “STK-004 conflicts with STK-005”.
          </span>
          {r.relationships.length > 0 && (
            <div className="overflow-x-auto">
              <table className="wb-table" data-testid="team-rel-table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">From (STK)</th>
                    <th scope="col">Type</th>
                    <th scope="col">To (STK)</th>
                    <th scope="col">Note: what it is about</th>
                    <th scope="col">
                      <span className="sr-only">Remove</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {r.relationships.map((x, i) => (
                    <tr key={`${x.id}-${i}`}>
                      <td className="wb-mono text-[11px]">{x.id}</td>
                      <td>
                        <input aria-label={`${x.id} from`} className="wb-input mono w-24" value={x.from} onChange={(e) => setRel(i, { from: e.target.value.trim().toUpperCase() })} />
                      </td>
                      <td>
                        <select aria-label={`${x.id} type`} className="wb-select" value={x.type} onChange={(e) => setRel(i, { type: e.target.value as RelRow['type'] })}>
                          <option value="">Choose…</option>
                          {REL_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {relVerb(t)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input aria-label={`${x.id} to`} className="wb-input mono w-24" value={x.to} onChange={(e) => setRel(i, { to: e.target.value.trim().toUpperCase() })} />
                      </td>
                      <td>
                        <input aria-label={`${x.id} note`} className="wb-input w-full min-w-[14rem]" value={x.note} onChange={(e) => setRel(i, { note: e.target.value })} />
                      </td>
                      <td>
                        <button type="button" className="wb-btn ghost" aria-label={`Remove ${x.id}`} onClick={() => set({ relationships: r.relationships.filter((_, j) => j !== i) })}>
                          <Trash2 size={12} aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button type="button" className="wb-btn mt-1" onClick={() => { const n = issue('REL'); set({ relationships: [...r.relationships, EMPTY_REL_ROW(n.id)], issued: n.issued }) }}>
            <Plus size={12} aria-hidden /> Add a relationship
          </button>
        </div>
      </Part>

      <Part id="team-needs" n={5} title="Initial stakeholder needs (NEED)" check={c5}>
        <div className="m-0 space-y-1 text-[12px] text-wb-muted" data-testid="team-needs-help">
          <p className="m-0">
            <strong>What the tool checks</strong> (a need that fails one of these cannot count): the statement is a sentence that names an outcome, is not a requirement (no “shall”) and does not ask for a named solution; a stakeholder in your register, not your own enterprise, is the one in need; the ID is unique; the sources and concerns exist in the register and each concern belongs to a source; the need traces to the mission ({MISSION_ID}) or a goal in Part 2; a rationale, a priority (mandatory, critical, desirable or optional) and a short name are recorded. A need in another phrasing than “{NEED_FORM}” is accepted, with a note recommending that form; the note never stops a need counting. Minimum: {nm.needs} needs that count, from at least {nm.needSources} stakeholders{r.charter.threePersonTeam ? ' (three-person team, pending faculty approval)' : ''}, including an approving authority.
          </p>
          <p className="m-0">
            <strong>What it only warns about</strong>: vague words (“good”, “when possible”), other requirement words (“must”, “should”), design words inside the statement, and no condition word. Rewrite the statement, or say in the justification why the wording stays. <strong>What you judge</strong>: the six checks of the course gate (stated as a need, not a requirement; no design; attributed to a registered stakeholder; traced to its concern; a condition; a rationale), confirmed per need in the self-check. A tool “pass” does not make a need good.
          </p>
        </div>
        <ol className="m-0 list-none space-y-2 p-0" data-testid="team-needs-list">
          {r.needs.map((x, i) => (
            <NeedItem key={`${x.id}-${i}`} x={x} r={r} uid={`${uid}-${i}`} onChange={(p) => setNeed(i, p)} onRemove={() => set({ needs: r.needs.filter((_, j) => j !== i) })} />
          ))}
        </ol>
        <button type="button" className="wb-btn" onClick={() => { const n = issue('NEED'); set({ needs: [...r.needs, EMPTY_NEED_ROW(n.id)], issued: n.issued }) }}>
          <Plus size={12} aria-hidden /> Add a need
        </button>
      </Part>

      <Part id="team-ai" n={6} title="AI usage statement" check={c6}>
        <Field label={`Tool, purpose, prompts, what you accepted or rejected and why; or that no AI tool was used (at least ${MIN_AI_WORDS} words)`} id={`${uid}-ai`}>
          <textarea id={`${uid}-ai`} rows={3} className="wb-textarea" value={r.aiStatement} onChange={(e) => set({ aiStatement: e.target.value })} />
        </Field>
        <p className="m-0 text-[12px] text-wb-muted">Tag every AI-suggested stakeholder or need “AI-suggested-reviewed” in its name or rationale (RB-12.3).</p>
      </Part>
    </div>
  )
}
