// The two generated Week 8 SysML files (scripts/build-week08-sysml.mjs writes them; sysmlWeek08.test.ts checks they are
// current). Kept apart from skeleton.ts so the app bundle never needs the Week 1 fixture.
import { AEROLINK_MODEL, AEROLINK_MODEL_FILE } from '../../content/lectures/week08/aerolinkCase'
import { teamModelInputs, type TeamRecord } from '../week1/team'
import { TEAM_FIXTURE } from '../week1/teamFixture'
import { generateSysml, importFile } from './skeleton'

export const FIXTURE_FILE = 'lectures/week08/labtool_team07_model_v01.sysml'
export const FIXTURE_PURPOSE =
  'Used by the Riverside team and its instructor to trace each delivery, storage and scheduling decision to the stakeholder concern it serves, and to show the health department and funders which concerns each part of the network addresses.'

/** The lab tool's output for the fixture team record, imported exactly as a student's file is (JSON text). */
export function fixtureModel() {
  const r = importFile(JSON.stringify(teamModelInputs(TEAM_FIXTURE, '2026-10-19')))
  if ('error' in r || r.kind !== 'week1') throw new Error('the fixture team record must import')
  return { source: r.source, model: generateSysml(r.source, { purpose: FIXTURE_PURPOSE, date: '2026-10-19' }) }
}

export const STRESS_FILE = 'lectures/week08/labtool_stress_model_v01.sysml'

/** An adversarial but importable team record: quotes, a backslash and a comment terminator in names and text, names
 *  that camel-case to reserved words, duplicate and empty names, names that would hide a package or a definition the
 *  generated text refers to ("Context", "context", "Physical", "soi", single lower-case words), an unrated stakeholder,
 *  a relationship without a type and one whose end is not a registered stakeholder (the one defect class: it must be
 *  left out). The generated file must still pass the checker. */
export function stressRecord(): TeamRecord {
  const t = structuredClone(TEAM_FIXTURE)
  t.proposal.name = 'O’Neil “Quick” Relief \\ Network */ Co'
  t.context[0].name = 'Public'
  t.context[1].name = 'part'
  t.context[2].name = ''
  t.context[3].name = 'context'
  t.context[4].name = 'Physical'
  t.context[5].name = 'weather'
  t.stakeholders[7].name = 'Context'
  t.proposal.inside[0].name = 'soi'
  t.proposal.inside[2].name = 'warehouse'
  t.stakeholders[0].name = 'Families who say "it’s */ late"'
  t.stakeholders[1].name = 'Volunteer drivers'
  t.stakeholders[2].influence = ''
  t.stakeholders[4].name = ''
  t.stakeholders[5].concerns = []
  t.stakeholders[6].concerns[0].text = 'Ends with a backslash \\ and a terminator */ inside.'
  t.proposal.inside[1].name = ''
  t.relationships.push({ id: 'REL-004', from: 'STK-001', to: 'STK-099', type: 'funds', note: 'Dangling end: must be left out.' })
  t.relationships.push({ id: 'REL-005', from: 'STK-003', to: 'STK-006', type: '', note: 'No type chosen.' })
  return t
}
export function stressModel() {
  const r = importFile(JSON.stringify(teamModelInputs(stressRecord(), '2026-10-19')))
  if ('error' in r || r.kind !== 'week1') throw new Error(`the stress record must import: ${'error' in r ? r.error : r.kind}`)
  return { source: r.source, model: generateSysml(r.source, { purpose: '', date: '2026-10-19' }) }
}

export const COLLISION_FILE = 'lectures/week08/labtool_collision_model_v01.sysml'

/** Register names that collide with another element's name or ID in the same namespace, or with a feature every concern
 *  inherits (Week 8 confirmation review, N5): a stakeholder named like another stakeholder's ID, an external system
 *  named like the enterprise's ID, another external system's ID or the enterprise's name, an inside element named
 *  "System of interest" or like another inside element's ID, stakeholders named "Stakeholders" and "Result", and a name
 *  with accented and non-Latin letters. The generated file must pass the checker with no message at all. */
export function collisionRecord(): TeamRecord {
  const t = structuredClone(TEAM_FIXTURE)
  t.stakeholders[0].name = 'STK-003'
  t.stakeholders[1].name = 'Stakeholders'
  t.stakeholders[3].name = 'Result'
  t.context[0].name = 'ENT-001'
  t.context[1].name = 'EXT-003'
  t.context[2].name = t.proposal.name
  t.context[3].name = 'Ångström météo 東京'
  t.proposal.inside[0].name = 'System of interest'
  t.proposal.inside[1].name = 'PRT-003'
  return t
}
export function collisionModel() {
  const r = importFile(JSON.stringify(teamModelInputs(collisionRecord(), '2026-10-19')))
  if ('error' in r || r.kind !== 'week1') throw new Error(`the collision record must import: ${'error' in r ? r.error : r.kind}`)
  return { source: r.source, model: generateSysml(r.source, { purpose: 'Probe of register names that collide; FICTIONAL.', date: '2026-10-19' }) }
}

export function GENERATED_FILES(): { file: string; text: string }[] {
  return [
    { file: AEROLINK_MODEL_FILE, text: AEROLINK_MODEL.text },
    { file: FIXTURE_FILE, text: fixtureModel().model.text },
    { file: STRESS_FILE, text: stressModel().model.text },
    { file: COLLISION_FILE, text: collisionModel().model.text },
  ]
}
