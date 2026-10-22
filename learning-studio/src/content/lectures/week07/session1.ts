// Week 7, Session 1 lecture: Final Presentation — the Phase I engineering package and its design review. What a Phase I
// package is for (a baseline that Phase II starts from), what it contains and the executive summary that opens it; one
// enterprise, one ID, one meaning; bidirectional traceability, requirement verification and validation, the audit's
// coverage metrics and dispositions, worked on AeroLink (one thread from a need to the roadmap, and the package audit);
// what a technical review is, how it is prepared, conducted and completed, the course's entry and exit criteria and roles,
// the SRR as the closest professional analogy, and readiness for model-based implementation in Week 8; then an
// integration studio on the team's own exports. 75-minute session: 69 minutes of planned content on 21 slides plus the
// generated "References and credits" slide, and a 6-minute buffer (bufferMinutes). Single source for the slide viewer, the
// faculty notes, the .pptx and the student lesson (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20 (teach
// first), A21 (the Week 1 architecture is the template; decision 7, Weeks 7 and 14 are engineering reviews and
// presentations; decision 10, traceability maintained across the course), A22 (one continuous engineering journey) and A24
// (content on the current lecture template).
//
// Review status: new-pending-review. Written 2026-10-21 from docs/lectures/week07/WEEK07_LECTURE_OUTLINE.md §2, revised
// by the integrator's Week 7 brief (Session 1: the package and the review; Session 2: presenting and defending).
//
// Accuracy rules followed:
//   - Every citation is a verified register entry (readings.generated.json) at a page whose extracted text
//     (_source_cache/*.txt) supports the claim beside it. No new register entry is used: the System Functional Review
//     pages of the DoD guidebook (pp.73–74) are not in the register, so the SFR is not cited (proposal in
//     docs/lectures/week07/WEEK7_PENDING_READINGS.md).
//   - Source gaps are named where they bite: no held source defines a "Systems Thinking Engineering Package"; its
//     structure, the audit layers, the dispositions, the entry and exit criteria, the review roles and the timing are
//     course conventions, and the slides say so.
//   - AeroLink Urban Mobility is FICTIONAL. Weeks 1–6 data are imported read-only; Week 7 data come from ./aerolinkCase.ts.
//     Counts, coverage figures and the thread on the slides and in the notes are computed there, not typed here.
//   - Timing: spoken notes (teach, worked solution, figure walk) stay between 40 and 130 words per minute (./timing.test.ts).
//   - Faculty notes and purposes are stripped from the student build (student-edition.ts).
import type { Lecture } from '../types'
import { AUDIT, COVERAGE, DRIVING_QUESTION, dropText, EXEC_SUMMARY, FINDINGS, PACKAGE_ID_COUNT, THREAD, THREAD_START, coverage, findingsOf, plural } from './aerolinkCase'
import { DECISION } from '../week03/aerolinkCase'
import { ENTRY_CRITERIA, EXIT_CRITERIA, PACKAGE_SECTIONS, SOURCE_WEEKS } from './labBrief'

export const WEEK7_S1_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const A = AUDIT
const covText = COVERAGE.map((c) => `${c.label.toLowerCase()}: ${c.covered} of ${c.total} (${c.pct} %)`).join('; ')
const hops = THREAD.map((h) => h.id)
const lastHop = THREAD[THREAD.length - 1]
const stale = findingsOf('stale-disposition')
const stk = coverage('stk-sys')
const phy = coverage('arch-if')

export const WEEK7_SESSION1: Lecture = {
  week: 7,
  session: 1,
  title: 'Final Presentation',
  subtitle: 'Session 1: The Phase I engineering package and its design review',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. framing (6 min)
    {
      id: 'w7s1-framing',
      title: 'Framing: from six weeks of work to one baseline',
      slides: [
        {
          id: 'w7s1-title',
          title: 'Final Presentation',
          subtitle: 'Session 1: The Phase I engineering package and its design review',
          purpose: 'Orient students to the scheduled subject, the two sessions and what the week produces.',
          minutes: 1,
          layout: 'title',
          body: [{ kind: 'bullets', items: ['Today: the package, its audit and the design review', 'Session 2: presenting and defending your decisions; the review itself', 'Your output: the Systems Thinking Engineering Package'] }],
          sources: [],
          notes: {
            teach: [
              'Read the subject as the schedule gives it: Final Presentation, the end of Phase I. No new method this week. Today we learn what a Phase I engineering package is for, how to check it for consistency and completeness, and how a design review works. Session 2 is about presenting and defending engineering decisions, and then the review itself.',
              'Each team integrates its own Weeks 1 to 6 work. AeroLink remains the worked example: I will show you my own package and my own review findings, including the ones that embarrassed me.',
            ],
            why: 'Naming the product and the review at the start tells students that this week is assessed on integration and judgment, not on new content.',
            examples: ['Instructor preparation (not for students): have every team’s Week 6 export uploaded before this session, so the studio can run on real files. Decide the review order and the peer pairings before class.'],
            misconceptions: [{ claim: 'The final presentation is a summary of what we already handed in.', correction: 'It is a review: independent reviewers check a baseline against stated criteria and decide whether it is ready for the next phase.' }],
            transition: 'Start with the question the board asks of my own package.',
            timing: '1 min: 30 s subject, 30 s the two sessions.',
          },
        },
        {
          id: 'w7s1-driving-question',
          title: 'The driving question: is the package ready to become a model?',
          purpose: 'Create a need to know: readiness is a judgment against criteria, not a count of submissions.',
          minutes: 3,
          layout: 'bullets',
          body: [
            { kind: 'callout', tone: 'note', title: 'Scenario (FICTIONAL)', text: `AeroLink’s six weekly records are done. The package holds ${PACKAGE_ID_COUNT} IDs and some items are still open. The board asks: is it ready to become the baseline of a SysML v2 model?` },
            { kind: 'bullets', items: DRIVING_QUESTION.options.map((o) => `${o.id}: ${o.text}`) },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the scenario. Six weeks of work are submitted, every week was returned with feedback, and some items are still open: unknowns, a few findings, decisions the enterprise has not made. The board now asks the Phase I question: can this package be the baseline of a model?',
              'Ask for a show of hands, or a poll, for A, B or C. Thirty seconds to think, thirty to vote. Write the counts on the board and keep them. Ask one student who chose A and one who chose B for a one-sentence reason. Expect “nothing may be open” for A and “everything was handed in” for B.',
              'Do not resolve it. Say: by the end of the lecture part we answer from my package’s own audit, and the answer turns on one word, disposition.',
            ],
            why: 'A prediction before instruction exposes the two common beliefs this week corrects: that a baseline must have nothing open, and that submission equals consistency.',
            examples: ['A building analogy: a house can pass its inspection with a list of recorded exceptions, each owned and dated; it fails when an inspector finds a defect nobody wrote down.'],
            misconceptions: [{ claim: 'A package is ready when every week has been submitted.', correction: 'Submission says the parts exist; it says nothing about whether they agree with each other. Only an audit across the weeks can say that.' }],
            transition: 'First, where this week sits.',
            timing: '3 min: 30 s scenario, 1 min vote, 1.5 min two reasons.',
          },
        },
        {
          id: 'w7s1-where',
          title: 'Where Week 7 sits: six weeks in, one model out',
          purpose: 'Show the package as the hinge between document-based Phase I and model-based Phase II.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s1-where',
            caption: 'Six weekly exports become one package; the review decides whether it is the baseline Week 8 starts from.',
            alt: 'Six small boxes on the left, labeled Week 1 to Week 6, feed arrows into one box labeled package. An arrow leads from the package through a gate labeled review to a box on the right labeled Week 8 model.',
          },
          body: [{ kind: 'bullets', items: ['Weeks 1–6: six records, six exports', 'Week 7: one package, audited and reviewed', 'Week 8: the package becomes model v0.1', 'Every inconsistency left now becomes a modeling defect'] }],
          sources: [],
          notes: {
            teach: [
              'Walk the picture from the left. Weeks 1 to 6 each produced a record and an export: stakeholders and needs, the ConOps and requirements, the technology assessment, risks and trade study, the architecture, the interfaces, the roadmap. Each was checked on its own.',
              'This week the six become one package, and the package goes through a gate: a review that decides whether it is fit to be the baseline of Phase II. In Week 8 you import it into a SysML v2 model. Every ID becomes a model element; every link becomes a relationship. An ID that means two things, or a link that points nowhere, becomes a modeling defect someone must find and fix again, at higher cost.',
            ],
            why: 'Students who see that Week 8 imports the package keep their IDs stable and fix inconsistencies now, while the fix is a re-export rather than a model repair.',
            figure: 'Point at the six week boxes, then the package, then the review gate between the package and the Week 8 model. The gate is the subject of the second half of today.',
            misconceptions: [{ claim: 'Week 8 starts fresh with a new modeling tool, so Phase I details no longer matter.', correction: 'Week 8 imports the package by ID; the model is only as consistent as the package it starts from.' }],
            transition: 'What is the package for, in the language of configuration management?',
            timing: '2 min: 1 min the left half, 1 min the gate and Week 8.',
          },
        },
      ],
    },
    // ============================================================================================ B. the package (15 min)
    {
      id: 'w7s1-package',
      title: 'The Phase I package',
      slides: [
        {
          id: 'w7s1-baseline',
          title: 'The package is a baseline: the reference point for every later change',
          purpose: 'Define the package by its function: a formally approved snapshot that Phase II changes from.',
          minutes: 3,
          layout: 'definition',
          body: [
            { kind: 'definition', term: 'Configuration baseline', text: 'A formally approved snapshot of a system’s attributes at a specific point in its development', source: R('R36', '498') },
            { kind: 'bullets', items: ['A reference point that guides and controls later change', 'Its content can be digital: models, databases, files', 'Your package: the Phase I baseline Week 8 changes from'] },
          ],
          sources: [R('R36', '498'), R('R36', '499')],
          notes: {
            teach: [
              'SEBoK’s configuration baselines article gives the function we want. A configuration baseline is a formally approved snapshot of a system’s attributes at a specific point in its development; baselines serve as reference points that guide and control subsequent changes (R36 p.498). Information is assembled into baselines at points in the life cycle as a set of consistent and immutable information, the starting point for further changes (R36 p.498).',
              'Two consequences. First, a baseline is consistent by definition: the parts agree. Second, its content is not limited to documents; it can include digital artifacts such as models, databases and files (R36 pp.498–499). Your package is both: Markdown records a reviewer reads and a JSON file a model imports.',
              'Course analogy, labeled as such: the standards name functional, allocated and product baselines (R36 p.499); our Phase I package is not one of those contractual baselines. It borrows the idea: approve one snapshot, then change from it on purpose.',
            ],
            why: 'Defining the package as a baseline explains every rule that follows: consistency, recorded exceptions and controlled change.',
            misconceptions: [{ claim: 'A baseline is a final version that will not change.', correction: 'A baseline is the reference point for change. It changes through recorded decisions, not silently.' }],
            transition: 'What does the course package contain?',
            timing: '3 min: 1 min definition, 1 min consistency and digital content, 1 min the analogy.',
          },
        },
        {
          id: 'w7s1-package-contents',
          title: 'What the package contains',
          purpose: 'Fix the structure of the package and who writes what.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s1-package-tabs',
            caption: 'The eleven sections of the package, each marked with the week that supplies it.',
            alt: `A stack of eleven tabs, top to bottom: ${PACKAGE_SECTIONS.map((s) => `${s.n} ${s.title}`).join('; ')}. Each tab carries a small label naming its week: Weeks 1 to 6 for the earlier records, Week 7 for the summary, the audit, the lessons and the AI summary.`,
          },
          body: [{ kind: 'bullets', items: ['Built from all six weekly exports', 'Plus: executive summary, consistency and trace audit', 'Plus: open items, lessons learned and an AI usage summary', 'Course convention: no source defines this package'] }],
          sources: [],
          notes: {
            teach: [
              `Walk the stack. Sections 2 to 8 come from your weekly records: enterprise and mission, stakeholders and needs, ConOps and requirements, technology, risk and the trade study, architecture, interfaces and the roadmap. The package is built from all six weekly exports, ${SOURCE_WEEKS.map((w) => `Week ${w.week}`).join(', ')}, as returned with feedback and corrected.`,
              'Four sections are new this week: the executive summary at the front; the consistency and trace audit, which the lab tool computes from your exports; the open items with the lessons learned; and the AI usage summary for the package. This structure is a course convention. No source in our collection defines a Systems Thinking Engineering Package, so we define it, and the lab tool checks it.',
              'Two files leave the tool: a Markdown package index with its readiness report, which reviewers read, and a JSON package, which Week 8 will import.',
            ],
            why: 'A fixed structure lets reviewers find things and lets the tool check that nothing is missing.',
            figure: 'Point at the tabs from the top; read the week label on a few. Note that four tabs say Week 7: those are this week’s writing.',
            misconceptions: [{ claim: 'The package is the six records stapled together.', correction: 'Stapling gives you six records. The package adds what only integration can produce: the audit across weeks, the summary and the open items.' }],
            transition: 'What does a baseline do with requirements that cannot yet be met?',
            timing: '3 min: 1 min the weekly sections, 1 min the new sections, 1 min the two files.',
          },
        },
        {
          id: 'w7s1-requirements-baseline',
          title: 'A baseline records what is open, with its history',
          purpose: 'Establish that open items are legitimate content of a baseline when they are recorded.',
          minutes: 3,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['A requirements baseline includes what could not be met', 'Approved changes are incorporated, with rationale', 'The traceability matrix keeps allocation history', 'Open is acceptable; silent is not'] },
            { kind: 'callout', tone: 'key', text: 'An owned open item is a decision. An unrecorded gap is a defect.' },
          ],
          sources: [R('R56', '389'), R('R45', '119')],
          notes: {
            teach: [
              'MITRE’s guide on assessing a design is direct: a requirements baseline is essential to traceability; there must be a trail from the original requirements set to the final capability; all approved changes must be incorporated; and the baseline should also include requirements that were not able to be met (R56 p.389).',
              'The DoD guidebook adds the instrument: the requirements traceability matrix captures every requirement, its decomposition or derivation, its allocation history and the rationale for all entries and changes (R45 p.119). History and rationale are part of the record, not decoration.',
              'So the answer to option A of the driving question is already visible. A baseline with open items is normal. What a reviewer cannot accept is a gap nobody recorded, because nobody owns it and the model will inherit it unnoticed.',
            ],
            why: 'Students otherwise hide open items to look complete, which removes exactly the information a reviewer and the Week 8 model need.',
            misconceptions: [{ claim: 'Open items make a package look unfinished, so it is better to leave them out.', correction: 'A baseline that hides what is open misleads its users; MITRE expects unmet requirements in the baseline.' }],
            transition: 'The front page that decision makers read first: the executive summary.',
            timing: '3 min: 1 min MITRE, 1 min the RTM, 1 min the consequence.',
          },
        },
        {
          id: 'w7s1-exec-summary',
          title: 'The executive summary: six fields a decision maker reads first',
          purpose: 'Give the structure of the summary, which the tool checks field by field.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s1-exec-skeleton',
            caption: 'The executive summary skeleton: six fields, each one a gate in the package tool.',
            alt: 'A one-page form with six labeled boxes, top to bottom: recommendation, why, conditions, residual risk, decisions needed, next increment. The why box holds three small ID tags; the residual risk box holds R tags.',
          },
          body: [{ kind: 'bullets', items: ['Recommendation: what you ask the decision maker to approve', 'Why: the evidence, cited by ID', 'Conditions: what must stay true', 'Residual risk: what remains, by R ID', 'Decisions needed from the reviewer', 'Next: the roadmap increment that comes next'] }],
          sources: [R('R18', '473'), R('R43', '110')],
          notes: {
            teach: [
              'SEBoK’s decision management article: describe the recommendation as a clearly worded, actionable task list, and keep a comprehensive report for traceability and future decisions (R18 p.473). The DoD decision analysis steps end the same way: synthesize, analyze sensitivities, develop a decision briefing with an action plan, and make the recommendation to the decision maker, who has full responsibility for the decision (R43 p.110).',
              'Our summary has six fields, a course convention built on those two sources. Recommendation: what you ask the decision maker to approve. Why: the evidence, cited by ID, so a reviewer can find it. Conditions: what must stay true, from your sensitivity analysis. Residual risk: what remains, by R ID. Decisions needed: what the reviewer must decide today. Next: the first roadmap increment after the baseline.',
              `AeroLink’s recommendation, from my package: ${EXEC_SUMMARY.recommendation}`,
            ],
            why: 'A fixed skeleton forces a team to say what it is asking for; a summary that only describes the project gives the reviewer nothing to decide.',
            figure: 'Point at the six boxes top to bottom; show that the why and residual risk boxes hold IDs, which is what makes them checkable.',
            misconceptions: [{ claim: 'An executive summary is a shorter version of the whole package.', correction: 'It is a request for a decision with its evidence and limits; the package is the backing report.' }],
            transition: 'The rule that makes every ID in the summary findable: one ID, one meaning.',
            timing: '3 min: 1 min the sources, 1.5 min the six fields, 30 s AeroLink.',
          },
        },
        {
          id: 'w7s1-ids',
          title: 'One enterprise, one ID, one meaning',
          purpose: 'The first integration check: consistency of identity across the weeks.',
          minutes: 3,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['One enterprise, one ID, one meaning', 'Stale export: a later week built from an older file', 'ID no longer defined: deleted or renumbered upstream', 'Collision: two elements share one ID; never a rename', 'Disposition no longer true: a later week closed the gap'] },
            { kind: 'callout', tone: 'note', title: 'Identity rule', text: 'Same element only if the names match or one contains the other whole.' },
          ],
          sources: [R('R13', '565')],
          notes: {
            teach: [
              'Each later record carries a copy of the earlier ones: your Week 3 export holds a snapshot of Week 2, Week 6 holds a snapshot of Week 5. That is how each tool could check your links. It is also how the weeks drift apart. If you corrected a requirement in Week 2 after exporting the file Week 3 read, Week 3 still carries the old version.',
              'The package tool compares every snapshot with the week that owns the IDs and reports the drift. A stale export: a later week does not carry IDs the earlier week now defines. An ID no longer defined: a later week carries IDs the owning week deleted or renumbered. A collision: two weeks each define the same ID for a different element, which happens when a tool numbers from 001 without seeing the earlier week. And a disposition no longer true: an earlier week recorded a gap that a later week has since closed.',
              'The identity rule decides between a harmless change of wording and a collision: two definitions are the same element only if their names match, ignoring case and punctuation, or one name contains the other whole. “Charging Systems” and “Vertiport charging systems” pass; “Grocery store donors” and “County funders’ portal” do not. A collision is never accepted with a rationale: renumber it in the later week’s tool, or defer it with an owner.',
              'Why it matters: SEBoK notes that traceability is used to assess the impact of changes to requirements or other data across the life cycle (R13 p.565). Traces through a stale copy assess the wrong thing.',
            ],
            why: 'Snapshot drift is invisible inside any one week and obvious across weeks; naming its four forms lets students recognize them in their own audit.',
            misconceptions: [{ claim: 'If each week passed its own checks, the package is consistent.', correction: 'Each week checked itself against the copy it imported. Only a cross-week comparison finds a copy that is out of date.' }],
            transition: 'The second check: traceability in both directions.',
            timing: '3 min: 1 min why copies drift, 1.5 min the four kinds, 30 s why it matters.',
          },
        },
      ],
    },
    // ============================================================================================ C. traceability and the audit (17 min)
    {
      id: 'w7s1-audit',
      title: 'Traceability and the package audit',
      slides: [
        {
          id: 'w7s1-bidirectional',
          title: 'Bidirectional traceability: no orphans, no childless parents',
          purpose: 'Ground the audit in the DoD definition and lay out the course’s trace layers.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s1-trace-ladder',
            caption: 'The audit’s trace ladder from needs to the roadmap, with an orphan and a childless parent marked.',
            alt: 'Six rungs, top to bottom: needs, stakeholder requirements, system requirements, functions and physical elements, interfaces, roadmap increments. Lines join items on adjacent rungs. One need has no line down to it from below and is marked childless parent; one system requirement has no line up and is marked orphan.',
          },
          body: [{ kind: 'bullets', items: ['Orphan: a lower item with no valid parent', 'Childless parent: a higher item nothing addresses', 'Layers: need, requirement, architecture, interface, increment', 'Count both directions at every layer'] }],
          sources: [R('R45', '118')],
          notes: {
            teach: [
              'The DoD guidebook gives the vocabulary. Bidirectional traceability is the key to effective requirements management: it enables an understanding of the system-wide effects of changes. It ensures that approved changes do not create “orphaned” lower-level requirements, whose bottom-up relationships are no longer valid, and that there are no “childless parent” higher-level requirements, each being addressed by lower-level requirements and system element designs (R45 p.118).',
              'The audit applies that rule across the package, layer by layer, a course convention: needs to stakeholder requirements; stakeholder requirements to system requirements, or a function that carries them directly; system requirements to the architecture, a function, a physical element or the interface they govern; physical elements to interfaces; and roadmap increments back to the IDs they serve.',
              'At every layer you look both ways. Up: does each item have a valid parent? Down: is each item addressed by something below it? A gap in either direction is a finding.',
            ],
            why: 'Students know the words orphan and childless from Week 2; extending them to every layer of the package is what makes the audit an integration check.',
            figure: 'Read the rungs top to bottom; then point at the childless need, with nothing reaching it from below, and the orphan requirement, with nothing above it.',
            misconceptions: [{ claim: 'Traceability means every requirement has a parent.', correction: 'That is only the upward half. The downward half, every parent addressed below, finds needs that nothing in the design serves.' }],
            transition: 'Well formed is not the same as right.',
            timing: '4 min: 1.5 min DoD definition, 1.5 min the layers, 1 min both directions.',
          },
        },
        {
          id: 'w7s1-verify-validate',
          title: 'Well formed and right: requirement verification and validation',
          purpose: 'Separate what a structural audit can find from what only a reviewer can judge.',
          minutes: 3,
          layout: 'two-column',
          body: [{ kind: 'definition', term: 'Requirement verification', text: 'Are the requirements well formed: do they follow the rules for well-formed requirements?', source: R('R13', '566') }],
          aside: [
            { kind: 'definition', term: 'Requirement validation', text: 'Do we have the right requirements: do they carry the intent of the needs and sources they came from?', source: R('R13', '566') },
            { kind: 'callout', tone: 'note', text: 'A trace link can exist and still carry only part of a need. The tool counts links; a reviewer reads them.' },
          ],
          sources: [R('R13', '566'), R('R06c', '387')],
          notes: {
            teach: [
              'SEBoK separates two questions about requirements, and neither is system verification or validation. Requirement verification asks whether the requirements are well formed: do individual requirements and sets of requirements follow the organization’s rules. Requirement validation asks whether we have the right requirements: do they clearly communicate the intent of the needs, parent requirements and other sources they were transformed from (R13 p.566). Peer review is one of the named methods for both.',
              'The technical reviews article adds why reviewers matter: most reviews assess a set of interrelated information items for consistency, completeness and so on (R06c p.387). A tool can check structure: links exist, IDs resolve. It cannot read a need and judge that the requirement under it says only half of it. That judgment is the reviewer’s.',
              `In my own package the coverage layer shows every need covered, ${coverage('need-req').pct} %, yet ${plural(A.partialStillOpen.length, 'need')} (${A.partialStillOpen.join(', ')}) have a requirement that covers only part of them. The audit finds them only because Week 2 recorded each as an open item; reading the need against its requirement is how you find the ones nobody recorded.`,
            ],
            why: 'Students who think the audit tool certifies quality stop reading their own requirements; this slide puts the tool and the reviewer in their places.',
            misconceptions: [{ claim: 'If the trace matrix is complete, the requirements are right.', correction: 'A complete matrix proves links exist. Whether each link carries the whole intent is requirement validation, a reading task.' }],
            transition: 'How the audit reports what it finds.',
            timing: '3 min: 1.5 min the two questions, 1 min tool versus reviewer, 30 s AeroLink.',
          },
        },
        {
          id: 'w7s1-audit-metrics',
          title: 'Coverage, findings and dispositions',
          purpose: 'Teach the audit’s outputs and the disposition rule the tool enforces.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s1-dispositions',
            caption: 'Every finding leaves the audit one of three ways: corrected and re-imported, accepted with a rationale and its evidence, or deferred to a week with an owner.',
            alt: 'A box labeled finding on the left with three arrows to the right. The top arrow, labeled correct the week and export again, ends at a box labeled finding gone. The middle arrow ends at a box labeled accept, with rationale and evidence. The bottom arrow ends at a box labeled defer, with an owner and a week.',
          },
          body: [{ kind: 'bullets', items: ['Coverage per layer: covered of total, as a percentage', 'Every finding: accept with rationale, or defer', 'Accept: a rationale with its evidence', 'Defer: name who closes it, and the week', 'Correct: fix the week and import it again', 'A claim of “fixed” is not a rationale'] }],
          sources: [R('R44', '111'), R('R13', '565')],
          notes: {
            teach: [
              'The audit produces two things. Coverage, per layer: how many items have their link, out of how many, as a percentage. The DoD guidebook notes that technical assessment products, for example percentage completion, can be entrance criteria for a review, and that the review’s output is an objective assessment of progress, maturity and risk (R44 p.111). Coverage is that kind of number.',
              'And findings. Every finding gets a disposition, and there are only three ways out. Correct it at its source: fix the week’s record in its own lab tool, export again, import the new file; the finding disappears, and that is the only proof of a correction. Accept it, with the rationale and the evidence it rests on: a stakeholder requirement verified by inspection needs no system child, as the Week 2 record says. Or defer it to a Phase II week, with the name of who closes it, as SEBoK’s TBX management identifies the owner of the work and its closure (R13 p.565).',
              'The tool lets you type only accept or defer. A rationale that only says “fixed”, “resolved” or “withdrawn” is refused, because the finding it answers is still in your exports; the tool cannot check a claim, it can check that the finding is gone. And a collision can only be deferred.',
            ],
            why: 'A disposition rule with no untestable “done” makes every claim in the package checkable, which is what a reviewer needs.',
            figure: 'Follow the three arrows from the finding: the top one makes it disappear, the other two keep it with a reason or an owner.',
            misconceptions: [{ claim: 'A finding should be closed by writing “fixed” beside it.', correction: 'A fix is shown by the finding no longer appearing after re-export. Writing “fixed” beside a finding that is still there is the defect the review looks for.' }],
            transition: 'Now watch me walk one thread through my own package.',
            timing: '3 min: 1 min coverage, 1.5 min the three ways out, 30 s the tool rule.',
          },
        },
        {
          id: 'w7s1-thread-example',
          title: 'Worked example: one AeroLink thread, end to end',
          purpose: 'Model the thread walk every team does in its review.',
          minutes: 4,
          layout: 'worked-example',
          figure: {
            id: 'w7s1-thread',
            caption: `One AeroLink thread followed through the package from ${THREAD_START}: ${THREAD.length} linked items across six weeks. (FICTIONAL)`,
            alt: `A chain of ${THREAD.length} linked chips, left to right and wrapping onto a second row: ${THREAD.map((h) => `${h.id} (Week ${h.week})`).join(', ')}. Each chip carries its week number.`,
          },
          body: [
            { kind: 'callout', tone: 'note', text: 'Walk one thread from a need to the architecture, then on to the interface and the roadmap.' },
            { kind: 'steps', items: [{ label: 'Down', text: `${hops.slice(0, 6).join(' → ')}` }, { label: 'Out', text: `${hops.slice(6).join(' → ')}` }] },
          ],
          sources: [R('R13', '565')],
          notes: {
            teach: [
              `I start at ${THREAD_START}, ${THREAD[0].name.toLowerCase()}, and follow only links that exist in my records. Each hop names its link: the capability that answers the need, the stakeholder requirement that names it as a parent, the system requirement that refines it, the function that carries that requirement, the physical element that performs the function, the interface that joins the element to the outside.`,
              `Then the thread leaves the architecture. The measure that measures the requirement; the unknown that owns the TBD in its statement; the roadmap increment that unknown gates; and the decision whose condition names it. ${lastHop.id} is where the walk ends. SEBoK’s point is exactly this: traceability shows requirements trace to their needs and are allocated to elements of the architecture (R13 p.565).`,
            ],
            why: 'One fluent walk demonstrates more consistency than any number of tables, and it is what the review asks each team to do live.',
            figure: 'Read the chips left to right, saying the link aloud at each arrow; pause at the interface, where the thread leaves the system, and at the unknown, where it reaches the roadmap.',
            workedSolution: THREAD.slice(1).map((h, i) => `${THREAD[i].id} → ${h.id} ${h.name}: ${h.link} (Week ${h.week}).`),
            misconceptions: [{ claim: 'A thread walk is a recital of IDs.', correction: 'Each hop must name the link that joins it to the last. An ID with no link is a jump, and reviewers stop you there.' }],
            transition: 'And here is what the audit of my package found.',
            timing: '4 min: 2 min down the architecture, 2 min out to the roadmap.',
          },
        },
        {
          id: 'w7s1-findings-example',
          title: 'Worked example: AeroLink’s package audit',
          purpose: 'Show real coverage numbers and real findings, including the uncomfortable ones, with dispositions.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s1-coverage',
            caption: `AeroLink’s coverage per layer, and how its ${plural(A.findings, 'finding')} were dispositioned. (FICTIONAL)`,
            alt: `Five horizontal bars, one per layer, each filled to its coverage: ${covText}. Beside them a tally: ${A.recorded} accepted (${A.staleDispositions} of them earlier dispositions no longer true), ${A.deferred} deferred.`,
          },
          body: [{ kind: 'bullets', items: [`${plural(A.findings, 'finding')}: ${A.recorded} accepted, ${A.deferred} deferred`, `${plural(A.staleDispositions, 'Week 2 disposition')} made false by later weeks`, `Week 2 open items dropped by Week 6: ${dropText()}`, `${plural(stk.uncovered.length, 'stakeholder requirement')} with no child, by decision`, `${phy.uncovered.join(', ')}: an element no interface ends at`] }],
          sources: [R('R45', '118'), R('R56', '389')],
          notes: {
            teach: [
              `Read the bars: ${covText}. Not every bar is full, and that is fine when every gap is dispositioned.`,
              `Now the findings. ${A.staleDispositions} of them are mine from Week 2: I recorded ${stale[0]?.ids[0] ?? 'a need'} as deliberately childless and several stakeholder requirements as open items, and later weeks closed every one of those gaps. The Week 2 table now says something false. I accept each finding with its evidence, the requirement that now covers the gap, and the package states the current status. And the open items from my Week 2 audit for the needs covered only in part were dropped by my own Week 6 review; the audit carries them again: ${dropText()}.`,
              `${plural(stk.uncovered.length, 'stakeholder requirement')} (${stk.uncovered.join(', ')}) have no child on purpose: they are verified at service level, and Week 2 recorded why, so the disposition is carried. ${phy.uncovered.join(', ')} is the communications network: it carries interfaces but is the end of none, so I record that. And ${A.openItems} open items come from my Week 6 baseline review, each deferred with its owner.`,
            ],
            why: 'Showing the instructor’s own stale dispositions makes clear that finding problems in your own package is the point of the audit, not an admission of failure.',
            figure: 'Point at each bar and its number, then at the tally; note that the stale dispositions are counted among the recorded findings.',
            misconceptions: [{ claim: 'A good package has no findings.', correction: 'A good package has every finding dispositioned. Mine has many, all of them recorded or deferred with owners.' }],
            transition: 'The package is ready to be reviewed. What is a review?',
            timing: '3 min: 30 s bars, 1.5 min stale dispositions, 1 min recorded and deferred.',
          },
        },
      ],
    },
    // ============================================================================================ D. the design review (18 min)
    {
      id: 'w7s1-review',
      title: 'The design review',
      slides: [
        {
          id: 'w7s1-review-definition',
          title: 'What a technical review is for',
          purpose: 'Frame Session 2 as a review, not a show.',
          minutes: 3,
          layout: 'definition',
          body: [
            { kind: 'definition', term: 'Technical reviews and audits', text: 'A mechanism by which sufficiently independent and knowledgeable stakeholders analyze the current state of a system or work products using pre-established criteria', source: R('R06c', '386') },
            { kind: 'bullets', items: ['Results support programmatic and technical decisions', 'They help establish readiness for the next stage', 'They support baselines and early validation'] },
          ],
          sources: [R('R06c', '386')],
          notes: {
            teach: [
              'SEBoK’s definition has four parts, and each one constrains how we run Session 2. Independent and knowledgeable stakeholders: your reviewers are another team and the instructor. Analyze the current state: they review your package as submitted, not as you hope it will be. Pre-established criteria: they score against criteria you already know. And the results support decisions (R06c p.386).',
              'The same page names what reviews support: project assessment and control, by establishing readiness to proceed to the next milestone or stage; configuration management, by establishing and verifying baselines; and validation, because involving the right stakeholders validates requirements and designs early (R06c p.386).',
              'All three apply this week. The review decides whether your package is ready to become the Week 8 baseline, and your peers act as stakeholders who were not inside your project.',
            ],
            why: 'Students who see the review as a decision against known criteria prepare evidence, not a performance.',
            misconceptions: [{ claim: 'A design review is a presentation the team gives to show its work.', correction: 'It is an analysis by independent reviewers against criteria, and its product is a decision with actions.' }],
            transition: 'How a review is run: prepare, conduct, complete.',
            timing: '3 min: 1.5 min the definition, 1 min what reviews support, 30 s this week.',
          },
        },
        {
          id: 'w7s1-prepare-conduct-complete',
          title: 'Prepare, conduct, complete',
          purpose: 'The procedure the course review follows, from the source.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s1-review-flow',
            caption: 'The three stages of a technical review, with the course’s criteria under each.',
            alt: 'Three boxes left to right joined by arrows: prepare, conduct, complete. Under prepare: criteria defined, entry confirmed, items sent in advance. Under conduct: analysis from different perspectives, findings recorded. Under complete: exit criteria met, results communicated, actions implemented.',
          },
          body: [{ kind: 'bullets', items: ['Prepare: entry and exit criteria defined; entry confirmed', 'Items to be assessed sent in advance', 'Conduct: analysis from different perspectives', 'Complete: exit met, results communicated, actions done'] }],
          sources: [R('R06c', '387'), R('R06c', '388')],
          notes: {
            teach: [
              'SEBoK describes a typical review in three stages. Prepare: define purpose, scope and timing; define and coordinate specific entry and exit criteria, and confirm the entry criteria are complete before the review is held. Make the set of information items to be assessed available to participants before the review, and coordinate roles beforehand (R06c p.387).',
              'Conduct: participants analyze the information against the pre-established criteria, usually from different perspectives, such as safety, security or reliability, consistent with their expertise; then all meet to discuss the results and identify actions (R06c p.388).',
              'Complete: once the exit criteria are met, results are communicated to participants and to stakeholders who could not attend, and the identified actions are implemented (R06c p.388). Reviews should not be held until the entry criteria are met (R06c p.388).',
              'Our mapping: the package is the information set, sent 24 hours ahead; the peer team reads it and writes its findings before Session 2; the meeting is Session 2; completion is your dispositions, due three days later.',
            ],
            why: 'Following the source’s procedure lets students see that each course deadline is a stage of a real review, not an arbitrary date.',
            figure: 'Read the three boxes; then the criteria under each, and say which course deadline each one is.',
            misconceptions: [{ claim: 'The review happens in the meeting.', correction: 'Most of the analysis happens before the meeting, from the package sent in advance; the meeting discusses findings and decides actions.' }],
            transition: 'The course’s entry and exit criteria, exactly.',
            timing: '4 min: 1.5 min prepare, 1 min conduct, 1 min complete, 30 s the mapping.',
          },
        },
        {
          id: 'w7s1-entry-exit',
          title: 'The Phase I review’s entry and exit criteria',
          purpose: 'State the course criteria the tool and the rubric apply.',
          minutes: 3,
          layout: 'two-column',
          body: [{ kind: 'bullets', items: ['Entry: package sent 24 h before Session 2', 'Entry: every finding dispositioned, none silent', 'Entry: summary, owners, thread prepared', 'One key decision, with its alternatives'] }],
          aside: [{ kind: 'bullets', items: ['Exit: every RID dispositioned, with a response', 'Exit: every accepted or deferred RID owned', 'Exit: the closed package exported again'] }],
          sources: [R('R40', '70'), R('R44', '111')],
          notes: {
            teach: [
              `Read the entry criteria, a course convention. ${ENTRY_CRITERIA.join('. ')}.`,
              `And the exit criteria. ${EXIT_CRITERIA.join('. ')}.`,
              'The DoD guidebook applies the same discipline to its System Requirements Review: the review should not begin until the criteria are met and any prior technical reviews are complete and their action items closed (R40 p.70). We tailor that rule rather than copy it: Phase I open items are designed to carry into Phase II, so we require every open item dispositioned and owned, not closed. An item that was due before this review is the exception the chair checks at entry. The guidebook also allows a measure of completion as an entrance criterion (R44 p.111); the tool’s readiness report is ours.',
            ],
            why: 'Criteria known in advance turn the review into a check the team can pass by preparing, which is the point of pre-established criteria.',
            misconceptions: [{ claim: 'Entry criteria are a formality: the review happens anyway.', correction: 'A review held before its entry criteria are met wastes the reviewers’ time on defects the team could have found; SEBoK says not to hold it.' }],
            transition: 'Who does what in the room.',
            timing: '3 min: 1 min entry, 1 min exit, 1 min the DoD parallel.',
          },
        },
        {
          id: 'w7s1-roles',
          title: 'Review roles: owners, reviewers, chair, recorder',
          purpose: 'Coordinate roles before the review, as the source requires.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w7s1-roles',
            caption: 'The roles in the course design review, with what each brings to the room.',
            alt: 'A grid of five role cards: owning team, which presents and answers; peer reviewers, who raise findings; chair, the instructor, who decides; recorder, who writes findings and actions; timekeeper, who holds the slots. A bracket marks the peer reviewers and the chair as far enough removed to be independent.',
          },
          body: [{ kind: 'bullets', items: ['Every member presents and answers for the sections they own', 'Peer reviewers: far enough removed to see what you miss', 'Chair (instructor) decides; recorder writes actions', 'Independent review counters bias'] }],
          sources: [R('R06c', '388'), R('R18', '474')],
          notes: {
            teach: [
              'Roles are coordinated before the review (R06c p.387). The owning team presents, and every member presents and answers for the sections they own: the tool records an owner for each package section. The peer team reviews: it has read your package and written findings. The instructor chairs and decides. One peer acts as recorder and one as timekeeper.',
              'Why a peer team? SEBoK notes the challenge of finding reviewers who can judge objectively: people too close to the project may be biased, and people too far away may miss critical issues, so the most effective team combines people close enough for insight with some far enough removed for an independent view (R06c p.388).',
              'SEBoK’s decision management article names independent review as a mitigation of cognitive bias, alongside the premortem, where experts are asked to argue the case against a decision before it is made (R18 p.474). Your reviewers are, in part, your premortem.',
            ],
            why: 'Assigning roles in advance removes the commonest failure of student reviews: one member presents everything and nobody owns the answers.',
            figure: 'Point at each role card, then the bracket over the reviewers and the chair: independence is a property of the room, not of one person.',
            misconceptions: [{ claim: 'Peer reviewers should be kind, because everyone is in the same course.', correction: 'A reviewer who raises no finding has not done the job. Kindness is in the wording of the finding, not in its absence.' }],
            transition: 'The closest professional analogy: the System Requirements Review.',
            timing: '3 min: 1 min roles, 1 min independence, 1 min bias.',
          },
        },
        {
          id: 'w7s1-srr',
          title: 'The closest professional analogy: the SRR',
          purpose: 'Calibrate expectations with real review criteria, labeled as an analogy.',
          minutes: 3,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['Requirements consistent with technology maturation plans', 'Clearly stated, measurable and testable', 'Traceable in both directions', 'Verification methods for all; risks with mitigation plans', 'All interfaces documented'] },
            { kind: 'callout', tone: 'caution', title: 'Course analogy', text: 'The Phase I review borrows these questions. It sets no contractual baseline.' },
          ],
          sources: [R('R40', '69'), R('R40', '70')],
          notes: {
            teach: [
              'The DoD System Requirements Review is a multi-disciplined technical review to ensure the developer understands the system requirements and is ready to proceed with initial design. It assesses whether the system requirements are consistent with the preferred solution and with technology maturation plans, consider the maturity of interdependent systems, and are clearly stated, measurable and testable (R40 p.69).',
              'The systems engineer’s responsibilities at an SRR read like our audit: ensure all requirements are defined and traceable in both directions; verification methods are identified for all system requirements; risk items are identified and analyzed with mitigation plans in place; and all interfaces are documented (R40 p.70).',
              'Labeled clearly: this is an analogy. The SRR is a contractual event in defense acquisition; our Phase I review borrows its questions to calibrate what a reviewer may ask. Each of those questions maps to a package section: requirements in section 4, maturity and risk in section 5, interfaces in section 7, traceability in the audit.',
            ],
            why: 'Real review criteria show that the course asks professional questions, and tell students what a reviewer will look for first.',
            misconceptions: [{ claim: 'An SRR checks that requirements are written down.', correction: 'It checks that they are consistent with the solution and the technology plans, testable, traced both ways, verified by a named method and backed by risk mitigation.' }],
            transition: 'Back to the board’s question.',
            timing: '3 min: 1 min the SRR purpose, 1 min the engineer’s checks, 1 min the analogy and the mapping.',
          },
        },
        {
          id: 'w7s1-readiness',
          title: 'Ready for Week 8? The answer for AeroLink',
          purpose: 'Answer the driving question from the audit and say what the model needs from the package.',
          minutes: 2,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['C: ready with conditions', 'Every finding dispositioned; every open item owned', 'Week 8 needs stable IDs, one name per ID, typed links', 'Deferred items become the first modeling tasks'] },
          ],
          sources: [],
          notes: {
            teach: [
              `Return to the vote. The answer is C. ${DRIVING_QUESTION.reasons.join(' ')}`,
              'What Week 8 needs from your package is concrete. Stable IDs, because every ID becomes a model element with that short name. One name per ID, because the model shows one name. Typed links, because each becomes a relationship. Your deferred items, with their owners, become the first modeling tasks of Phase II.',
            ],
            why: 'Answering from the audit’s numbers shows that readiness is decided by evidence and dispositions, which is what students must argue in their own review.',
            misconceptions: [{ claim: 'Ready with conditions is a polite way of saying not ready.', correction: 'It is a decision with stated conditions and owned actions, the normal outcome of a real review.' }],
            transition: 'Now run the audit on your own package.',
            timing: '2 min: 1 min the answer, 1 min what Week 8 needs.',
          },
        },
      ],
    },
    // ============================================================================================ E. studio (13 min)
    {
      id: 'w7s1-studio',
      title: 'Integration studio',
      slides: [
        {
          id: 'w7s1-lab-studio',
          title: 'Studio: load your six exports and read your audit',
          purpose: 'Apply the audit to the team’s own exports with the instructor in the room.',
          minutes: 11,
          layout: 'bullets',
          body: [
            { kind: 'bullets', items: ['Load your six exports into the package tool', 'Read the coverage and every finding', 'Re-export any stale week now if you can', 'Disposition three findings: record or defer', 'Name the owner of each package section'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Teams open the package tool and load their six exports. Ask them to read the coverage table first, then every finding, and to fix by re-export anything stale they can fix in the room. Each team dispositions its first three findings, record or defer, and names an owner for every package section.',
              'Circulate. At each team ask one owner interview question: pick a member, point at an element they own and ask what it traces to. This is a dry run of the individual questions in Session 2.',
            ],
            why: 'Running the tool in class surfaces import problems and stale exports while the instructor can help, not the night before the entry deadline.',
            misconceptions: [{ claim: 'The tool will say what to write in each disposition.', correction: 'The tool finds the gap; only the team knows whether it is a decision to record or an open item to defer.' }],
            transition: 'Before you leave: the dates.',
            timing: '11 min: 3 min loading, 4 min reading findings, 4 min first dispositions and owner questions.',
          },
        },
        {
          id: 'w7s1-lab-close',
          title: 'Before Session 2',
          purpose: 'Unambiguous logistics for the entry criteria.',
          minutes: 2,
          layout: 'bullets',
          body: [{ kind: 'bullets', items: ['Package index and readiness report: 24 h before Session 2', 'Peer pairings and review order: posted today', 'Each reviewer: read your sections, write at least two RIDs', 'Session 2: how to defend, then the review'] }],
          sources: [],
          notes: {
            teach: [
              'Read the dates. The package index with its readiness report, and the JSON package, are due 24 hours before Session 2: that is the entry criterion. The peer pairings and the review order go on the learning management system today. Each member of the reviewing team reads the sections that match their own role in the assigned package and writes at least two review findings on the form on the Assessment page before Session 2.',
              'Session 2 opens with how to present and defend your decisions and how to answer review findings; the rest of it is the review.',
            ],
            why: 'Clear dates make the entry criterion achievable and give reviewers time to read.',
            misconceptions: [{ claim: 'The peer review can be written during the other team’s presentation.', correction: 'Findings are written before the meeting from the package sent in advance; the meeting discusses them.' }],
            transition: 'End of the session.',
            timing: '2 min: 1 min dates, 1 min Session 2.',
          },
        },
        {
          id: 'w7s1-references',
          title: 'References and credits',
          purpose: 'The generated list of every source cited in this session, with license credits.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while teams pack up. The list is generated from every citation in the session and includes SEBoK’s required attribution.'],
            why: 'Students should be able to find every source the session relied on.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the close.',
          },
        },
      ],
    },
  ],
  studentLesson: [
    {
      id: 'w7-lesson-why',
      title: 'Why this week: from six records to one baseline',
      sources: [R('R36', '498'), R('R36', '499'), R('R56', '389'), R('R45', '119')],
      blocks: [
        { kind: 'para', text: 'For six weeks your team has written one record a week: the charter, stakeholders and needs; the ConOps, scenarios and requirements; the technology assessment, risks, TPMs and trade study; the architecture and information view; the components and interfaces; and the evolution roadmap. Each was checked on its own, by its own lab tool, against the copy of the earlier weeks it imported. This week the six become one **Systems Thinking Engineering Package**, the source material for Phase II. In Week 8 the package is imported into a SysML v2 model: every ID becomes a model element and every link a relationship.' },
        { kind: 'figure', slide: 'w7s1-where' },
        { kind: 'para', text: 'SEBoK gives the function of such a package. A **configuration baseline** is a formally approved snapshot of a system’s attributes at a specific point in its development; baselines are reference points that guide and control later change, assembled as a set of consistent information that serves as the starting point for further changes (R36 p.498). Their content is not limited to documents: it can include digital artifacts such as models, databases and files (R36 pp.498–499). The standards define functional, allocated and product baselines (R36 p.499); the Phase I package is a course analogy, not one of those contractual baselines, but it borrows their discipline: approve one consistent snapshot, then change from it on purpose.' },
        { kind: 'para', text: 'A baseline does not have to be finished. MITRE’s guide on assessing a design says a requirements baseline is essential to traceability, that every approved change must be incorporated, and that the baseline should also include requirements that were not able to be met (R56 p.389). The DoD guidebook’s requirements traceability matrix keeps every requirement’s decomposition, allocation history and the rationale for every entry and change (R45 p.119). So the rule of this week is simple to say: open is acceptable, silent is not. An owned open item is a decision; an unrecorded gap is a defect the model will inherit.' },
      ],
    },
    {
      id: 'w7-lesson-package',
      title: 'What the package contains, and the executive summary',
      sources: [R('R18', '473'), R('R43', '109'), R('R43', '110')],
      blocks: [
        { kind: 'para', text: 'The package has eleven sections, a course convention: no source in the collection defines a Systems Thinking Engineering Package. Seven come from your weekly records and four are written this week.' },
        { kind: 'table', header: ['Section', 'Supplied by'], rows: PACKAGE_SECTIONS.map((s) => [`${s.n}. ${s.title}`, s.week === 7 ? 'written in Week 7' : `your Week ${s.week} export`]), caption: 'The sections of the Systems Thinking Engineering Package (course convention).' },
        { kind: 'figure', slide: 'w7s1-package-contents' },
        { kind: 'para', text: 'The package is built from all six weekly exports, as returned with feedback and corrected. The lab tool reads each export with that week’s own importer, so nothing is retyped, and writes two files: a Markdown package index with its readiness report, which reviewers read, and a JSON package, which carries every export unchanged together with the audit and this week’s writing, for the Week 8 import.' },
        { kind: 'heading', text: 'The executive summary' },
        { kind: 'para', text: 'SEBoK’s decision management article recommends presenting recommendations as a clearly worded, actionable task list and keeping a comprehensive report for traceability and future decisions (R18 p.473). The DoD decision analysis process transforms a broadly stated decision opportunity into a traceable, defendable and actionable plan (R43 p.109); its last steps are to analyze sensitivities, develop a decision briefing with an action plan and make a recommendation to the decision maker, who has full responsibility, authority and accountability for the decision (R43 p.110).' },
        { kind: 'para', text: 'The package opens with a summary of six fields, each checked by the tool. **Recommendation**: what you ask the decision maker to approve. **Why**: the evidence, cited by ID so that a reviewer can find it. **Conditions**: what must stay true for the recommendation to hold, from your sensitivity analysis. **Residual risk**: what remains, by R ID. **Decisions needed**: what the reviewer must decide. **Next**: the first roadmap increment after the baseline.' },
        { kind: 'figure', slide: 'w7s1-exec-summary' },
        { kind: 'table', header: ['Field', 'AeroLink (FICTIONAL; decisions needed proposed)'], rows: [['Recommendation', EXEC_SUMMARY.recommendation], ['Why', EXEC_SUMMARY.why.join('; ')], ['Conditions', EXEC_SUMMARY.conditions.join('; ')], ['Residual risk', EXEC_SUMMARY.residual.join('; ')], ['Decisions needed', EXEC_SUMMARY.decisionsNeeded.join('; ')], ['Next', EXEC_SUMMARY.next]], caption: 'AeroLink’s executive summary, computed from the Weeks 3 and 6 cases and the package audit.' },
      ],
    },
    {
      id: 'w7-lesson-consistency',
      title: 'Consistency: one enterprise, one ID, one meaning',
      sources: [R('R13', '565')],
      blocks: [
        { kind: 'para', text: 'Every later record carries a copy of the earlier ones: the Week 3 export holds a snapshot of Week 2, the Week 6 export a snapshot of Week 5. That is how each week’s tool could check your links, and it is also how the weeks drift apart. If you corrected a requirement in your Week 2 record after exporting the file Week 3 read, Week 3 still carries the old requirement, and so does every week built on it.' },
        { kind: 'para', text: 'The package tool compares each snapshot with the week that owns the IDs and reports the drift in five forms. **Two enterprises**: the files name different enterprises. **Stale export**: a later week does not carry IDs the earlier week now defines. **ID no longer defined**: a later week carries IDs that the owning week deleted or renumbered. **One ID, two names**: the same ID is named differently in two weeks. **Disposition no longer true**: an earlier week recorded a gap that a later week has since closed. A sixth finding, **week not ready**, reports a week whose own tool judged it incomplete when it was exported.' },
        { kind: 'para', text: 'Why it matters: traceability is used to assess the impact of changes to requirements or other data across the life cycle (R13 p.565). A trace through a stale copy assesses the impact on something that no longer exists. Most consistency findings are fixed, not dispositioned: correct the week, export it again, import the new file, and the finding disappears.' },
      ],
    },
    {
      id: 'w7-lesson-audit',
      title: 'Traceability across the package: coverage and dispositions',
      sources: [R('R45', '118'), R('R13', '565'), R('R13', '566'), R('R06c', '387'), R('R44', '111')],
      blocks: [
        { kind: 'para', text: 'The DoD guidebook calls bidirectional traceability the key to effective requirements management: it lets you understand the system-wide effects of a change, it ensures approved changes leave no “orphaned” lower-level requirements, and it ensures there are no “childless parent” higher-level requirements, each being addressed by lower-level requirements and designs (R45 p.118). The package audit applies that rule at every layer, a course convention.' },
        { kind: 'figure', slide: 'w7s1-bidirectional' },
        { kind: 'table', header: ['Layer', 'Covered when'], rows: [['Needs → stakeholder requirements', 'a stakeholder requirement, from any week, names the need as a parent'], ['Stakeholder → system requirements', 'a system requirement refines it, or a function or physical element carries it directly'], ['System requirements → architecture', 'a function, a physical element or the interface it governs carries it'], ['Architecture → interfaces', 'the physical element, or one of its components, is an end of an interface'], ['Roadmap → package', 'every ID an increment serves exists in the package']], caption: 'The audit’s trace layers and what counts as covered (course convention).' },
        { kind: 'para', text: 'Two kinds of check are easy to confuse. SEBoK separates **requirement verification**, whether the requirements are well formed, from **requirement validation**, whether they are the right requirements, carrying the intent of the needs and sources they came from (R13 p.566). Reviews assess a set of interrelated information items for consistency and completeness (R06c p.387). The tool checks structure: links exist and IDs resolve. Whether a link carries the whole intent of a need is a reading task for the team and the reviewers.' },
        { kind: 'para', text: 'The audit reports **coverage**, covered items out of total at each layer as a percentage, the kind of assessment product the DoD guidebook allows as an entrance criterion to a review (R44 p.111), and a list of **findings**. Every finding has three ways out. Correct it at its source: fix the week, export again and import the new file; the finding disappears, which is the only proof of a correction. Accept it, with the rationale and the evidence it rests on: an ID in the package or the week whose record holds it. Or defer it to a Phase II week, with the name of who closes it, as TBX management identifies the owner of the work (R13 p.565). The tool lets you type only accept or defer; a rationale that only claims “fixed”, “resolved” or “withdrawn” is refused while the finding is still found, and a collision, two elements sharing one ID by the identity rule, can only be deferred. The tool reads requirements from your Week 2 and Week 5 records: a requirement written later belongs in your Week 2 record, exported again.' },
        { kind: 'figure', slide: 'w7s1-audit-metrics' },
      ],
    },
    {
      id: 'w7-lesson-aerolink',
      title: 'The AeroLink package, audited',
      sources: [R('R13', '565'), R('R45', '118'), R('R56', '389')],
      blocks: [
        { kind: 'para', text: `The instructor’s own package, worked as you will work yours (FICTIONAL). First a thread, walked from ${THREAD_START} by following only links that exist in the records. Each hop names its link.` },
        { kind: 'table', header: ['Item', 'Week', 'Link to the item before it'], rows: THREAD.map((h) => [`${h.id} ${h.name}`, `Week ${h.week}`, h.link]), caption: `One AeroLink thread from ${THREAD_START} to ${lastHop.id}, computed from the Weeks 1–6 cases.` },
        { kind: 'figure', slide: 'w7s1-thread-example' },
        { kind: 'para', text: `Then the audit. Coverage: ${covText}. The audit found ${plural(A.findings, 'finding')}; every one is dispositioned, ${A.recorded} accepted with their evidence and ${A.deferred} deferred with their owners and weeks.` },
        { kind: 'table', header: ['Finding', 'Kind', 'What', 'Disposition', 'Reason or owner'], rows: FINDINGS.filter((f) => f.kind !== 'open-item').map((f) => [f.id, f.kind.replace(/-/g, ' '), f.text, f.disposition, f.reason]), caption: 'AeroLink’s recorded findings (the open items carried from Week 6 follow below). FICTIONAL; the PHY-006 disposition is proposed.' },
        { kind: 'para', text: `${A.staleDispositions} of the findings are dispositions from Week 2 that later weeks made false: the need recorded as deliberately childless gained requirements in Week 3, and several stakeholder requirements recorded as open items were flowed down in Weeks 4 and 5. Each is accepted with its evidence, the requirement that now covers the gap, and the package states the current status. Further findings carry the Week 2 open items that the Week 6 review dropped (${dropText()}): the needs that Week 2 found covered only in part (${A.partialStillOpen.join(', ')}); the coverage layer counts them as covered because the parent link exists, so only the Week 2 record of the open item shows the gap. The open items from the Week 6 baseline review are carried as deferred findings: ${findingsOf('open-item').map((f) => `${f.ids[0]} (${f.owner})`).join('; ')}.` },
        { kind: 'figure', slide: 'w7s1-findings-example' },
      ],
    },
    {
      id: 'w7-lesson-review',
      title: 'The design review: purpose, procedure, criteria and roles',
      sources: [R('R06c', '386'), R('R06c', '387'), R('R06c', '388'), R('R40', '69'), R('R40', '70'), R('R18', '474')],
      blocks: [
        { kind: 'para', text: 'SEBoK defines technical reviews and audits as a mechanism by which sufficiently independent and knowledgeable stakeholders analyze the current state of a system or work products using pre-established criteria, the results supporting programmatic and technical decisions (R06c p.386). Reviews support project assessment and control, by establishing readiness to proceed to the next stage; configuration management, by establishing and verifying baselines; and validation, through the involvement of the right stakeholders (R06c p.386).' },
        { kind: 'para', text: 'A typical review is prepared, conducted and completed. Preparation defines purpose, scope and timing, and specific entry and exit criteria, whose completion is confirmed before the review; roles are coordinated beforehand, and the set of information items to be assessed for consistency and completeness is made available to participants in advance (R06c p.387). In the conduct, participants analyze the information against the criteria, usually from different perspectives, and then meet to discuss results and identify actions; completion comes when the exit criteria are met, results are communicated and actions implemented (R06c p.388).' },
        { kind: 'figure', slide: 'w7s1-prepare-conduct-complete' },
        { kind: 'table', header: ['Criterion', 'Phase I review (course convention)'], rows: [...ENTRY_CRITERIA.map((c) => ['Entry', c]), ...EXIT_CRITERIA.map((c) => ['Exit', c])], caption: 'The entry and exit criteria of the Phase I design review.' },
        { kind: 'para', text: 'Choosing reviewers is hard: people too close to the project may be biased, people too far away may miss critical issues, so the most effective review team combines people close enough for insight with some far enough removed for an independent view (R06c p.388). SEBoK’s decision management article lists independent review among the mitigations of cognitive bias, with the premortem, in which experts argue the case against a decision before it is made (R18 p.474). In the course review the owning team presents, every member answering for the sections they own; a peer team reviews; the instructor chairs and decides; a recorder writes findings and actions; a timekeeper holds the slots.' },
        { kind: 'figure', slide: 'w7s1-roles' },
        { kind: 'para', text: 'The closest professional analogy is the DoD System Requirements Review. It assesses whether system requirements are consistent with the preferred solution and with technology maturation plans, consider the maturity of interdependent systems, and are clearly stated, measurable and testable (R40 p.69); the systems engineer ensures requirements are traceable in both directions, verification methods are identified for all of them, risks are analyzed with mitigation plans in place and all interfaces are documented, and the review does not begin until its criteria are met and prior action items closed (R40 p.70). The Phase I review borrows these questions; it sets no contractual baseline.' },
        { kind: 'para', text: `Is AeroLink’s package ready? Ready with conditions. ${DRIVING_QUESTION.reasons.join(' ')} Week 8 needs from the package stable IDs, one name per ID and typed links; the deferred items become the first modeling tasks of Phase II. The decision behind AeroLink’s Year-2 step, ${DECISION.id}, is the one AeroLink defends in its review.` },
      ],
    },
  ],
}
