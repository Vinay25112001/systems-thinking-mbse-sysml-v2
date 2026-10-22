// The Week 1 digital textbook (Learn), Milestone M4 part A. Spec: docs/week1/spec/WEEK1_DESIGN_SPECIFICATION.md §d
// (LRN-01: eleven chapters, titles and order of docs/week1/WEEK1_TEXTBOOK_IA.md §2); content IDs per §d.1
// (`w01.learn.chNN-nn`). This module ASSEMBLES existing, reviewed text: every lesson part below points at a block of the
// Week 1 student lesson (src/content/lectures/week01/session1.ts, session2.ts) by section id and block index, optionally
// cut to a sentence range; nothing is retyped. Other reused text comes from the dormant Week 1 modules (week1.ts,
// learn/week01.ts) by reference. No definition or attribution is changed (§5, §20). The NEW prose the IA called for (gaps
// G1–G10 and the course-framing sections) was written in M4 part B and lives in authored.ts, placed here by reference
// (N(...)). A section that still needed prose would carry a `gap` (gaps.ts) rendering a faculty-facing placeholder in the
// instructor edition only (never in the student build); after M4b the list is empty. learn.test.tsx proves that every lesson block is placed exactly
// once or excluded with a reason, and that every legacy id resolves.
// Content modules never import React.
import { WEEK01_SESSION1 } from '../../content/lectures/week01/session1'
import { WEEK1_SESSION2 } from '../../content/lectures/week01/session2'
import type { Lecture, LessonBlock, LessonSection } from '../../content/lectures/types'
import { BOUNDARY_QUESTION, PRINCIPLES, WEEK1_BLOCKS } from '../../content/week1'
import { MEET_AEROLINK } from '../../content/learn/week01'
import type { Citation } from '../../content/readings'
import { sentences } from '../../content/learn/resolve'
import { IS_STUDENT_EDITION } from '../../lib/edition'
import { GAPS_SOURCE, GAP_LABEL as GAP_LABEL_SOURCE } from './gaps'
import * as NEW from './authored'
import { isWithdrawn } from './published' // publishing (M3)

export const LESSONS: Record<string, { lecture: Lecture; section: LessonSection }> = Object.fromEntries(
  [WEEK01_SESSION1, WEEK1_SESSION2].flatMap((lecture) => lecture.studentLesson.map((section) => [section.id, { lecture, section }])),
)

/** A placed piece of a section. */
export type Part =
  /** Lesson blocks by index (inclusive range); `sentences` cuts one paragraph to a sentence range. */
  | { kind: 'lesson'; lesson: string; from: number; to?: number; sentences?: [number, number] }
  /** A block assembled from another existing module (origin names it, for review). */
  /** `optional`: extension reading, shown in a labelled box and not counted in the required reading time (faculty
   *  decision 2026-10-21, "mark some sections optional"; M4b review packages A–C). */
  | { kind: 'reuse'; origin: string; block: LessonBlock; cites?: Citation[]; optional?: boolean }
  /** An interactive figure (spec §d.9). */
  | { kind: 'interactive'; id: InteractiveId }

/** The interactive figures (spec §d.9): IF-1 boundary explorer, IF-6 stakeholder ecosystem map, IF-7 progressive trace. */
export type InteractiveId = 'IF-1' | 'IF-6' | 'IF-7'

/** A gap the IA asks new prose for (§d.10). Shown only to faculty, as "Section in preparation (pending verified source)". */
export type Gap = { id: string; words: number; need: string }

export type Section = {
  /** Canonical short id `chNN-nn`; the store key is `w01.learn.chNN-nn`. */
  id: string
  title: string
  /** Earlier ids that resolve here (lesson section ids it opens with). */
  legacy?: string[]
  parts: Part[]
  /** Knowledge check placed AFTER the section's instruction (LRN-03): a Learn check id (c1…c7) or a quiz id (w1q-n). */
  check?: string
  /** Glossary terms (learn/week01.ts keyTerms) shown in "Definitions here". */
  terms?: string[]
  /** A link that closes the section (LRN-05: 11.5 points to My Project / Lab, where the procedure now lives). */
  link?: { to: string; label: string }
}

export type Chapter = {
  id: string
  no: number
  title: string
  sections: Section[]
  /** MODEL_INPUTS row ids: what the chapter feeds in Week 2 / Week 8 ("Used later"). */
  later: string[]
  /** AeroLink-at-a-glance card keys (aerolinkGlance.ts). */
  glance: string[]
}

const L = (lesson: string, from: number, to = from): Part => ({ kind: 'lesson', lesson, from, to })
const S = (lesson: string, block: number, sentences: [number, number]): Part => ({ kind: 'lesson', lesson, from: block, to: block, sentences })
const W1 = (id: string) => {
  const b = WEEK1_BLOCKS.find((x) => x.id === id)
  if (!b) throw new Error(`Unknown week1.ts block ${id}`)
  return b
}
/** Paragraphs of a reviewed week1.ts block; its citations attach to the last paragraph as footnotes. */
const week1Paras = (id: string, paras?: number[]): Part[] => {
  const b = W1(id)
  const idx = paras ?? b.paragraphs.map((_, i) => i)
  return idx.map((i, k) => ({ kind: 'reuse', origin: `week1.ts ${id} ¶${i + 1}`, block: { kind: 'para', text: b.paragraphs[i] }, ...(k === idx.length - 1 && b.citations.length ? { cites: b.citations } : {}) }))
}
const worked = W1('w1-worked')
/** New prose of M4 part B (authored.ts), placed by reference; `origin` names the gap it fills, for review. */
const N = (gap: string, blocks: LessonBlock[]): Part[] => blocks.map((block) => ({ kind: 'reuse', origin: `authored.ts (M4b, ${gap})`, block }))
/** Extension reading (optional, not counted): the same, flagged optional. */
const X = (gap: string, blocks: LessonBlock[]): Part[] => blocks.map((block) => ({ kind: 'reuse', origin: `authored.ts (M4b, ${gap}, extension)`, block, optional: true }))

/** Faculty-approved wording for the realism note (FQ-1 option a, DECISION_LOG A25). */
export const FAA_NOTE = 'A real regulator, the FAA, is named for realism; its role is simplified, and nothing here describes actual FAA requirements or processes. AeroLink and its numbers are fictional teaching assumptions.'
/** Faculty-approved wording for the objectives term (FQ-2 option a, DECISION_LOG A25). */
/** (The register citation, SEBoK p.544, is attached as a footnote where the note is placed.) */
export const OBJECTIVES_NOTE = 'SEBoK lists the mission, goals and objectives as outputs of Business or Mission Analysis; this course records them as one mission (MGO-001) and its objectives (MGO-002…).'
/** The reading plan (IA §1.2, spec §c block 8). */
export const READING_PLAN = 'Before Session 2 read chapters 1–6 and 11; before writing needs, chapters 7–10.'

export const CHAPTERS: Chapter[] = [
  {
    id: 'ch01',
    no: 1,
    title: 'Week 1 in context, and the AeroLink case',
    later: ['soi', 'mgo'],
    glance: ['enterprise', 'facts', 'mission'],
    sections: [
      { id: 'ch01-01', title: 'Why Week 1 matters', legacy: ['s1-lesson-why'], parts: [L('s1-lesson-why', 0, 1), S('s1-lesson-why', 2, [0, 3]), L('s1-lesson-why', 3), L('s1-lesson-why', 6)] },
      {
        id: 'ch01-02',
        title: 'How this textbook and the week fit together',
        parts: [
          { kind: 'reuse', origin: 'spec §a block 8 (course framing)', block: { kind: 'bullets', items: ['**Overview**: what the week covers, what you will create, time and readings.', '**Learn**: this textbook, with definitions, sources, methods and AeroLink worked examples.', '**Guided Practice**: apply each method to AeroLink, with explained feedback.', '**My Project / Lab**: apply it to your team’s own enterprise.', '**Review & Submit**: check your work against the criteria and submit it.'] } },
          ...N('ch01-02 course framing', NEW.CH01_02),
          { kind: 'reuse', origin: 'IA §1.2 reading plan', block: { kind: 'para', text: `Reading plan: ${READING_PLAN}` } },
        ],
      },
      {
        id: 'ch01-03',
        title: 'Meet AeroLink: the enterprise, its problem and its mission',
        parts: [
          S('s1-lesson-why', 4, [0, 2]),
          L('s1-lesson-why', 5),
          // MEET_AEROLINK.conops is not reused: it reads DATA_SHEET (src/model/airtaxi.ts), and Learn takes case facts from
          // aerolinkCase.ts only (spec §d.5, QG-03). The operating concept comes from the Week 2 scenarios (G10-partial, M4b).
          ...N('G10-partial', NEW.CH01_03),
        ],
      },
      {
        id: 'ch01-04',
        title: 'What is real and what is a teaching assumption',
        parts: [{ kind: 'reuse', origin: 'DECISION_LOG A25 (FQ-1 a)', block: { kind: 'callout', tone: 'note', title: 'Real and fictional', text: FAA_NOTE } }, ...N('G10', NEW.CH01_04)],
      },
      {
        id: 'ch01-05',
        title: 'How the course uses AeroLink, and how you adapt the methods',
        parts: [{ kind: 'reuse', origin: 'learn/week01.ts MEET_AEROLINK.use', block: { kind: 'para', text: MEET_AEROLINK.use.text } }, ...N('ch01-05 course framing', NEW.CH01_05)],
      },
    ],
  },
  {
    id: 'ch02',
    no: 2,
    title: 'Engineered systems',
    later: ['soi'],
    glance: ['soi'],
    sections: [
      { id: 'ch02-01', title: 'Why engineers need a shared idea of “system”', parts: week1Paras('w1-intuition') },
      { id: 'ch02-02', title: 'What systems engineering is for', legacy: ['s1-lesson-system'], parts: [L('s1-lesson-system', 0, 1)] },
      { id: 'ch02-03', title: 'Three definitions of system', parts: [L('s1-lesson-system', 3, 5)], terms: ['System'] },
      { id: 'ch02-04', title: 'Elements, interactions, purpose and emergence: a primer', parts: [...N('G2', NEW.CH02_04), ...X('G2', NEW.CH02_04_EXT)] },
      { id: 'ch02-05', title: 'An engineered system lives in a context', parts: [L('s1-lesson-system', 7, 8)] },
      { id: 'ch02-06', title: 'System of interest and enabling systems', legacy: ['s1-lesson-soi'], parts: [L('s1-lesson-soi', 0, 2)], check: 'w1q-3', terms: ['System of interest'] },
    ],
  },
  {
    id: 'ch03',
    no: 3,
    title: 'Systems thinking and the enterprise',
    later: ['soi'],
    glance: ['enterprise'],
    sections: [
      { id: 'ch03-01', title: 'What systems thinking is', parts: [...N('G1', NEW.CH03_01), ...X('G1', NEW.CH03_01_EXT), ...N('G1', NEW.CH03_01_END)] },
      { id: 'ch03-02', title: 'The paradox, and how engineers proceed anyway', parts: week1Paras('w1-paradox') },
      {
        id: 'ch03-03',
        title: 'Principles of systems thinking',
        parts: [
          {
            kind: 'reuse',
            origin: 'week1.ts PRINCIPLES',
            block: { kind: 'table', caption: 'Eight principles of systems thinking, each with an AeroLink illustration (AeroLink is a fictional teaching case).', header: ['Principle', 'Statement', 'On AeroLink'], rows: PRINCIPLES.map((p) => [p.name, `${p.statement} (${p.cite.reading} p.${p.cite.pages})`, p.aerolink]) },
          },
        ],
      },
      { id: 'ch03-04', title: 'Analysis and synthesis', parts: [...week1Paras('w1-analysis-synthesis'), { kind: 'reuse', origin: 'week1.ts w1-worked bullet 4', block: { kind: 'para', text: worked.bullets![3] }, cites: worked.citations }] },
      { id: 'ch03-05', title: 'The enterprise is not the organization', parts: [L('s1-lesson-soi', 4, 6)], check: 'c2', terms: ['Enterprise', 'Enterprise versus organization'] },
    ],
  },
  {
    id: 'ch04',
    no: 4,
    title: 'Boundaries, context and operational environments',
    later: ['inside', 'context', 'crosses'],
    glance: ['soi', 'context'],
    sections: [
      { id: 'ch04-01', title: 'A boundary is chosen for a question', legacy: ['s1-lesson-boundary'], parts: [L('s1-lesson-boundary', 0), { kind: 'interactive', id: 'IF-1' }, L('s1-lesson-boundary', 1)], check: 'w1q-2', terms: ['Systemic resolution'] },
      { id: 'ch04-02', title: 'Boundary, environment, context: the vocabulary', parts: [L('s1-lesson-boundary', 3, 5)], terms: ['System context', 'Reductionism and holism', 'Boundary'] },
      // review M4b F3: the four layers come before the operational environment, which builds on them (ids unchanged,
      // so ch04-04 is shown as 4.3 and ch04-03 as 4.4)
      { id: 'ch04-04', title: 'Four layers of a context', parts: [L('s1-lesson-boundary', 7, 9)], terms: ['External system or actor (EXT)'] },
      { id: 'ch04-03', title: 'The operational environment', parts: [...N('G8', NEW.CH04_03), ...X('G8', NEW.CH04_03_EXT)] },
      { id: 'ch04-05', title: 'A boundary is a decision: control, influence and power', parts: [L('s1-lesson-boundary', 10, 11), ...N('ch04-05 owners of constraints', NEW.CH04_05)], check: 'c3' },
    ],
  },
  {
    id: 'ch05',
    no: 5,
    title: 'From mission to stakeholders to needs',
    later: ['mgo'],
    glance: ['mission'],
    sections: [
      { id: 'ch05-01', title: 'Life cycle and its stages', legacy: ['s1-lesson-lifecycle'], parts: [L('s1-lesson-lifecycle', 0, 2)] },
      { id: 'ch05-02', title: 'The ISO/IEC/IEEE 15288 process frame', parts: [L('s1-lesson-lifecycle', 4, 6)] },
      {
        id: 'ch05-03',
        title: 'What Business or Mission Analysis hands over: problem, mission, objectives, stakeholders',
        parts: [L('s1-lesson-lifecycle', 8, 10), { kind: 'reuse', origin: 'DECISION_LOG A25 (FQ-2 a)', block: { kind: 'para', text: OBJECTIVES_NOTE }, cites: [{ reading: 'R10', pages: '544' }] }, ...X('G9', NEW.CH05_03_EXT)],
      },
      { id: 'ch05-04', title: 'Mission ↔ stakeholders ↔ needs: how they constrain each other', parts: N('G4/G5', NEW.CH05_04) },
    ],
  },
  {
    id: 'ch06',
    no: 6,
    title: 'Identifying and classifying stakeholders',
    later: ['stakeholders'],
    glance: ['register', 'faa'],
    sections: [
      { id: 'ch06-01', title: 'Who counts as a stakeholder', legacy: ['s1-lesson-stakeholders'], parts: [L('s1-lesson-stakeholders', 0, 2)], check: 'c4', terms: ['Stakeholder'] },
      { id: 'ch06-02', title: 'Why find them all, and early', parts: [L('s1-lesson-stakeholders', 3, 4)] },
      { id: 'ch06-03', title: 'Three identification methods', parts: [L('s1-lesson-stakeholders', 5, 13)], terms: ['Life-cycle stakeholders', 'Directly and indirectly impacted'] },
      { id: 'ch06-04', title: 'Approving authorities', parts: [L('s1-lesson-stakeholders', 15, 16), { kind: 'reuse', origin: 'DECISION_LOG A25 (FQ-1 a)', block: { kind: 'callout', tone: 'note', title: 'Real and fictional', text: FAA_NOTE } }], check: 'w1q-6', terms: ['Approving authority', 'Internal and external stakeholders'] },
      { id: 'ch06-05', title: 'Classifying stakeholders: the register', legacy: ['s1-lesson-classifying'], parts: [L('s1-lesson-classifying', 0, 2), S('s2-l-concerns', 7, [2, 2])], terms: ['Stakeholder register'] },
      { id: 'ch06-06', title: 'Checking the list: which method finds whom', parts: [L('s1-lesson-classifying', 4, 7)] },
      { id: 'ch06-07', title: 'Worked example: the AeroLink context and register', legacy: ['s2-l-case-register'], parts: [L('s2-l-case-register', 0, 10)] },
    ],
  },
  {
    id: 'ch07',
    no: 7,
    title: 'Concerns, interests and relationships',
    later: ['concerns', 'relationships'],
    glance: ['register', 'conflict'],
    sections: [
      { id: 'ch07-01', title: 'Concerns: the hinge between stakeholders and needs', legacy: ['s2-l-concerns'], parts: [L('s2-l-concerns', 0, 5)], check: 'c5' },
      { id: 'ch07-02', title: 'Interest, influence and support', parts: [L('s2-l-concerns', 8, 9), ...N('G7a', NEW.CH07_02)], terms: ['Influence and support'] },
      { id: 'ch07-03', title: 'Relationships between stakeholders, and recording conflict', parts: [L('s2-l-concerns', 10), ...N('G7b', NEW.CH07_03), { kind: 'interactive', id: 'IF-6' }, L('s2-l-case-register', 13, 14)] },
      { id: 'ch07-04', title: 'Worked example: AeroLink’s concerns', parts: [L('s2-l-case-register', 11)] },
    ],
  },
  {
    id: 'ch08',
    no: 8,
    title: 'Eliciting needs',
    later: ['needs'],
    glance: ['register'],
    sections: [
      { id: 'ch08-01', title: 'Elicitation as a method choice', legacy: ['s2-l-elicitation'], parts: [L('s2-l-elicitation', 0, 2)], terms: ['Elicitation'] },
      { id: 'ch08-02', title: 'Interviews and surrogates', parts: [L('s2-l-elicitation', 4)] },
      { id: 'ch08-03', title: 'What to ask, and finding the real need', parts: [L('s2-l-elicitation', 6, 8)], check: 'w1q-9', terms: ['Rationale'] },
      { id: 'ch08-04', title: 'Worked example: an elicitation plan for AeroLink', parts: [...N('ch08-04 plan intro', NEW.CH08_04_INTRO), L('s2-l-elicitation', 3)] },
    ],
  },
  {
    id: 'ch09',
    no: 9,
    title: 'Needs, requirements and proposed solutions',
    later: ['needs'],
    glance: ['needs', 'conflict', 'faa'],
    sections: [
      { id: 'ch09-01', title: 'Two perspectives: need and requirement', legacy: ['s2-l-needs-reqs'], parts: [L('s2-l-needs-reqs', 0, 3)], terms: ['Stakeholder needs', 'System requirement'] },
      { id: 'ch09-02', title: 'The transformation is analysis, not rewording', parts: [L('s2-l-needs-reqs', 5, 7)], check: 'c6' },
      { id: 'ch09-03', title: 'The integrated set of needs, and why it is kept', legacy: ['s2-l-integrated-set'], parts: [L('s2-l-integrated-set', 0, 6)], terms: ['Integrated set of needs'] },
      { id: 'ch09-04', title: 'Well-formed needs: three layers of quality, and the course gate', legacy: ['s2-l-well-formed'], parts: [L('s2-l-well-formed', 0, 8)], terms: ['Need statement', 'Independent of solution approach', 'Conditions of action'] },
      { id: 'ch09-05', title: 'Proposed solutions, design words and the level problem', parts: [L('s2-l-well-formed', 10, 12)], check: 'c7' },
      { id: 'ch09-06', title: 'Conflict, priority and adjudication', legacy: ['s2-l-conflict'], parts: [L('s2-l-conflict', 0, 9)] },
      { id: 'ch09-07', title: 'Worked example: from concern to need in six steps, and the reference set', legacy: ['s2-l-case-needs'], parts: [L('s2-l-case-needs', 0, 7)], terms: ['Source and trace', 'Need ID'] },
      { id: 'ch09-08', title: 'Error and correction table', legacy: ['s2-l-errors'], parts: [L('s2-l-errors', 0, 1)] },
    ],
  },
  {
    id: 'ch10',
    no: 10,
    title: 'Traceability foundations and the road to Week 8',
    later: ['stakeholders', 'concerns', 'needs'],
    glance: ['needs'],
    sections: [
      { id: 'ch10-01', title: 'Identifiers are engineering data', parts: [S('s1-lesson-why', 2, [4, 5]), ...N('G6a', NEW.CH10_01)], terms: ['Stable ID'] },
      { id: 'ch10-02', title: 'The Week 1 trace chain: enterprise → mission → stakeholder → concern → need', parts: [...N('G6b', NEW.CH10_02), { kind: 'interactive', id: 'IF-7' }] },
      { id: 'ch10-03', title: 'Auditing the set: coverage and conflict', legacy: ['s2-l-case-audit'], parts: [L('s2-l-case-audit', 0, 6)] },
      { id: 'ch10-04', title: 'Why each method, and what it feeds', legacy: ['s2-l-why-methods'], parts: [L('s2-l-why-methods', 0, 2)] },
      { id: 'ch10-05', title: 'Toward Week 2 and Week 8', legacy: ['s2-l-bridge'], parts: [L('s2-l-bridge', 0), S('s2-l-bridge', 1, [0, 3]), ...X('ch10-05 model inputs', NEW.CH10_05_EXT), L('s2-l-bridge', 2)] },
    ],
  },
  {
    id: 'ch11',
    no: 11,
    title: 'Forming the team and choosing the enterprise',
    later: ['soi'],
    glance: ['enterprise'],
    sections: [
      { id: 'ch11-01', title: 'What makes a team, and what an IPT is', legacy: ['s1-lesson-teams'], parts: [L('s1-lesson-teams', 0, 3)] },
      { id: 'ch11-02', title: 'Roles and communication paths', parts: [L('s1-lesson-teams', 5, 8)], terms: ['Lead role'] },
      { id: 'ch11-03', title: 'The charter, norms and how teams develop', parts: [L('s1-lesson-teams', 10, 12)], check: 'c1', terms: ['Team charter', 'Decision rule', 'Owned ID prefix'] },
      { id: 'ch11-04', title: 'Choosing your team’s enterprise', parts: [S('s1-lesson-why', 4, [3, 4]), ...N('G3', NEW.CH11_04), ...X('G3', NEW.CH11_04_EXT)], check: 'w1q-5', terms: ['Enterprise proposal'] },
      { id: 'ch11-05', title: 'What you will produce this week', legacy: ['s2-l-lab'], parts: [L('s2-l-lab', 0)], link: { to: '/week/1/project', label: 'Open My Project / Lab: the brief with every minimum' } },
    ],
  },
]

/** Lesson blocks deliberately not placed in a chapter, with the reason (learn.test.tsx checks the list is exact). */
export const NOT_PLACED: { lesson: string; block: number; reason: string; sentences?: [number, number] }[] = [
  { lesson: 's1-lesson-system', block: 2, reason: 'heading, now the title of 2.3' },
  { lesson: 's1-lesson-system', block: 6, reason: 'heading, now the title of 2.5' },
  { lesson: 's1-lesson-soi', block: 3, reason: 'heading, now the title of 3.5' },
  { lesson: 's1-lesson-boundary', block: 2, reason: 'heading, now the title of 4.2' },
  { lesson: 's1-lesson-boundary', block: 6, reason: 'heading, now the title of 4.4' },
  { lesson: 's1-lesson-lifecycle', block: 3, reason: 'heading, now the title of 5.2' },
  { lesson: 's1-lesson-lifecycle', block: 7, reason: 'heading, now the title of 5.3' },
  { lesson: 's1-lesson-teams', block: 4, reason: 'heading, now the title of 11.2' },
  { lesson: 's1-lesson-teams', block: 9, reason: 'heading, now the title of 11.3' },
  { lesson: 's1-lesson-stakeholders', block: 14, reason: 'heading, now the title of 6.4' },
  { lesson: 's1-lesson-classifying', block: 3, reason: 'heading, now the title of 6.6' },
  { lesson: 's1-lesson-classifying', block: 8, reason: 'placed in the back matter (Week 1 in one page)' },
  { lesson: 's1-lesson-classifying', block: 9, reason: 'placed in the back matter (Week 1 in one page)' },
  { lesson: 's1-lesson-classifying', block: 10, reason: 'placed in the back matter (Week 1 in one page)' },
  { lesson: 's2-l-concerns', block: 6, reason: 'heading; its paragraph merges into 6.5' },
  // review M4A F8: the first two sentences restate 6.5's opening paragraphs (s1-lesson-classifying 0 and 1, same sources,
  // R11 p.553 and R63 p.234); the third (the course register adds the level of support) is kept in 6.5
  { lesson: 's2-l-concerns', block: 7, sentences: [0, 1], reason: 'repeats 6.5 paragraphs 1 and 2 (SEBoK register; MITRE stakeholder management); dropped as a duplicate. The kept third sentence renders as its one new item, the level of support with a reason (review N4, studentText.ts)' },
  { lesson: 's2-l-needs-reqs', block: 4, reason: 'heading, now the title of 9.2' },
  { lesson: 's2-l-well-formed', block: 9, reason: 'heading, now the title of 9.5' },
  { lesson: 's2-l-elicitation', block: 5, reason: 'heading, now the title of 8.3' },
  { lesson: 's2-l-case-register', block: 12, reason: 'heading, now the title of 7.3' },
  { lesson: 's2-l-lab', block: 1, reason: 'lab procedure: moved to My Project / Lab (LRN-05; the lab page carries it)' },
  { lesson: 's2-l-lab', block: 2, reason: 'lab procedure: moved to My Project / Lab (LRN-05)' },
  { lesson: 's2-l-lab', block: 3, reason: 'lab procedure: moved to My Project / Lab (LRN-05)' },
  { lesson: 's2-l-references', block: 0, reason: 'rebuilt as the References back matter from the same generated list' },
  { lesson: 's2-l-references', block: 1, reason: 'rebuilt as the References back matter from the same generated list' },
  { lesson: 's2-l-references', block: 2, reason: 'rebuilt as the References back matter' },
  { lesson: 's2-l-references', block: 3, reason: 'rebuilt as the References back matter' },
]

export const BACK_MATTER: { id: 'refs' | 'glossary' | 'summary'; title: string }[] = [
  { id: 'refs', title: 'References and credits' },
  { id: 'glossary', title: 'Glossary' },
  { id: 'summary', title: 'Week 1 in one page' },
]

/** The resolved blocks of a part (sentence cuts applied). */
export function partBlocks(p: Part): LessonBlock[] {
  if (p.kind === 'reuse') return [p.block]
  if (p.kind === 'interactive') return []
  const ls = LESSONS[p.lesson]
  if (!ls) throw new Error(`Unknown lesson section ${p.lesson}`)
  const to = p.to ?? p.from
  const blocks = ls.section.blocks.slice(p.from, to + 1)
  if (blocks.length !== to - p.from + 1) throw new Error(`${p.lesson} has no blocks ${p.from}–${to}`)
  if (!p.sentences) return blocks
  const b = blocks[0]
  if (b.kind !== 'para') throw new Error(`${p.lesson} block ${p.from} is not a paragraph`)
  const s = sentences(b.text)
  const [a, z] = p.sentences
  if (z >= s.length) throw new Error(`${p.lesson} block ${p.from} has ${s.length} sentences, not ${z + 1}`)
  return [{ kind: 'para', text: s.slice(a, z + 1).join(' ') }]
}

/** Faculty-facing gaps, empty in the student edition (the condition is a compile-time constant, so gaps.ts is dropped). */
export const GAPS: Record<string, Gap> = IS_STUDENT_EDITION ? {} : GAPS_SOURCE
export const GAP_LABEL: string = IS_STUDENT_EDITION ? '' : GAP_LABEL_SOURCE
/** A section with no placed text yet is left out of the student edition (its content id stays reserved). */
// --- publishing ---
/** A section archived (withdrawn) on the course server is also left out (M3, published.ts), so every list and the
 *  gap-free numbering below follow the published state. */
export const visibleInEdition = (s: Section) => (s.parts.length > 0 || !IS_STUDENT_EDITION) && !isWithdrawn(s.id)
// --- end publishing ---

/** The section number the current edition shows (review M4A F6, FD-b default: renumber). Visible sections are numbered
 *  1, 2, 3 … within their chapter, so a student never sees a gap (2.3 → 2.5); the content id (`w01.learn.chNN-nn`), the
 *  progress key and every link keep the canonical id. The instructor edition shows every section, so its numbers equal
 *  the canonical ones. */
export function displayNumber(sectionId: string): string {
  const ch = CHAPTERS.find((c) => c.sections.some((s) => s.id === sectionId))
  if (!ch) throw new Error(`Unknown Learn section ${sectionId}`)
  const visible = ch.sections.filter(visibleInEdition)
  const i = visible.findIndex((s) => s.id === sectionId)
  return i < 0 ? '' : `${ch.no}.${i + 1}`
}

export const chapterById = (id: string) => CHAPTERS.find((c) => c.id === id)
export const allSections = () => CHAPTERS.flatMap((c) => c.sections.map((s) => ({ chapter: c, section: s })))
export const sectionById = (id: string) => allSections().find((x) => x.section.id === id)
export const contentId = (sectionId: string) => `w01.learn.${sectionId}`

/** The lecture a lesson part belongs to (for slide figures). */
export const lectureOf = (lesson: string): Lecture => LESSONS[lesson].lecture

export { BOUNDARY_QUESTION }
