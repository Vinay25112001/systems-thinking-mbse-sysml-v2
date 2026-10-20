// Week 8, Session 2 lecture: Import Systems Thinking Artifacts / Stakeholders — packages, names and imports; the course
// toolchain; the import as a mapping of the whole Systems Thinking package; stakeholders and concerns as SysML v2 model
// elements, worked on AeroLink; the import audit; and the Lab L8 launch. 75-minute session: 69 minutes of planned
// content (47 lecture + 22 lab launch) on 20 slides plus the generated "References and credits" slide, and a 6-minute
// buffer. Single source for the slide viewer, the faculty notes, the .pptx and the student lesson
// (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20, A21 (decision 8: SysML v2 foundations and tool
// navigation in Week 8; decision 9: AeroLink is the instructor reference only).
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week08/WEEK08_LECTURE_OUTLINE.md §3; revised
// the same day after the independent review (WEEK8_REVIEW_DISPOSITIONS.md): the dependency direction rule (from = the
// dependent element), ref part in instance terms, the Evolution package, the checker installation per team.
//
// Accuracy rules followed:
//   - Every citation is a verified register entry at a page whose extracted text supports the claim beside it. The
//     SysML v2.1 Beta 2 specification (Part 1) is cited as that text (R80, R83, R85), never as "the standard"; the
//     training decks as R70/R77 (textual notation, Release 2026-08) and R90 (graphical notation).
//   - The # prefix on a dependency is a user-defined keyword: the short name of a metadata definition preceded by #,
//     usable on dependency declarations (R69 = S06 7.27 Metadata, p.193, 7.27.4 User-Defined Keywords; metadata usage
//     p.191). R80 pp.50–51 for dependencies, R77 sl.108–109 for metadata definitions. Which keywords exist and their
//     names (regulatedBy, conflictsWith, …) is a course convention.
//   - Course conventions are labeled as such (the ID rule, the mapping, the package layout, the assessment metadata,
//     the relationship keywords, the audit questions, the toolchain).
//   - Every listing is an excerpt of a checker-validated file (./listings.ts); AeroLink data come from ./aerolinkCase.ts
//     and ../week01/aerolinkCase.ts (read-only). AeroLink is FICTIONAL. Nothing is retyped.
//   - A checker PASS is never presented as evidence that a model is correct.
import type { Lecture } from '../types'
import { AEROLINK_AUDIT, AEROLINK_FINDINGS, AEROLINK_MATRIX, AEROLINK_SUMMARY, countOf } from './aerolinkCase'
import { AUDIT_QUESTIONS, EXERCISE_MINUTES, FINDING_CLASSES, LAB8_MINIMUMS, LAB8_OUTPUTS, LAB8_PERSON_HOURS, LAB8_PERSON_HOURS_THREE, LAB8_TEAM_HOURS, MAPPING_KINDS, MODEL_PACKAGES, REL_KEYWORDS } from './labBrief'
import { listing, listingText } from './listings'
import { CONCERNS, EXTERNAL_SYSTEMS, RELATIONSHIPS, STAKEHOLDERS, numberWord } from '../week01/aerolinkCase'

export const WEEK8_S2_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
/** Alt text of a listing figure: the file it comes from, the checker's recorded status, and the full text. */
const listingAlt = (key: string) => {
  const l = listing(key)
  return `Listing (file sysml/${l.file}, checked: ${l.status}): ${listingText(key)}`
}

const S = AEROLINK_SUMMARY
const N_KINDS = MAPPING_KINDS.length
const NOW = MAPPING_KINDS.filter((k) => k.modeledIn === 8)
const NOW_PREFIXES = NOW.map((k) => k.prefix).join(', ')
const WEEKS_ORDER = [...new Set(MAPPING_KINDS.map((k) => k.modeledIn))].sort((a, b) => a - b)
const kindsIn = (w: number) => MAPPING_KINDS.filter((k) => k.modeledIn === w).map((k) => k.prefix)
const LATER_PACKAGES = MODEL_PACKAGES.filter((p) => p.filledIn > 8)
const N_REL_TYPES = new Set(RELATIONSHIPS.map((r) => r.type)).size
const CONFLICT = RELATIONSHIPS.find((r) => r.type === 'conflicts-with')!
const DEFECTS = AEROLINK_FINDINGS.filter((f) => f.cls === 'defect').length
const GAPS = AEROLINK_FINDINGS.filter((f) => f.cls === 'gap').length
const LATER_FINDINGS = AEROLINK_FINDINGS.filter((f) => f.cls === 'info').length
const HOURS_FOUR_EACH = (LAB8_TEAM_HOURS / 4).toFixed(1)
const THREE_TOTAL = Math.round(LAB8_PERSON_HOURS_THREE.reduce((a, t) => a + t.hours, 0) * 10) / 10
const outputFiles = LAB8_OUTPUTS.map((o) => o.file)
const N_STK = STAKEHOLDERS.length
const N_CON = CONCERNS.length
const N_EXT = EXTERNAL_SYSTEMS.length
const STK_PROPOSED = STAKEHOLDERS.filter((s) => s.entry === 'proposed').map((s) => s.id)

/** The condensed mapping for the matrix slide: the Phase I ID kinds by the Phase II week that models them. */
const MATRIX_ROWS = WEEKS_ORDER.map((w) => [w === 8 ? 'Week 8 (modeled now)' : `Week ${w}`, kindsIn(w).join(', ')])
/** The full mapping, with the AeroLink count of each kind, for the lesson. */
const FULL_MATRIX_ROWS = AEROLINK_MATRIX.map((r) => [r.prefix, `${r.artifact} (Week ${r.phaseWeek})`, r.pkg, r.construct, r.modeledIn === 8 ? 'Week 8 (now)' : `Week ${r.modeledIn}`, r.count ? String(r.count) : 'not in the package yet'])

export const WEEK8_SESSION2: Lecture = {
  week: 8,
  session: 2,
  title: 'Import Systems Thinking Artifacts / Stakeholders',
  subtitle: 'Session 2: Packages, the toolchain, the import, stakeholders and concerns',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ H. retrieval (2 min)
    {
      id: 'w8s2-retrieval',
      title: 'Retrieval',
      slides: [
        {
          id: 'w8s2-warmup',
          title: 'Warm-up: read this listing',
          subtitle: 'Session 2: Packages, the toolchain, the import, stakeholders and concerns',
          purpose: 'Retrieve the Session 1 reading skills (specialization, subsetting, multiplicity) on an unseen, non-AeroLink listing before adding packages and names.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-listing-warmup',
            caption: 'An unseen listing: a branch library and its rooms. Checked with the course-designated checker (PASS).',
            alt: listingAlt('warmup'),
          },
          body: [
            { kind: 'bullets', items: ['Which line is a specialization?', 'Which line is a subsetting?', 'At least how many rooms does a library have?'] },
            { kind: 'callout', tone: 'key', title: 'Answers', text: '`StudyRoom :> Room` specializes; `studyRooms … subsets rooms`; at least four rooms, because the four study rooms are among the rooms.' },
          ],
          sources: [R('R70', '10–11'), R('R80', '64')],
          notes: {
            teach: [
              'Put the listing up with the answers hidden; give sixty seconds of silent reading, then take the three answers from three different students.',
              'Line three: StudyRoom colon-greater-than Room. The thing on the left is a definition, so the symbol means specializes: every study room is a room. Line six: studyRooms, a usage, subsets rooms, so the four study rooms are among the rooms of the library, not in addition to them. The subsetting usage may constrain its definition and its multiplicity, which is exactly what StudyRoom and the 4 do.',
              'So the least number of rooms is four. Anyone who said five, one plus four, added the subset to the set; that is the misreading Session 1 warned about. The package line is new: today starts there.',
            ],
            why: 'Retrieval of the one reading error that costs most in later weeks, and an unseen context so the answer cannot be recalled from the AeroLink listing.',
            figure: 'Point at line 3 (a definition on the left of the symbol), then line 6 (a usage on the left), then the multiplicity 4 on line 6 and 1..* on line 5.',
            misconceptions: [{ claim: 'The library has at least five rooms: one room plus four study rooms.', correction: 'Subsetting says the study rooms are among the rooms, so four study rooms already satisfy “at least one room”.' }],
            transition: 'That listing sat inside a package. Packages are where we start: how a model is organized and how one element names another.',
            timing: '2 min: 1 min reading, 1 min answers.',
          },
        },
      ],
    },
    // ============================================================================================ I. packages and names (11 min)
    {
      id: 'w8s2-packages-names',
      title: 'Packages, imports and names',
      slides: [
        {
          id: 'w8s2-packages',
          title: 'Packages, namespaces and qualified names',
          purpose: 'Define namespace, package and qualified name from the specification and the deck, so students can organize the model and refer across it.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-package-tree',
            caption: 'A model organized in packages; a qualified name is the path of names from a package to a member.',
            alt: "A nested package tree drawn as folder tabs. The outer package is labeled 'AeroLink Model v0.1'. Inside it, side by side, two packages: Context and Stakeholders. Inside Context: a box 'ENT-001 AeroLink Urban Mobility' and a box 'part context'. Inside Stakeholders: three boxes, 'STK-005 Vertiport operators', 'CON-006 Pad throughput and charging capacity' and 'REL-002'. A thick highlighted path runs from the outer package through Stakeholders to the STK-005 box; along it the text Stakeholders::'STK-005'. A second, thin path runs from Context to 'part context' with the text Context::context. Footnote under the tree: each package is a namespace for its members and a container for its owned members.",
          },
          body: [
            {
              kind: 'bullets',
              items: ['A namespace contains elements and names them', 'A package is a namespace used only to organize the model', 'Qualified name: names joined by `::`', 'Definitions and usages are namespaces too', 'A name with spaces or special characters is quoted'],
            },
          ],
          sources: [R('R80', '47'), R('R80', '56'), R('R70', '5'), R('R70', '9')],
          notes: {
            teach: [
              'Start from the specification’s language overview: SysML organizes a model with namespaces that contain and name elements, and particularly with packages used to organize the elements (R80 p.47). Section 7.5 sharpens it: a package is a kind of namespace used solely as a container for other elements to organize the model (R80 p.56). That word solely matters: a package has no meaning about the system. Moving a part definition from one package to another changes where it lives, not what it says.',
              'The training deck gives the two roles in one sentence: a package acts as a namespace for its members and a container for its owned members; a name with spaces or other special characters is surrounded in single quotes; a qualified name is a package name followed by the name of one of its members, separated by double colons (R70 sl.5). So Stakeholders, colon colon, quote STK-005 quote, is the qualified name of the vertiport operators in our model.',
              'One more fact that surprises students: definitions and usages are also namespaces (R70 sl.9). A part definition owns its attributes and parts the way a package owns its members, so Context::context::EXT-002 walks from a package into a part usage and then to a feature.',
              'For the team: the package structure is the first thing a reviewer sees. It should mirror your artifact map, which is why the course fixes the package names.',
            ],
            why: 'Every later listing, every reference across packages and every model-review comment uses qualified names; students who cannot read them cannot navigate the model.',
            figure: 'Trace the highlighted path with the pointer: the outer package, then Stakeholders, then the STK-005 box; read the qualified name along it. Then the thin path into the context part, to show that a part usage is a namespace as well.',
            misconceptions: [{ claim: 'Putting an element in a package changes what it means.', correction: 'A package only organizes; its meaning comes from the element’s own definition and relationships.' }],
            transition: 'To use an element from another package without writing the whole path, we import it. Imports are the rule most first models break.',
            timing: '3 min: 1 min namespace and package, 1 min qualified names on the figure, 1 min definitions as namespaces.',
          },
        },
        {
          id: 'w8s2-imports',
          title: 'Imports and visibility',
          purpose: 'Teach the import forms and the visibility rules from the deck and the specification, and the recorded checker result for an import without visibility.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-listing-root-imports',
            caption: 'The AeroLink reference model opens with private imports of the quantity, unit and scalar-value libraries. Checked (PASS).',
            alt: listingAlt('root-imports'),
          },
          body: [
            {
              kind: 'bullets',
              items: ['`::*` imports all members; `::**` imports recursively', 'Show visibility on every import; private unless re-export is needed', 'An import owned by a root namespace must be private', 'Recorded result: an import without visibility fails'],
            },
          ],
          sources: [R('R70', '5–6'), R('R80', '60–61'), R('R80', '63')],
          notes: {
            teach: [
              'An import adds either a single member or all the members of another package to the importing package (R70 sl.5). The specification gives the three forms: a qualified name alone imports one membership; a suffix colon-colon-star imports all the members of a namespace; a further colon-colon-double-star makes the import recursive, into nested namespaces (R80 p.60).',
              'Visibility is the rule to remember. Members are public by default, but the visibility of an import is always shown explicitly with the keyword private, protected or public (R80 p.61). The deck adds the practical advice: members from a public import are re-exported from the importing package, members from a private import are not, so use private unless re-export is required (R70 sl.6).',
              'There is one hard rule at the top of a file: an import owned by a root namespace, that is, written outside any package, is required to be private, so no imported name becomes globally visible (R80 p.63).',
              'Recorded result, from the course checker: a file with import ISQ star and no visibility fails with “mismatched input import, expecting closing brace”. Read the message as the checker saying it did not expect the word import there; the fix is one word, private.',
            ],
            why: 'Missing visibility is the most frequent first-model failure, and the error message does not name the cause; students who know the rule fix it in seconds.',
            figure: 'Point at line 1, the quoted package name; then lines 3 to 5: each import starts with private and ends with colon-colon-star, importing all members of ISQ, SI and ScalarValues into this package and no further.',
            examples: ['Why import SI as well as ISQ: ISQ gives the quantity kinds (DurationValue), SI gives the units (h, min, kW) used in values such as 16 [h].'],
            misconceptions: [{ claim: 'Public imports are safer because everything is visible.', correction: 'Public imports re-export names, so two packages can expose the same name; private is the advised default.' }],
            transition: 'Imports bring names in. Next, how we write names so that our Phase I IDs survive into the model.',
            timing: '3 min: 1 min forms, 1 min visibility and the root rule, 1 min the recorded failure.',
          },
        },
        {
          id: 'w8s2-names',
          title: 'Names and short names: carrying the Phase I IDs',
          purpose: 'Teach names and short names from the specification, and the course rule that every Phase I ID becomes a quoted short name.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-listing-stakeholder-decl',
            caption: 'One AeroLink stakeholder in the generated model: keyword, short name (the Phase I ID), name. Checked (PASS).',
            alt: listingAlt('stakeholder-decl'),
          },
          body: [
            {
              kind: 'bullets',
              items: ['The tool keeps the element ID; the text cannot write it', 'Declaration order: short name in `< >`, then name', 'Basic names: letters, digits, underscore; others quoted', '**Course convention:** each Phase I ID is a quoted short name'],
            },
            { kind: 'callout', tone: 'caution', text: 'Recorded result: `<EXT-001>` unquoted fails at the hyphen.' },
          ],
          sources: [R('R80', '49–50'), R('R90', '22')],
          notes: {
            teach: [
              'Every element has a unique element ID that does not change after the element is created, but the notation does not write it: it is managed by the tooling. Instead an element can be given a name and a short name, declared in that order, with the short name between angle brackets (R80 p.49). The graphical deck says the same and adds that the short name can be a user or tool selected id (R90 sl.22). That is the opening the course uses.',
              'The lexical rule decides the quotes. A basic name starts with a letter or an underscore and continues with letters, digits or underscores; any other name is an unrestricted name, written between single quotes (R80 pp.49–50). Our IDs contain hyphens, so they must be quoted.',
              'Course convention: every Phase I ID becomes a quoted short name, and the register’s wording becomes the name. References use the short name: Stakeholders::quote STK-005 quote. Because the ID is the same in the Week 1 register and in the model, anyone can follow the thread from document to model by ID.',
              'Recorded result: part angle-bracket EXT-001 without quotes fails with “mismatched input minus, expecting closing angle bracket”. The checker reads EXT as a name and stops at the hyphen.',
            ],
            why: 'The ID rule is what keeps the digital thread intact across Phase II; a model whose IDs do not match the register cannot be audited.',
            figure: 'Point at the three parts of line 1: part def, the short name in angle brackets and quotes, the name in quotes. Then line 3: the assessment metadata we meet in worked example II.',
            misconceptions: [{ claim: 'The short name is the element ID.', correction: 'The element ID is the tool’s identifier and is never written; the short name is a name we choose, here the Phase I ID.' }],
            transition: 'The register has more than IDs and names: statements, rationale, reasons. Where does that text go?',
            timing: '3 min: 1 min element ID versus names, 1 min the quoting rule, 1 min the convention and the recorded failure.',
          },
        },
        {
          id: 'w8s2-comments-doc',
          title: 'Comments, documentation and notes',
          purpose: 'Distinguish comments and documentation (in the model) from notes (text only), and give the course rule for where register prose goes.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-listing-comments-doc',
            caption: 'Comments, a note and documentation, quoted from the SysML v2 textual-notation training deck. Checked (PASS).',
            alt: listingAlt('comments-doc'),
          },
          body: [
            {
              kind: 'bullets',
              items: ['`/* … */` comment: part of the model', '`// …` note: in the text, not in the model', '`doc /* … */`: owned by the element it documents', '**Course convention:** register text with no modeled attribute goes into `doc`'],
            },
          ],
          sources: [R('R70', '7–8')],
          notes: {
            teach: [
              'Three kinds of text look alike and behave differently. A comment begins with slash-star and ends with star-slash and is part of the model; by default it annotates its owning namespace. A note begins with two slashes and runs to the end of the line: it is in the text but not part of the model (R70 sl.7). Documentation, doc followed by a comment, is a special kind of comment directly owned by the element it documents (R70 sl.8).',
              'Course convention: the Phase I statement, rationale and register fields that have no modeled attribute go into the element’s doc, so nothing in the package is lost; notes are for the modeler only, and a reviewer should never need one to understand the model.',
            ],
            why: 'Students otherwise put the register text in notes, where a tool export or a view will never see it.',
            figure: 'Point at line 1 (comment), line 12 (note) and line 17 (documentation of Automobile). Ask which of the three a view of the model could show: the comment and the doc.',
            misconceptions: [{ claim: 'Notes and comments are interchangeable.', correction: 'Only comments and documentation are model elements; notes vanish from the model.' }],
            transition: 'You now know enough syntax to write the skeleton. What do you type it into, and what decides whether it is right?',
            timing: '2 min: 1 min the three kinds, 1 min the course rule.',
          },
        },
      ],
    },
    // ============================================================================================ J. the toolchain (6 min)
    {
      id: 'w8s2-tools',
      title: 'The course toolchain',
      slides: [
        {
          id: 'w8s2-toolchain',
          title: 'The course toolchain',
          subtitle: 'What you type into, and what decides if it is valid',
          purpose: 'Answer the practical question of Phase II: where the model is written, how validity is decided, and what the in-app lab tool does (course facts from the toolchain documentation).',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-toolchain-flow',
            caption: 'The course toolchain (course convention): text in, checker decides validity, views and the lab tool support the work.',
            alt: "A left-to-right flow of five boxes joined by arrows. Box 1: 'Editor or SysML notebook (textual notation)'. Arrow labeled 'save' to box 2: 'team-NN-model-v01.sysml (one file per version)'. Arrow labeled 'check' to box 3, drawn bold: 'Course-designated checker: OMG SysML v2 Pilot Implementation, release 2026-08 (pilot of the 2.1 Beta 2 texts)'. Arrow to box 4: 'Log: PASS or FAIL, with ERROR and WARNING lines'. Under the flow, a second row: box 5 'Week 8 lab tool (in this app): import the Team Record, mapping table, findings, preview, export .sysml' with an arrow up into box 2 labeled 'generates the first draft'; beside it box 6 'AeroLink engineering model page (instructor example)'. Above box 1, a dashed box 'Eclipse SysON (optional, graphical editing)' with a dashed arrow into box 2. A footnote: grades follow the instructor's checker run.",
          },
          body: [
            {
              kind: 'bullets',
              items: ['Write the textual notation; one file per model version', 'The course-designated checker decides validity', 'The Week 8 lab tool imports your record and drafts the skeleton', 'Graphical editing (SysON) is optional, never graded'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Everything on this slide is a course decision, not a fact about SysML. The course writes models in the textual notation: in a text editor, or in a SysML notebook that uses the same release. Keep one file per model version, because the checker validates each file on its own: a file cannot borrow names from another file.',
              'The course-designated checker is the OMG SysML v2 Pilot Implementation, release 2026-08, published with the 2.1 Beta 2 texts this course cites. It is a pilot implementation, not the formal SysML 2.0 publication, and the grammar it accepts may differ in detail. Grades follow the instructor’s checker run on your submitted file.',
              'The app gives you two aids. The Week 8 lab tool imports your Team Record export, shows the mapping of every Phase I ID, lists findings, previews a generated SysML skeleton for your enterprise and exports it as a dot-sysml file; it is a teaching aid that writes a first draft, not a modeling tool. The AeroLink engineering model page shows the instructor example.',
              'Eclipse SysON, a graphical editor, is optional. Some of you will like seeing diagrams; nothing is graded on it.',
            ],
            why: 'Students need one unambiguous answer to “which tool is right”; without it, teams argue about tools instead of modeling.',
            figure: 'Follow the top row left to right: editor, file, checker in bold, log. Then the bottom row: the lab tool feeds a first draft into the file; the AeroLink page is for reference. The dashed SysON box is optional.',
            examples: ['Instructor preparation: confirm before class that the lab machines run the checker on the two tool-proof files; the student editor choice is still under faculty evaluation, so state it as “text editor or notebook”.'],
            misconceptions: [{ claim: 'The lab tool’s generated file is the team’s model.', correction: 'It is a first draft from the register; the team reviews, corrects and completes it, and owns every line.' }],
            transition: 'If the checker decides validity, what exactly does it decide, and what can it never decide?',
            timing: '3 min: 1 min text and files, 1 min the checker, 1 min the lab tool and the optional editor.',
          },
        },
        {
          id: 'w8s2-checker-decides',
          title: 'What the checker decides, and what it cannot',
          purpose: 'Make the validity–meaning distinction operational before the lab: the checker decides syntax, resolution and rule violations; the team decides meaning, completeness and fidelity.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-decides-columns',
            caption: 'Two columns: what the checker decides, and what only the team can decide.',
            alt: "Two columns under one heading 'One file, two judgments'. Left column, headed with a gear icon 'The checker decides': three rows, 'Syntax: does the text parse?', 'Names: does every name resolve, in the file and the standard library?', 'Rules: does any validation rule fire? ERROR fails the file; WARNING does not'. Right column, headed with a person icon 'You decide': four rows, 'Meaning: is it the right construct (definition or usage, composite or referential)?', 'Completeness: is every register item there?', 'Fidelity: does each doc say what the register says?', 'Purpose: does the model serve the decisions it is for?'. At the bottom, across both columns, a strip: 'Session 1, item 3: an attribute definition owning a part — PASS, no message'.",
          },
          body: [
            {
              kind: 'bullets',
              items: ['Checker: parses, resolves every name, runs its rules', 'An ERROR fails the file; a WARNING does not', 'It cannot judge meaning, completeness, fidelity or purpose', 'Recall: an attribute definition owning a part passed silently'],
            },
          ],
          sources: [R('R33b', '295–296')],
          notes: {
            teach: [
              'For each file the course checker does three things: it parses the text, it resolves every name against the file and the standard library, and it runs the pilot implementation’s validation rules. Any message of severity ERROR fails the file; a WARNING is reported but does not fail it. That is a course fact about this tool.',
              'What it cannot do is the right column. It does not know whether a stakeholder is the right one, whether a concern says what the register says, whether you chose a definition where a usage was needed, or whether the model serves its purpose. SEBoK puts the principle plainly: the purpose of a model must be defined first, and the quality of a model should not be confused with the quality of the design it represents (R33b pp.295–296).',
              'Recall the third card from Session 1: an attribute definition that owns a part passed with no message at all, although an attribute definition may not have composite features. The checker was silent because no rule in this release looks for it.',
              'This is why the rubric scores validity and structure semantics as separate rows: a file with zero errors can still score low on meaning.',
            ],
            why: 'The commonest Phase II misconception is that a PASS means done; the lab audit only makes sense once students see what PASS cannot show.',
            figure: 'Read the left column top to bottom, then the right; finish on the bottom strip, the case where the left column said PASS and the right column says wrong.',
            examples: ['Rubric note (instructor only): RB-8.1 validity and RB-8.3 structure semantics are separate criteria; this week both are formative.'],
            misconceptions: [{ claim: 'Zero errors and zero warnings means the model is correct.', correction: 'It means the file parsed, every name resolved and no rule fired; correctness is the team’s judgment against the register and the model’s purpose.' }],
            transition: 'With the language and the tools in place, we can define what “import” means in this course.',
            timing: '3 min: 1 min the checker’s three steps, 1 min the right column, 1 min the recalled example and the rubric.',
          },
        },
      ],
    },
    // ============================================================================================ K. the import (10 min)
    {
      id: 'w8s2-import',
      title: 'Importing the Systems Thinking package',
      slides: [
        {
          id: 'w8s2-import-mapping',
          title: 'The import is a mapping, not a copy',
          purpose: 'Define the course meaning of import: every artifact of the Week 7 package, by ID, gets a package and a construct, or a recorded reason to wait for a later week.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-mapping-arrows',
            caption: 'Every artifact of the package gets a home in the model; the Week 1 stakeholder register is modeled now, the rest is mapped to the week that models it (course convention).',
            alt: `Left: a document stack titled 'Systems Thinking Engineering Package (Week 7)' listing its parts: Week 1 register (ENT, EXT, PRT, STK, CON, REL, MGO, NEED); Week 2 ConOps and requirements; Week 3 technology, risk, trade study; Week 4 architecture; Week 5 components and interfaces; Week 6 roadmap. Right: a column of package boxes: Context, Stakeholders, Physical, Needs, Requirements, Behavior, Logical, Verification, Analysis, AROU, Evolution. Solid thick arrows run from the Week 1 register to Context, Stakeholders and Physical, labeled 'modeled now'. Dashed arrows run from the other parts to the other packages, each labeled with the week that models them: Needs and Requirements 'Week 9', Behavior and Logical 'Week 10', Physical components 'Week 11', Verification 'Week 12', Analysis and AROU 'Week 13', the Week 6 roadmap to Evolution 'Week 14'.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Every artifact, by ID: a package and a construct, or a reason to wait', `Week 8 models ${NOW_PREFIXES}; it maps the rest`, 'Nothing retyped from memory: the package is the source', 'Disagreements found while modeling are recorded, not silently fixed'],
            },
          ],
          sources: [R('R28', '374')],
          notes: {
            teach: [
              'Here is the course definition of import, a course convention: every artifact of your Week 7 package, by ID, gets a home in the model, a package, and a construct, such as a part definition or a concern, or an explicit reason why it waits for a later week. The literature gives us the constructs; it does not give a method for migrating a document package into a SysML v2 model, so this method is the course’s.',
              `Week 8 models the Week 1 register: ${NOW_PREFIXES}. It maps everything else, so Weeks 9 to 13 fill packages that already exist and know which IDs they must hold.`,
              'Two working rules. Nothing is retyped from memory: the exported package is the source, and the lab tool reads it directly. And when modeling exposes a disagreement, a name that differs, a concern with no stakeholder, you record it in the audit note; you do not quietly fix the model and leave the register wrong.',
              'What happens to the documents? They do not disappear. SEBoK notes that where stakeholders expect documents, a hybrid approach generates documents from the model as static representations for milestones (R28 p.374). Your Week 14 review documents should come out of this model.',
            ],
            why: 'Without a precise definition, teams “import” by retyping a few favorite elements and lose the rest; the mapping makes the whole package accountable.',
            figure: 'Point at the three solid arrows first: the Week 1 register becomes Context, Stakeholders and the system-of-interest part now. Then sweep the dashed arrows and read their week labels.',
            misconceptions: [{ claim: 'Importing means copying every Phase I table into the model this week.', correction: 'Week 8 models the register and maps the rest; later weeks model each part with the constructs they teach.' }],
            transition: 'The mapping is a matrix. Here it is for the course, kind by kind.',
            timing: '3 min: 1 min the definition, 1 min modeled now versus mapped, 1 min the two rules and documents from the model.',
          },
        },
        {
          id: 'w8s2-matrix',
          title: 'The artifact-to-model mapping matrix',
          subtitle: 'Course convention: which Phase II week models each Phase I ID kind',
          purpose: 'Show the course mapping of every Phase I ID kind to the week that models it; the full matrix with packages, constructs and the AeroLink counts is in the lesson.',
          minutes: 4,
          layout: 'table',
          body: [{ kind: 'table', header: ['Modeled in', 'Phase I ID kinds'], rows: MATRIX_ROWS, caption: 'Course mapping (convention)' }],
          sources: [],
          notes: {
            teach: [
              `Read the table row by row; it covers all ${N_KINDS} ID kinds of the course scheme. Week 8 models ${NOW_PREFIXES}: the enterprise and the elements inside the boundary, the external systems, the stakeholders, their concerns and their relationships. Week 9 models the mission and goals, needs and requirements. Week 10 behavior and logic: scenarios as use cases, capabilities, functions and logical elements. Week 11 the physical side: information items, components and interfaces. Week 12 measures and verification. Week 13 technology, the assumptions, risks, opportunities and unknowns, and the trade study with its decision. Week 14 the roadmap increments.`,
              `The lesson gives the full matrix: for each kind, its package, the SysML v2 construct it becomes, and the AeroLink count. For AeroLink that is ${countOf('STK')} stakeholders, ${countOf('CON')} concerns, ${countOf('EXT')} external systems and ${countOf('REL')} relationships modeled now, and, for example, ${countOf('REQ-STK') + countOf('REQ-SYS')} requirements mapped to Week 9.`,
              'Two judgment calls students meet. First, kinds with no obvious home: a measure of effectiveness is owned by whatever it measures, so its package depends on the thing measured. Second, kinds your package may not have, such as roadmap increments, are mapped to the Evolution package, present in the skeleton, whose form is decided with the instructor in Week 14.',
              'Teams decide and record where kinds without an obvious home go. The reason is graded, not the choice.',
            ],
            why: 'The matrix is the hardest decision of the lab and the backbone of the digital thread; seeing it once whole, on a familiar case, makes the team’s own matrix a fill-in task rather than a design task.',
            examples: ['A food-bank team with a “DONOR-n” prefix of its own: the matrix has no row for it, so the lab tool lists it as unmapped; the team chooses a package (Context, as an external system) and records why.'],
            misconceptions: [{ claim: 'Kinds modeled later can be left out of the matrix until then.', correction: 'Every kind is mapped now, with its week; the matrix is complete this week even though the model is not.' }],
            transition: 'The matrix decides the packages. Next, the skeleton that holds them.',
            timing: '4 min: 2 min the rows, 1 min AeroLink counts, 1 min the two judgment calls.',
          },
        },
        {
          id: 'w8s2-skeleton',
          title: 'The model’s package structure',
          purpose: 'Show the model v0.1 skeleton: the course packages, each later package with a doc naming the week that fills it, and the purpose in the root documentation.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-package-skeleton',
            caption: 'Model v0.1: the course packages, with the week that fills each (course convention).',
            alt: `A root package box labeled 'Model v0.1' with a header strip 'doc: Purpose — who uses this model, for which decisions'. Inside, ${MODEL_PACKAGES.length} package tabs in two rows: ${MODEL_PACKAGES.map((p) => `${p.name} (${p.filledIn === 8 ? 'Week 8, modeled now' : `Week ${p.filledIn}`}: ${p.holds})`).join('; ')}. Packages filled in Week 8 are drawn solid and shaded; the others are drawn with dashed outlines and a small doc label 'filled in Week N'.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['One root package; the purpose in its `doc`', `${MODEL_PACKAGES.length} course packages, mirroring the matrix`, 'Every empty package says which week fills it', 'Private imports at the top'],
            },
          ],
          sources: [R('R70', '6'), R('R70', '8')],
          notes: {
            teach: [
              `The skeleton is one root package with ${MODEL_PACKAGES.length} course packages, a course convention taken from the AeroLink reference model, plus the Evolution package for the Week 14 roadmap: ${MODEL_PACKAGES.map((p) => p.name).join(', ')}. Context, Stakeholders and the system-of-interest part of Physical are filled this week; ${LATER_PACKAGES.length} packages wait.`,
              'Every package that is still empty carries documentation saying which week fills it and which IDs it will hold. Documentation, remember, is owned by the element it documents (R70 sl.8), so a reviewer opening the Needs package reads that NEED-001 to NEED-017 arrive in Week 9.',
              'The root documentation states the model’s purpose: who uses it and for which decisions, the principle from Session 1. Imports sit at the top with explicit, private visibility (R70 sl.6).',
              'The lab tool generates exactly this structure from your record. Your work is to review it, write the purpose in your own words and make the documentation true for your enterprise.',
            ],
            why: 'A complete skeleton turns six later weeks into “fill this package” tasks, and an empty package with a doc is evidence that the gap is planned, not forgotten.',
            figure: 'Point at the purpose strip first; then the shaded packages (this week) and the dashed ones with their week labels.',
            misconceptions: [{ claim: 'Empty packages should be deleted until they are needed.', correction: 'They stay, with a doc that names the week; the structure is the plan and the reviewer checks it.' }],
            transition: 'The first artifact we model, not just map, is the one Phase I started with: who the stakeholders are and what they care about.',
            timing: '3 min: 1 min the packages, 1 min the docs on empty packages, 1 min purpose and what the tool generates.',
          },
        },
      ],
    },
    // ============================================================================================ L. stakeholders and concerns (13 min)
    {
      id: 'w8s2-stakeholders',
      title: 'Stakeholders and concerns as model elements',
      slides: [
        {
          id: 'w8s2-stakeholder-concern',
          title: 'Stakeholders and concerns in SysML v2',
          purpose: 'Teach the concern construct and stakeholder parameters from the deck and the specification: definitions, the subject-first rule, part-typed stakeholders.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-listing-concern-adapted',
            caption: 'Two concerns with their subject and stakeholders, adapted from the SysML v2 textual-notation training deck. Checked (PASS).',
            alt: listingAlt('concern-adapted'),
          },
          body: [
            {
              kind: 'definition',
              term: 'Stakeholder; concern',
              text: 'A stakeholder is a person, organization or other entity with concerns to be addressed. A concern is a specific topic that one or more stakeholders desire to be addressed.',
              source: R('R77', '115'),
            },
            { kind: 'bullets', items: ['Declared like a requirement, keyword `concern`', 'Subject first, before any stakeholder', 'Stakeholder parameters are part usages, typed by part definitions'] },
          ],
          sources: [R('R77', '115'), R('R83', '166–167')],
          notes: {
            teach: [
              'Read the deck’s two definitions on the slide; they match the Week 1 definitions closely, which is why the import is natural (R77 sl.115).',
              'The specification defines the construct: a concern is declared exactly like a requirement, with the keyword concern instead of requirement; the intent is that the concerns of one or more stakeholders are modeled as the required constraints of a concern with stakeholder parameters (R83 p.167).',
              'Two rules from the page before. The subject is declared with the keyword subject and must come before any other parameter. Stakeholder parameters, like actor parameters, are part usages, so they must be defined by part definitions (R83 p.166). The deck says the same in classroom words: a subject must be declared first, before any stakeholders; stakeholders may be specified for any kind of requirement, not only concerns (R77 sl.115).',
              'That second rule is why the course models each Phase I stakeholder as a part definition: the stakeholder line in a concern needs a part definition to type it.',
            ],
            why: 'Students must see that the course mapping (STK as part definition, CON as concern) follows from the language rules, not from taste.',
            figure: 'Point at line 7, subject system, first in the body; then lines 8 and 9, the two stakeholder parameters typed by the part definitions on lines 2 and 3.',
            examples: ['Instructor-only source caution: the deck declares part def ‘Systems Engineer’ but types a stakeholder as ‘systems engineer’; names are case sensitive, so the deck text would not resolve. That is a slide typo, not a rule; the course listing uses one spelling.'],
            misconceptions: [{ claim: 'A stakeholder can be declared as a string or a comment in the concern.', correction: 'A stakeholder parameter is a part usage, so it must be typed by a part definition.' }],
            transition: 'Why model concerns now, when the needs come next week? Because later elements frame them.',
            timing: '3 min: 1 min definitions, 1 min the construct, 1 min the two rules and the consequence.',
          },
        },
        {
          id: 'w8s2-frame',
          title: 'Where concerns go next: framed by needs and viewpoints',
          purpose: 'Show that concerns are anchors: needs (Week 9) and viewpoints (Week 14) frame them, so a concern lost in Week 8 breaks later traces.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-listing-need-frames',
            caption: 'From the AeroLink reference model: a need that frames a Week 1 concern (the construct Week 9 teaches). Checked (PASS).',
            alt: listingAlt('need-frames'),
          },
          body: [
            {
              kind: 'bullets',
              items: ['A requirement can `frame` a concern', 'A framed concern becomes a required constraint of its container', 'A viewpoint frames the concerns a view must address', 'Week 9: needs frame your concerns; Week 14: viewpoints do'],
            },
          ],
          sources: [R('R83', '167'), R('R77', '116'), R('R85', '181')],
          notes: {
            teach: [
              'One or more concerns can be framed in other requirement definitions and usages, with the keyword frame; a framed concern is a subrequirement and is therefore automatically a required constraint of its containing requirement (R83 p.167). In plain words: when a need frames a concern, satisfying the need includes addressing the concern.',
              'The same mechanism reaches the end of the course. A viewpoint is a requirement to present information from a model in a view that addresses certain stakeholder concerns; it frames those concerns, and any requirement may frame relevant concerns (R77 sl.116). A viewpoint definition is a kind of requirement definition that frames the concerns of stakeholders, and its subject is a view (R85 p.181).',
              'So the Week 1 concern is an anchor at both ends of Phase II: in Week 9 your needs frame it, and in Week 14 the stakeholder views you present are defined by viewpoints that frame it. If a concern is missing or renamed now, both traces break later.',
            ],
            why: 'Knowing what consumes a concern explains the care the import demands and previews the Week 9 construct.',
            figure: 'Point at line 5, frame Stakeholders::CON-006: the need refers to the concern by its quoted short name, the ID we imported.',
            misconceptions: [{ claim: 'Framing a concern copies it into the need.', correction: 'The need refers to the concern; the concern stays one element, owned in Stakeholders.' }],
            transition: 'Now the worked example: AeroLink’s Week 1 register as a model, starting with the context.',
            timing: '3 min: 1 min frame, 1 min viewpoint, 1 min what it means for the import.',
          },
        },
        {
          id: 'w8s2-worked-context',
          title: 'AeroLink worked example I: the context',
          purpose: 'Model the Week 1 system of interest and context: the enterprise as a part definition, the context part, the referenced system of interest and the external systems as part usages with their IDs.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-listing-context-worked',
            caption: 'The AeroLink context in the generated Week 8 model (FICTIONAL): the enterprise, the system of interest and six external systems. Checked (PASS).',
            alt: listingAlt('context-worked'),
          },
          body: [
            {
              kind: 'bullets',
              items: ['ENT-001: a part definition, the enterprise', 'The context part refers to the system of interest', `${N_EXT} external systems: part usages with their IDs`, 'Names as systems, not as the organizations behind them'],
            },
          ],
          sources: [R('R80', '64'), R('R70', '9'), R('R80', '48–49')],
          notes: {
            teach: [
              'ENT-001, AeroLink Urban Mobility, is a part definition in the Context package: it defines the enterprise, with its domain, problem and mission in its documentation. Recall Session 1: SysML has no system or enterprise keyword; anything with structure and behavior is a part (R80 p.48).',
              `The context is one part usage, context. Inside it, the system of interest is a ref part: a referential usage, a simple reference to something owned elsewhere, here in the Physical package (R80 p.64; R70 sl.9). The ${N_EXT} external systems are composite part usages of the context, each with its Phase I ID as short name.`,
              'Read the names: Controlled airspace, Electric grid, Aircraft and spares supply, Emergency response service. Week 1 corrected these to name each external system as a system, and to record the organization behind it as a stakeholder. The reference SysML files still carried the organization names; logging and correcting that was part of this import.',
              'Ask the class: why is the system of interest a ref part here? Because a context does not create or destroy the system: if a context instance ends, the system goes on. That is referential semantics, a statement about instances (R80 p.64). Keep it apart from editing the model: in the model, Physical owns soi whether this usage is ref or not, and deleting the context element deletes only what the context owns (R80 p.49).',
            ],
            why: 'The context is the simplest part of the register to model and exercises composite versus referential, the distinction students most often get wrong.',
            figure: 'Point at line 1 (the definition), line 6 (the reference, colon-greater-than to Physical::soi) and lines 7 to 12 (the six usages with their short names).',
            misconceptions: [
              { claim: 'External systems should be part definitions inside Context, not usages.', correction: 'Each external system is a usage in the context, typed by its own definition; the usage carries the ID and the role it plays here.' },
              { claim: 'ref protects an element from being deleted with the model element that refers to it.', correction: 'ref is about instances: a referenced instance does not end with its container. Deleting a model element follows ownership, ref or not.' },
            ],
            transition: 'Next the heart of the register: stakeholders, concerns, the ratings and the relationships.',
            timing: '3 min: 1 min the enterprise, 1 min context and ref part, 1 min the names and the question.',
          },
        },
        {
          id: 'w8s2-worked-stakeholders',
          title: 'AeroLink worked example II: stakeholders, concerns, ratings, relationships',
          purpose: 'Model the full Week 1 register: every stakeholder as a part definition with its ratings, every concern with subject and stakeholder, and every relationship as a tagged dependency.',
          minutes: 4,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-listing-stakeholder-worked',
            caption: 'One stakeholder, one of its concerns and the conflict it is part of, from the generated AeroLink model (FICTIONAL). Checked (PASS).',
            alt: listingAlt('stakeholder-worked'),
          },
          body: [
            {
              kind: 'bullets',
              items: [`${N_STK} stakeholders as part definitions; ${N_CON} concerns`, 'Ratings and reasons as metadata (course convention)', `${RELATIONSHIPS.length} relationships as dependencies with a keyword`],
            },
            { kind: 'callout', tone: 'key', title: 'Direction rule', text: '`from A to B`: A, the client, depends on B, the supplier; a change to B may change A (SysML v2.1 Beta 2, Part 1, 7.3). FAA regulates OEM: `#regulatedBy … from STK-011 to STK-002`.' },
          ],
          sources: [R('R77', '108–109'), R('R80', '50–51'), R('R69', '193'), R('R83', '166–167')],
          notes: {
            teach: [
              `Every Week 1 stakeholder becomes a part definition with its ID and register name: ${N_STK} of them, including ${STK_PROPOSED.join(', ')}, the class added in the Week 1 review. Every concern becomes a concern whose subject is the enterprise and whose stakeholder parameter is typed by the stakeholder’s part definition: ${N_CON} concerns.`,
              'The register ratings, interest, influence, support and their reasons, need somewhere to live. The course convention is a metadata definition, StakeholderAssessment. The deck shows the mechanism: metadata is defined with a metadata definition and applied as an annotation; the at sign is equivalent to the keyword metadata; and if the definition has nested features, they must be bound to values in the annotation (R77 sl.108–109). That last rule is why the lab tool leaves the annotation off a stakeholder whose influence was never rated, and reports a gap instead.',
              'Relationships. A dependency is a relationship between client and supplier elements, written dependency, from, to (R80 pp.50–51). Read the direction rule on the slide: the from element is the client, the dependent; the specification says a change to a supplier may result in a change to a client, and its example has the application layer depend on the service layer (R80 pp.50–51). The specification adds that a dependency can be extended by user-defined keywords (R80 p.51). The course defines one keyword per Week 1 relationship type and names it from the dependent: the register line STK-002 regulates STK-011 becomes hash regulatedBy dependency REL-001 from STK-011 to STK-002, and likewise suppliedBy and fundedBy. Conflicts, coordination and partnership are symmetric: the register’s order is kept and the direction carries no meaning, as in hash conflictsWith REL-002 on the listing. The mechanism is in the specification: a user-defined keyword is the name or short name of a metadata definition preceded by the hash symbol, and it can be used in dependency declarations, placed just before the keyword dependency (R69 p.193). The model declares one metadata definition per relationship type, short name regulatedBy and so on; which types get a keyword, and their names, is the course convention.',
              `Query test for the class: to list every stakeholder with influence of four or more, is it easier from a number inside doc text or from a metadata attribute? The metadata attribute: a tool can read it. AeroLink: ${N_REL_TYPES} relationship types, one conflict, ${CONFLICT.id}.`,
            ],
            why: 'This slide is the import in miniature; every construct the team uses for its own register appears once, with its source or its course label.',
            figure: 'Point at line 1 to 4, the stakeholder with its assessment on line 3; lines 5 to 9, the concern with subject on line 7 and stakeholder on line 8; lines 10 to 12, the relationship.',
            examples: [`Generated keywords, each read “from-element keyword to-element”: ${Object.values(REL_KEYWORDS).map((k) => `${k.keyword} (${k.direction === 'reversed' ? 'written from the register’s target' : k.direction === 'symmetric' ? 'symmetric' : 'register order'})`).join(', ')}.`, 'Why it matters later: Weeks 12 and 13 follow dependencies to answer “what is affected if this changes?”, from the supplier to its clients. A dependency written the wrong way passes the checker and gives the wrong answer.'],
            misconceptions: [{ claim: 'A relationship between stakeholders should be a part or a comment.', correction: 'It relates two elements, so it is a relationship: a dependency, tagged with its type.' }],
            transition: 'The model passes the checker. Does it say what the register says? That is the audit.',
            timing: '4 min: 1 min stakeholders and concerns, 1 min metadata, 1.5 min relationships and the direction rule, 30 s the query question.',
          },
        },
      ],
    },
    // ============================================================================================ M. audit and bridge (5 min)
    {
      id: 'w8s2-audit',
      title: 'Auditing the import, and the bridge to Week 9',
      slides: [
        {
          id: 'w8s2-worked-audit',
          title: 'AeroLink worked example III: auditing the import',
          purpose: 'Apply the four audit questions to the AeroLink import, separating what the tool answers (completeness, structure) from what only the team can answer (fidelity, gaps).',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-audit-checklist',
            caption: 'The four audit questions applied to the AeroLink import, with the result and the disposition of each (FICTIONAL).',
            alt: `A four-row checklist table with columns Question, Result, Disposition and a status mark. ${AEROLINK_AUDIT.map((a) => `Row '${a.question}': ${a.result} Disposition: ${a.disposition} Mark: ${a.ok ? 'check' : 'gap'}.`).join(' ')} A side label spans rows 1 and 2: 'the tool answers'; a side label spans rows 3 and 4: 'the team answers'.`,
          },
          body: [
            {
              kind: 'bullets',
              items: [
                `Completeness: ${S.stakeholders.model}/${S.stakeholders.record} stakeholders, ${S.concerns.model}/${S.concerns.record} concerns, ${S.externals.model}/${S.externals.record} external systems`,
                'Structure: every concern has a subject and a stakeholder',
                'Fidelity: differences logged, then corrected',
                'Gaps: each with a recorded disposition',
              ],
            },
          ],
          sources: [],
          notes: {
            teach: [
              `Four questions, a course convention: ${AUDIT_QUESTIONS.map((q) => q.label).join(', ')}. The first two the lab tool answers mechanically from the record and the generated file. For AeroLink: ${S.stakeholders.model} of ${S.stakeholders.record} stakeholders, ${S.concerns.model} of ${S.concerns.record} concerns and ${S.externals.model} of ${S.externals.record} external systems are in the model, each once; every concern has the enterprise as subject and a stakeholder; ${S.relationships} relationships, ${S.conflicts} a conflict.`,
              'The last two need a person. Fidelity: the reference SysML files had kept the earlier wording of CON-015 and named four external systems after organizations. Those differences were logged first and then corrected, because the Week 1 case is the canonical source.',
              'Gaps: the stakeholder class STK-015 and its concern CON-017 are in this model but not yet in the shared reference baseline the later-week tools read; and CON-015 still has no need, by the decision recorded in Week 1. Each gap carries a disposition. A silent gap is a defect; a reasoned gap is a decision.',
              `The tool’s own findings for AeroLink: ${DEFECTS} defects, ${GAPS} gaps and ${LATER_FINDINGS} lines of kinds mapped for later weeks.`,
            ],
            why: 'The audit is where the team checks meaning, the thing the checker cannot do; seeing a real audit with real gaps legitimizes recording rather than hiding them.',
            figure: 'Read the rows top to bottom; point at the side labels: rows 1 and 2 the tool answers, rows 3 and 4 the team answers. The gap mark on row 4 is expected, not a failure.',
            misconceptions: [{ claim: 'A good import has no gaps.', correction: 'A good import has no silent gaps: every gap is listed with its disposition.' }],
            transition: 'Where do these concerns go next week?',
            timing: '3 min: 1 min completeness and structure, 1 min fidelity, 1 min gaps and the findings.',
          },
        },
        {
          id: 'w8s2-bridge',
          title: 'Bridge: Week 9',
          purpose: 'Show where the modeled concerns go next: Week 9 needs frame them, requirements derive from needs, and Week 14 viewpoints frame them again.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w8s2-bridge',
            caption: 'A concern modeled this week is framed by a need in Week 9 and by a viewpoint in Week 14.',
            alt: "Three boxes left to right. Left, solid and highlighted: 'CON-006 Pad throughput and charging capacity (Week 8, modeled now)'. Middle, dashed: 'NEED-004 Pads not limited by turnaround (Week 9: requirement)' with an arrow to the left box labeled 'frame'. Below the middle box, a dashed box 'stakeholder and system requirements (Week 9)' with an arrow up to NEED-004 labeled 'derived from'. Right, dashed: 'Operator view viewpoint (Week 14)' with a long arrow to the left box labeled 'frame'.",
          },
          body: [],
          sources: [R('R83', '167')],
          notes: {
            teach: [
              'Week 9 models the Week 2 needs and requirements. Each need will frame the concerns it answers, exactly the frame line we saw in the reference model; requirements will get subjects and be derived from needs.',
              'Today’s concerns already use the requirement pattern: a concern is declared like a requirement (R83 p.167), so next week’s constructs are a small step. Bring your model v0.1 to Week 9 with its concerns intact and correctly named; Week 9 builds directly on them.',
            ],
            why: 'A short bridge keeps the continuity explicit, as the course schedule requires of every Phase II week.',
            figure: 'Left box first, this week; then the two framing arrows; then the derived requirements below the need.',
            transition: 'Now your team does the same for its own enterprise.',
            timing: '2 min: 1 min Week 9, 1 min what to bring.',
          },
        },
      ],
    },
    // ============================================================================================ N. laboratory launch (22 min)
    {
      id: 'w8s2-lab',
      title: 'Laboratory launch',
      slides: [
        {
          id: 'w8s2-lab-brief',
          title: 'Lab L8: model v0.1 of your enterprise',
          subtitle: 'Due before Week 9 Session 1, on the LMS; your own enterprise, never AeroLink',
          purpose: 'Give unambiguous instructions for model v0.1: the three files, what each contains, the deadline, the workload and the AI statement.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-deliverables',
            caption: 'Lab L8 deliverables: three files, one upload (course convention).',
            alt: `Three file cards side by side. ${LAB8_OUTPUTS.map((o, i) => `Card ${i + 1}: '${o.file}' — ${o.what}.`).join(' ')} Under the cards a strip: 'One upload by one member, before Week 9, Session 1. AI usage statement included in the mapping matrix file.'`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Your own enterprise, never AeroLink', `Three files: ${outputFiles.join(', ')}`, 'Zero checker errors in the final run; every warning explained', 'Formative feedback before Week 9 Session 2'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              `Read the three files. First, ${outputFiles[0]}: the skeleton with your purpose statement, the Context and Stakeholders packages fully modeled from your Week 1 register, and every later package present with the week that fills it. Second, ${outputFiles[1]}: the mapping matrix for the whole Systems Thinking package, with a reason for every non-obvious choice, and the import audit with a disposition for every gap. Third, ${outputFiles[2]}: the tool proof, then the final run of model v0.1 with zero errors.`,
              `Minimums, course convention: every stakeholder, concern and external system of your record is in the model; at least ${LAB8_MINIMUMS.relationships} relationships with at least ${LAB8_MINIMUMS.conflicts} conflict; a purpose of at least ${LAB8_MINIMUMS.purposeWords} words saying who uses the model and for which decisions.`,
              `Workload: about ${LAB8_TEAM_HOURS} person-hours out of class for a team of four, about ${HOURS_FOUR_EACH} hours each. A team of three works to a reduced scope, pending faculty approval: ratings stay in documentation, only conflict relationships are modeled, the Weeks 3 to 6 kinds are counted rather than argued; about ${THREE_TOTAL} person-hours, the same load per person.`,
              'The AI usage statement goes in the matrix file. AI-generated SysML must pass the checker and be explained line by line by its owner; the lab tool’s generated draft counts as a tool output you review, not as your work until you have checked every line against the register.',
            ],
            why: 'Unambiguous deliverables and scope prevent careful work on the wrong thing, and stating the load per person makes the three-person rule visible.',
            figure: 'Read the three cards left to right, then the strip with the deadline.',
            examples: ['Rubric rows applied this week (instructor only): RB-8.1, 8.2, 8.3 in part, 8.6 for Context and Stakeholders only; RB-1.3 and 1.4 as fidelity checks; RB-9.4 in part (the audit); RB-12.1–12.3. Grading mode is formative now; summative RB-8 at a later model checkpoint (faculty decision).', `Person-hours by task (team of four): ${LAB8_PERSON_HOURS.map((t) => `${t.task} ${t.hours}`).join('; ')}.`],
            misconceptions: [{ claim: 'The generated file can be submitted as is.', correction: 'It is a draft: the purpose is a placeholder, and only the team can check fidelity and decide the gaps.' }],
            transition: 'Start now: open the lab tool and import your Team Record.',
            timing: '3 min: 1 min the files, 1 min minimums and workload, 1 min AI and the generated draft.',
          },
        },
        {
          id: 'w8s2-lab-matrix',
          title: 'Team work: import, map and start the skeleton',
          subtitle: '12 minutes, in teams, in the Week 8 lab tool',
          purpose: 'Run the first lab steps in class with the instructor circulating: import the Team Record export, review the mapping and the findings, decide the unmapped kinds, and draft the purpose.',
          minutes: 12,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-lab-tool-steps',
            caption: 'The lab tool in four steps: import, map, review the findings, preview and export.',
            alt: `Four numbered panels left to right, like screens. Panel 1 'Import': a file drop area labeled 'Week 1 model inputs (.json), versions 1 to 3; optional Week 2 model inputs', and a message line 'AeroLink records are refused: import your own'. Panel 2 'Map': a table with columns Kind, Package, Construct, Week, Count; rows for ENT, STK, CON marked 'modeled now', NEED marked 'Week 9', TECH marked 'enter count'. Panel 3 'Findings': four colored tags with labels: ${FINDING_CLASSES.map((f) => f.label).join(', ')}; beside each gap a text box 'disposition'. Panel 4 'Preview and export': a code preview with the first lines of a package and the purpose doc, and two buttons 'Export .sysml' and 'Export mapping matrix (.md)'.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Import your Week 1 export (and Week 2, if you have it)', 'Enter counts for the Weeks 3–6 kinds; decide any unmapped kind', 'Read every defect and gap; draft a disposition', 'Write the purpose; preview the skeleton'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Set a visible 12-minute timer. One laptop per team drives the tool; the others hold the Week 7 package open so the team can check the tool against it.',
              'Minutes 0 to 3: import. Each team imports its Week 1 model-inputs export; teams with a Week 2 export import it too. Walk the room and check that every team sees its own enterprise name at the top. If a file is refused, read the message with the team: the usual causes are the Markdown record instead of the JSON file, or a hand-edited file with a duplicate ID. A team whose export is lost uses a teammate’s saved copy; if none exists, it starts the matrix by hand from the Week 7 package and imports after class.',
              'Minutes 3 to 7: map. The tool fills the rows for the kinds in the imported files. Teams enter counts for the Weeks 3 to 6 kinds from the package and choose a package for any kind the course mapping does not cover, with a reason. Ask each table: which row was hardest, and why?',
              'Minutes 7 to 10: findings. Defects first: a defect means the item could not be written as valid SysML, usually a relationship that names an ID that is not a registered stakeholder, so it was left out. The fix is in the Week 1 record. Then gaps: a stakeholder without a concern, an unrated stakeholder, a relationship without a type. Each needs a one-line disposition draft now.',
              'Minutes 10 to 12: purpose. Each team writes one sentence: who uses this model, for which decisions. Then preview the skeleton and check one stakeholder and one concern against the register aloud. Common mistakes to catch: a purpose that describes the enterprise rather than the model’s use; dispositions that say “fix later” with no owner.',
            ],
            why: 'Starting the hardest decisions with the instructor in the room prevents a week of work on a wrong mapping, and early contact with the findings stops teams treating the generated draft as finished.',
            figure: 'Point at the panels in order as the timer passes each phase; panel 3 is where the instructor spends most time.',
            examples: ['A typical defect: REL-003 from STK-004 to STK-012 when the register stops at STK-010; the stakeholder was deleted in Week 1 but the relationship stayed.'],
            misconceptions: [{ claim: 'A gap must be fixed before export.', correction: 'Export works with gaps; each gap needs a disposition in the audit note, which may be “fix in the record” or a reason it stays.' }],
            transition: 'Before anyone leaves, every member proves the checker runs.',
            timing: '12 min: 3 import, 4 map, 3 findings, 2 purpose and preview.',
          },
        },
        {
          id: 'w8s2-lab-proof',
          title: 'Checkpoint: prove the toolchain',
          subtitle: 'Every member shows two outputs: the pass file and the fail file',
          purpose: 'Ensure no team leaves without a working checker: the team shows its installation, each member shows the outputs of the pass file and the fail file run on any working installation, with the lab machines as the fallback.',
          minutes: 5,
          layout: 'figure-bullets',
          figure: {
            id: 'w8s2-listing-tool-proof-fail',
            caption: 'The fail file of the tool proof, numbered as in the file (its three header comment lines are not shown): an unquoted ID on line 9. The checker must reject it. Checked (FAIL, as intended).',
            alt: listingAlt('tool-proof-fail'),
          },
          body: [
            {
              kind: 'bullets',
              items: ['Pass file: expect PASS, no message', 'Fail file: expect FAIL at the unquoted ID', 'Keep both outputs for the checker log', 'No working installation: team’s or lab machine today'],
            },
          ],
          sources: [R('R80', '49–50')],
          notes: {
            teach: [
              `Every member runs the two provided files. The pass file, a minimal enterprise with one external system and one concern, must give: ${listing('tool-proof-pass').recorded} The fail file must give: ${listing('tool-proof-fail').recorded} The fail file proves the checker can fail; a checker that passes everything is not checking.`,
              'Walk the rows and look at each screen: two outputs, the right status on each. Members paste both into the checker log; that is the first section of the third deliverable.',
              'Fallback: the install guide on the Laboratory page lists the usual failures, a JRE instead of a JDK, a blocked download, a part-unpacked library on a long Windows path. A member without a working installation runs the two files on the team’s installation or a lab machine today; a team with none books a fix with the teaching assistant before day 3. Do not let a team spend the week without one working checker.',
              'Why the fail file fails, once more: the course ID contains a hyphen, so it must be a quoted short name; a hyphen is not allowed in a basic name (R80 pp.49–50).',
            ],
            why: 'A team that discovers on day 6 that its checker does not run loses the week; a two-file proof catches it now.',
            figure: 'Point at line 9, the unquoted EXT-001: the figure keeps the file’s line numbers, so it is the line the message names, line 9, column 12.',
            misconceptions: [{ claim: 'If the pass file passes, the setup is proven.', correction: 'Both files are needed: the fail file shows the tool reports errors at all.' }],
            transition: 'Close with the next seven days.',
            timing: '5 min: about 30 s per member, run in parallel at each table, 1 min for fallbacks.',
          },
        },
        {
          id: 'w8s2-lab-close',
          title: 'Close: the next seven days',
          subtitle: 'Quiz Q8 and the applied exercise open today. Log your hours.',
          purpose: 'Give the out-of-class plan with lead roles, the assessments and the time log.',
          minutes: 2,
          layout: 'figure',
          figure: {
            id: 'w8s2-seven-days',
            caption: 'A suggested seven-day plan for Lab L8, with the lead role for each task (course convention).',
            alt: "A timeline of days 1 to 7 with bars. Days 1–2: mapping matrix and skeleton with purpose, Architecture; each member writes the doc of at least one package. Day 3: Context package, Architecture. Days 3–4: Stakeholders package (stakeholders, concerns, ratings), Requirements & Compliance; relationships, Architecture. Day 5: import audit with dispositions, Verification & Validation. Day 6: checker runs to zero errors, AI & Data runs, owners fix; AI usage statement. Day 7: integration review and upload, Verification & Validation.",
          },
          body: [],
          sources: [],
          notes: {
            teach: [
              'Walk the plan once; it is a suggestion and the charter decides. The matrix and skeleton come first because every later step needs a place in the model; the audit comes after the modeling and before the last checker runs, because the audit often changes the model.',
              `Assessment: readiness quiz Q8, individual, about 15 minutes, and the individual applied exercise on an unseen case, about ${EXERCISE_MINUTES} minutes; graduate students write the KerML memo instead of the exercise. Everything is due before Week 9 Session 1. Log your hours: the estimate is tested against them.`,
            ],
            why: 'A concrete plan with owners turns the brief into daily actions and makes individual accountability visible.',
            figure: 'Read the bars left to right; point at day 5, the audit, before day 6, the final checker runs.',
            misconceptions: [{ claim: 'The checker run is the last step and the audit is optional.', correction: 'The audit decides what the model must change; run the final checker after it.' }],
            transition: 'End of Week 8. Week 9 models your needs and requirements in the packages you just created.',
            timing: '2 min: 1.5 min plan and assessment; 30 s questions.',
          },
        },
        {
          id: 'w8s2-references',
          title: 'References and credits',
          purpose: 'List every source the session cites, with the license statements the sources require.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Leave this slide up while teams pack up; no commentary is needed. The list is generated from every citation in the session, and the credits include the license statement of the training deck and SEBoK’s required attribution.'],
            why: 'Students should be able to find every source the session relied on, and the sources’ licenses require the attribution.',
            transition: 'End of the deck.',
            timing: '0 min: shown during the close.',
          },
        },
      ],
    },
  ],
  // ============================================================================================ student lesson
  studentLesson: [
    {
      id: 'w8s2-l-packages-names',
      title: 'Packages, qualified names and IDs',
      blocks: [
        { kind: 'para', text: 'A model of a whole enterprise holds hundreds of elements. Before anything else, it needs an organization that people can navigate and a way for one element to refer to another without ambiguity. SysML v2 gives both through namespaces. The language overview of the SysML v2.1 Beta 2 specification (Part 1) lists, among the concepts SysML takes from KerML, namespaces that contain and name elements, and particularly packages used to organize the elements of a model. A package is a kind of namespace used solely as a container for other elements to organize the model.' },
        { kind: 'figure', slide: 'w8s2-packages' },
        { kind: 'para', text: 'The word solely is worth noticing. A package carries no meaning about the system: moving a part definition from one package to another changes where the definition lives and how it is named from outside, not what it says. That is why the course can fix the package names for every team: the structure is a convention for navigation and review, and the meaning sits in the elements and their relationships.' },
        { kind: 'para', text: 'The training deck states the two roles of a package in one line: it is a namespace for its members and a container for its owned members. A qualified name is a package name followed by the name of one of its members, separated by two colons, so Stakeholders::\'STK-005\' names the vertiport operators of the AeroLink model from anywhere in the model. Definitions and usages are namespaces too: a part definition owns its attributes and parts the way a package owns its members, and a qualified name can walk from a package into a part usage and on to one of its features.' },
        { kind: 'heading', text: 'Names, short names and element IDs' },
        { kind: 'para', text: 'Every element in a SysML v2 model has an element ID that never changes after the element is created, but the textual notation does not write it: the modeling tool manages it. What the notation writes is a name and, optionally, a short name, declared in that order, the short name between angle brackets. The graphical-notation deck adds that the short name can be a user or tool selected identifier. The course uses that opening for the digital thread.' },
        { kind: 'para', text: 'Names follow a lexical rule. A basic name starts with a letter or an underscore and continues with letters, digits or underscores. Any other name is an unrestricted name, written between single quotes. Course IDs such as STK-005 contain a hyphen, so a name that contains a hyphen must be quoted: <\'STK-005\'>. The same holds for register names with spaces, such as \'Vertiport operators\'.' },
        { kind: 'figure', slide: 'w8s2-names' },
        { kind: 'callout', tone: 'key', title: 'Course convention: the ID rule', text: 'Every Phase I ID becomes a quoted short name, and the register’s wording becomes the name. References use the short name. The same ID in the Week 1 register and in the model is what lets anyone follow a thread from document to model, and what lets the audit check completeness mechanically.' },
        { kind: 'heading', text: 'Comments, documentation and notes' },
        { kind: 'para', text: 'Three kinds of text look alike in a listing. A comment, between slash-star and star-slash, is part of the model and annotates its owning namespace unless another element is named. A note, after two slashes, is in the text but not in the model. Documentation, the keyword doc followed by a comment, is a comment owned by the element it documents. By course convention, the Phase I statement, rationale and register fields that have no modeled attribute go into the element’s documentation, so nothing in the package is lost; notes are for the modeler only, because a view or an export of the model never sees them.' },
        { kind: 'figure', slide: 'w8s2-comments-doc' },
      ],
      sources: [R('R80', '47'), R('R80', '49–50'), R('R80', '56'), R('R70', '5'), R('R70', '7–9'), R('R90', '22')],
    },
    {
      id: 'w8s2-l-imports',
      title: 'Imports and visibility',
      blocks: [
        { kind: 'para', text: 'An import adds a single member, or all the members, of another namespace to the importing one, so its names can be used without qualification. The specification gives three forms: a qualified name alone imports one membership; the suffix ::* imports all the members of a namespace; a further ::** makes the import recursive, continuing into the namespaces it imports.' },
        { kind: 'figure', slide: 'w8s2-imports' },
        { kind: 'para', text: 'Visibility decides how far imported names travel. Members of a namespace are public by default, but the visibility of an import is always shown explicitly, with the keyword private, protected or public. Members from a public import are visible from the importing package, that is, re-exported; members of a private import are not re-exported. The deck’s advice follows: use private visibility unless re-export is required. Two packages that re-export the same library names create two paths to the same names, which makes a large model harder to read and to change.' },
        { kind: 'para', text: 'One rule is not advice but a requirement. Imports written at the top level of a file, outside any package, belong to the root namespace, and an import owned by a root namespace must be private, so that no imported name becomes globally visible. The AeroLink models keep all their imports inside the root package and make every one private.' },
        { kind: 'callout', tone: 'caution', title: 'Recorded checker result', text: 'A file whose imports have no visibility keyword fails with the message that the word import was not expected. The fix is one word: private.' },
      ],
      sources: [R('R70', '5–6'), R('R80', '60–61'), R('R80', '63')],
    },
    {
      id: 'w8s2-l-toolchain',
      title: 'The course toolchain, and what the checker decides',
      blocks: [
        { kind: 'para', text: 'Everything in this section is a course decision, not a property of SysML. Phase II models are written in the textual notation, in a text editor or in a SysML notebook of the same release. Each model version is one file, because the checker validates every file on its own: one file cannot borrow a name from another.' },
        { kind: 'figure', slide: 'w8s2-toolchain' },
        { kind: 'para', text: 'The course-designated checker is the OMG SysML v2 Pilot Implementation, release 2026-08, the implementation published with the 2.1 Beta 2 texts this course cites. It is a pilot implementation, not the formal SysML 2.0 publication, and the grammar it accepts may differ in detail from the final standard. Grades follow the instructor’s checker run on the submitted file.' },
        { kind: 'para', text: 'Two aids live in this app. The Week 8 lab tool imports your Team Record export (Week 1, and Week 2 if you have it), shows where every Phase I ID maps, lists its findings, and generates a first draft of model v0.1 that you can preview and export as a .sysml file. It is a teaching aid that drafts from the register; the team reviews, corrects and completes every line. The AeroLink engineering model page shows the instructor’s reference. Eclipse SysON, a graphical editor, is optional and never graded.' },
        { kind: 'heading', text: 'Two judgments about one file' },
        { kind: 'para', text: 'For each file the checker parses the text, resolves every name against the file and the standard library, and runs its validation rules. A message of severity ERROR fails the file; a WARNING is reported and does not. That is all it decides. It cannot tell whether a stakeholder is the right one, whether a concern says what the register says, whether a definition was used where a usage was needed, or whether the model serves its purpose. SEBoK’s principle applies: the purpose of a model must be defined first, and the quality of a model should not be confused with the quality of the design it represents.' },
        { kind: 'figure', slide: 'w8s2-checker-decides' },
        { kind: 'para', text: 'Session 1 showed the gap in practice: an attribute definition that owns a part passed with no message, although an attribute definition may not have composite features. For the lab this means two separate questions about the submitted model: does it pass with zero errors, and does it mean what the register says? The second is answered by the audit.' },
      ],
      sources: [R('R33b', '295–296'), R('R80', '77')],
    },
    {
      id: 'w8s2-l-import-method',
      title: 'The import method: a mapping of the whole package',
      blocks: [
        { kind: 'para', text: 'Import in this course has a precise meaning, a course convention: every artifact gets a home in the model or a recorded reason to wait. Each ID of your Week 7 Systems Thinking Engineering Package is assigned a package and a SysML v2 construct; the kinds this week models are modeled now, and every other kind is mapped to the Phase II week that will model it. The sources give the constructs but no method for migrating a document package into a model, so the method is the course’s.' },
        { kind: 'figure', slide: 'w8s2-import-mapping' },
        { kind: 'para', text: `Week 8 models the Week 1 register: ${NOW_PREFIXES}. The rest is mapped, so that Weeks 9 to 13 fill packages that already exist and know which IDs they must hold. Two working rules protect the thread. Nothing is retyped from memory: the exported package is the source, and the lab tool reads it directly. And when modeling exposes a disagreement, the team records it in the audit note instead of quietly changing the model and leaving the register behind.` },
        { kind: 'para', text: 'The documents do not disappear. SEBoK observes that where stakeholders expect documents, a hybrid approach generates documents from the model as static representations of the system at milestones. The tables and diagrams of your Week 14 review should come out of the model you start today.' },
        { kind: 'heading', text: 'The course mapping, with the AeroLink counts' },
        { kind: 'para', text: `The table lists all ${N_KINDS} ID kinds of the course scheme: the Phase I artifact and the week that produced it, the package, the construct, the week that models it, and how many such IDs the AeroLink package holds (the Week 1 kinds from the corrected case, the others from the instructor reference).` },
        { kind: 'table', header: ['ID', 'Artifact (Phase I week)', 'Package', 'SysML v2 construct', 'Modeled in', 'AeroLink'], rows: FULL_MATRIX_ROWS, caption: 'The artifact-to-model mapping (course convention) with the AeroLink counts (FICTIONAL).' },
        { kind: 'para', text: 'Some kinds have no obvious single home. A measure of effectiveness is an attribute owned by whatever it measures, so its package depends on the thing measured. A roadmap increment is mapped to the Evolution package, present in the skeleton, whose form the team decides with the instructor in Week 14. A team prefix the course scheme does not know appears in the lab tool as unmapped. In every such case the team chooses and records the reason; the reason is graded, not the choice.' },
        { kind: 'slide-ref', slide: 'w8s2-matrix', text: 'The condensed matrix on the slide groups the kinds by the week that models them.' },
      ],
      sources: [R('R28', '374')],
    },
    {
      id: 'w8s2-l-skeleton',
      title: 'The skeleton of model v0.1',
      blocks: [
        { kind: 'para', text: `Model v0.1 is one root package holding the ${MODEL_PACKAGES.length} course packages, the AeroLink reference layout plus Evolution: ${MODEL_PACKAGES.map((p) => `${p.name} (${p.holds})`).join('; ')}.` },
        { kind: 'figure', slide: 'w8s2-skeleton' },
        { kind: 'para', text: 'Context, Stakeholders and the system-of-interest part of Physical are filled this week. Every other package is present and carries documentation that names the week that fills it and the IDs it will hold. Documentation is owned by the element it documents, so a reviewer opening the Needs package reads what arrives there and when. An empty package with that documentation is evidence that the gap is planned; a missing package is a gap nobody can see.' },
        { kind: 'para', text: 'The root documentation states the model’s purpose: who uses the model and for which decisions. Session 1 explained why the purpose comes first: a model is judged by how well it serves its purpose, and without one the team cannot decide what belongs in it. Imports sit at the top of the root package, each with explicit private visibility.' },
      ],
      sources: [R('R70', '6'), R('R70', '8'), R('R33b', '295–296')],
    },
    {
      id: 'w8s2-l-stakeholders-concerns',
      title: 'Stakeholders and concerns as language elements',
      blocks: [
        { kind: 'definition', term: 'Stakeholder; concern', text: 'A stakeholder is a person, organization or other entity with concerns to be addressed. A concern is a specific topic that one or more stakeholders desire to be addressed.', source: R('R77', '115') },
        { kind: 'para', text: 'The definitions match the Week 1 vocabulary closely, which is what makes the import natural. In the language, a concern is declared exactly like a requirement, with the keyword concern instead of requirement; the intent is that the concerns of one or more stakeholders are modeled as the required constraints of a concern with stakeholder parameters.' },
        { kind: 'figure', slide: 'w8s2-stakeholder-concern' },
        { kind: 'para', text: 'Two rules govern the parameters. The subject is declared with the keyword subject, and the subject must be declared before any stakeholder or other parameter. And stakeholder parameters are part usages, so each must be defined by a part definition. The training deck adds that stakeholders may be specified for any kind of requirement, not only concerns, and that the subject may be omitted only when there are no stakeholders or other parameters.' },
        { kind: 'para', text: 'The second rule is the reason for the course mapping: because a stakeholder line in a concern needs a part definition to type it, every Phase I stakeholder becomes a part definition in the Stakeholders package. The mapping follows from the language, not from taste.' },
        { kind: 'heading', text: 'Why concerns are modeled now' },
        { kind: 'para', text: 'Concerns are anchors for later elements. One or more concerns can be framed in other requirement definitions and usages with the keyword frame, and a framed concern is a subrequirement, so it is automatically a required constraint of the requirement that frames it. In Week 9 your needs frame your concerns. A viewpoint is a requirement to present model information in a view that addresses certain stakeholder concerns; a viewpoint definition is a kind of requirement definition that frames the concerns of stakeholders, and its subject is a view. In Week 14 the stakeholder views you present are defined by viewpoints that frame the same concerns.' },
        { kind: 'figure', slide: 'w8s2-frame' },
        { kind: 'para', text: 'A concern lost or renamed in Week 8 therefore breaks two traces later, one in Week 9 and one at the final review.' },
      ],
      sources: [R('R77', '115–116'), R('R83', '166–167'), R('R85', '181')],
    },
    {
      id: 'w8s2-l-aerolink-import',
      title: 'Worked example: the AeroLink import',
      blocks: [
        { kind: 'para', text: 'The instructor’s worked example imports AeroLink’s corrected Week 1 register. The model was generated by the same function the lab tool uses and passed the course checker with no message; the listings in this section are excerpts of that file. AeroLink is a fictional teaching case and the instructor’s reference only: each team imports its own enterprise.' },
        { kind: 'heading', text: 'The context' },
        { kind: 'para', text: `The enterprise, ENT-001 AeroLink Urban Mobility, is a part definition in the Context package, with its domain, problem and mission in its documentation. SysML has no keyword for system, subsystem or enterprise: an entity with structure and behavior is a part. The operating context is one part usage, context. Inside it, the system of interest is a ref part, a referential usage that refers to the system owned in the Physical package, and the ${N_EXT} external systems are composite part usages, each with its Phase I ID as short name.` },
        { kind: 'figure', slide: 'w8s2-worked-context' },
        { kind: 'para', text: 'The system of interest is referential here because a context does not create or destroy the system: if a context instance ends, the system goes on. That is a statement about instances, not about editing the model; in the model, the Physical package owns the system-of-interest part either way. The external systems are named as systems, with the organization behind each recorded as a stakeholder, as the Week 1 review required.' },
        { kind: 'heading', text: 'Stakeholders, concerns, ratings and relationships' },
        { kind: 'para', text: `All ${N_STK} stakeholders are part definitions with their IDs and register names, including the class STK-015, Passengers with reduced mobility, added in the Week 1 review. All ${N_CON} concerns are concerns whose subject is the enterprise and whose stakeholder parameter is typed by the holder’s part definition.` },
        { kind: 'figure', slide: 'w8s2-worked-stakeholders' },
        { kind: 'para', text: 'The register ratings, interest, influence and support with their reasons, are recorded with a course convention: a metadata definition, StakeholderAssessment, applied to each stakeholder. Metadata is defined with a metadata definition and applied as an annotation, the @ symbol being equivalent to the keyword metadata, and every nested feature of the definition must be bound to a value in the annotation. A stakeholder whose rating is missing therefore gets no annotation; the lab tool reports it as a gap rather than inventing a value. The alternative, ratings written into the documentation text, is simpler but cannot be queried: a tool can list every stakeholder with influence of four or more from a metadata attribute, not from prose.' },
        { kind: 'para', text: `Relationships between stakeholders are dependencies. A dependency is a relationship between client and supplier elements, written with the keywords dependency, from and to: the from element is the client, the dependent, and a change to the supplier may result in a change to the client. A dependency can be extended by user-defined keywords, so the course defines one keyword per Week 1 relationship type and names it from the dependent: the register line “STK-002 regulates STK-011” becomes #regulatedBy dependency <'REL-001'> from 'STK-011' to 'STK-002'. For the symmetric types, conflicts, coordination and partnership, the register’s order is kept and the direction carries no meaning, as in #conflictsWith dependency <'REL-002'> from 'STK-004' to 'STK-005'. The hash prefix is a user-defined keyword: the short name of a metadata definition preceded by #, which the language allows on dependency declarations, so each keyword is declared once in the model as a metadata definition (for example metadata def <regulatedBy> RegulatedByLink). Which relationship types get a keyword, and their names, is the course convention. AeroLink has ${RELATIONSHIPS.length} relationships of ${N_REL_TYPES} types; ${CONFLICT.id}, the noise-versus-throughput conflict, is the one conflict.` },
        { kind: 'slide-ref', slide: 'w8s2-worked-stakeholders' },
      ],
      sources: [R('R80', '48–49'), R('R80', '50–51'), R('R80', '64'), R('R70', '9'), R('R77', '108–109'), R('R69', '193'), R('R83', '166–167')],
    },
    {
      id: 'w8s2-l-audit',
      title: 'Auditing the import',
      blocks: [
        { kind: 'para', text: 'A model that passes is not yet an import that is right: the checker cannot tell you whether the model says what the register says, and the audit can. The course audit asks four questions.' },
        { kind: 'table', header: ['Question', 'What it asks'], rows: AUDIT_QUESTIONS.map((q) => [q.label, q.question]), caption: 'The four audit questions (course convention).' },
        { kind: 'para', text: 'The first two are mechanical and the lab tool answers them from the record and the generated file. The last two need a person who has read both the register and the model.' },
        { kind: 'figure', slide: 'w8s2-worked-audit' },
        { kind: 'table', header: ['Question', 'AeroLink result', 'Disposition'], rows: AEROLINK_AUDIT.map((a) => [a.question, a.result, a.disposition]), caption: 'The AeroLink import audit (FICTIONAL).' },
        { kind: 'para', text: 'The AeroLink audit shows the habit the course asks for. The fidelity differences were logged before they were corrected, because the Week 1 case is the canonical source and a silent correction leaves no evidence. The gaps were not hidden: each carries a disposition. A silent gap is a defect; a reasoned gap is a decision. The lab tool helps with the first two questions: only a defect, an item that cannot be written as valid SysML from the record, keeps an item out of the generated file; every gap is imported and listed for a disposition.' },
      ],
      sources: [],
    },
    {
      id: 'w8s2-l-lab-preview',
      title: 'Lab L8 at a glance',
      blocks: [
        { kind: 'para', text: `In Lab L8 your team imports its own Systems Thinking package and delivers model v0.1 in three files: ${LAB8_OUTPUTS.map((o) => `${o.file} (${o.what})`).join('; ')}.` },
        { kind: 'figure', slide: 'w8s2-lab-brief' },
        { kind: 'para', text: `Every stakeholder, concern and external system of your record must be in the model; at least ${LAB8_MINIMUMS.relationships} relationships, at least ${LAB8_MINIMUMS.conflicts} of them a conflict; and a purpose statement saying who uses the model and for which decisions. The final checker run has zero errors and every warning is explained. Out of class the lab takes about ${LAB8_TEAM_HOURS} person-hours for a team of four, about ${HOURS_FOUR_EACH} hours each. A team of three works to a reduced scope with the same load per person, pending faculty approval.` },
        { kind: 'para', text: 'By Session 2 the team has one working checker installation, set up from the install guide on the Laboratory page, and every member has run the two tool-proof files; at the checkpoint each member shows both outputs, which open the checker log. Then the team starts in the lab tool.' },
        { kind: 'slide-ref', slide: 'w8s2-lab-matrix' },
        { kind: 'para', text: 'What the model feeds: Week 9 models your needs and requirements in the Needs and Requirements packages and frames the concerns you model now; Week 10 adds behavior; Week 11 the physical architecture and interfaces, including the exchanges with the external systems in your context; Week 12 verification; Week 13 analysis; Week 14 presents the whole model. Each week fills a package this lab creates.' },
      ],
      sources: [],
    },
  ],
}

/** Instructor-facing counts used by tests and the milestone report. */
export const WEEK8_S2_FACTS = { kinds: N_KINDS, nowKinds: NOW.length, stakeholders: N_STK, concerns: N_CON, externals: N_EXT, relationships: RELATIONSHIPS.length, words: numberWord(N_STK) }
