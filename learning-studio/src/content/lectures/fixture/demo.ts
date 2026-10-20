// FIXTURE — NOT COURSE CONTENT. A five-slide demonstration lecture that proves the single-source pipeline end to end
// (viewer, reader, .pptx, notes and handout Markdown) before the real Week 1 lecture is written. Every definition is
// copied from the reviewed Week 1 Learn content (src/content/learn/week01.ts) with the same verified citation; every
// AeroLink number is FICTIONAL and comes from the instructor reference (src/model/airtaxi.ts, DECISION_LOG W8).
// Replace this file with src/content/lectures/week01/session1.ts when the Week 1 lecture arrives.
import type { Lecture } from '../types'

export const DEMO_LECTURE: Lecture = {
  week: 1,
  session: 1,
  fixture: true,
  title: 'Pipeline demonstration lecture',
  subtitle: 'Fixture: proves that slides, notes, reader and PowerPoint come from one source',
  sections: [
    {
      id: 'fx-opening',
      title: 'Opening',
      slides: [
        {
          id: 'fx-title',
          title: 'Pipeline demonstration lecture',
          subtitle: 'FIXTURE — not course content',
          purpose: 'Shows the title layout and the master (title bar, footer, slide number) in every output.',
          minutes: 2,
          layout: 'title',
          body: [{ kind: 'callout', tone: 'note', text: 'Every slide, note, figure and citation here comes from one TypeScript source.' }],
          sources: [],
          notes: {
            teach: ['Say that this deck is a fixture: it exists to test the lecture pipeline, not to teach Week 1.', 'Point out the footer: course name, week, slide number and the sources line.'],
            why: 'Faculty reviewing the pipeline should see the master and the notes format before any real content is written.',
            transition: 'The first content slide shows a cited definition.',
            timing: '2 min: introduce the fixture.',
          },
        },
      ],
    },
    {
      id: 'fx-concepts',
      title: 'Cited concepts',
      slides: [
        {
          id: 'fx-system-definition',
          title: 'What counts as a system',
          purpose: 'Shows the definition layout: a cited term, its source line and a short callout.',
          minutes: 8,
          layout: 'definition',
          body: [
            { kind: 'definition', term: 'System', text: '“Combination of interacting elements organized to achieve one or more stated purposes.”', source: { reading: 'R38', pages: '1637' } },
            { kind: 'callout', tone: 'key', text: 'SEBoK attributes the wording to ISO/IEC/IEEE 15288:2015, in an expanded form.' },
          ],
          sources: [{ reading: 'R38', pages: '1637' }],
          notes: {
            teach: ['Read the definition aloud, then underline the three parts: interacting elements, organized, stated purposes.', 'Ask: which of the three would a pile of parts in a warehouse fail?'],
            why: 'Every later week assumes students can say why something is, or is not, a system for a purpose.',
            examples: ['The AeroLink air-taxi service (fleet, vertiports, operations center) organized to move passengers.'],
            misconceptions: [{ claim: 'A system is any large or complicated thing.', correction: 'Size is irrelevant; the definition turns on interaction and a stated purpose.' }],
            transition: 'If a system has a purpose, someone draws its boundary. The next slide shows one.',
            timing: '3 min definition, 3 min question, 2 min discussion.',
          },
        },
        {
          id: 'fx-context-figure',
          title: 'A boundary and its context',
          purpose: 'Shows the figure-plus-bullets layout and a figure shared with the reader.',
          minutes: 10,
          layout: 'figure-bullets',
          figure: {
            id: 'open-system',
            caption: 'The AeroLink air-taxi service, the system of interest, and six external systems (EXT-001 to EXT-006), each with what crosses the boundary.',
            alt: 'A rounded boundary labeled AeroLink air-taxi service contains passenger demand, the operations center, the fleet, and vertiports and chargers, joined by arrows. Six external systems sit outside it, each joined to the boundary by a labeled exchange; the weather arrow points one way, into the boundary.',
          },
          body: [
            {
              kind: 'bullets',
              items: [
                'Inside: demand, operations center, fleet, chargers',
                'Outside: six external systems',
                { text: 'Each link is an exchange', sub: ['power from the grid', 'airspace access from the ANSP'] },
              ],
            },
          ],
          sources: [{ reading: 'R02', pages: '264' }],
          notes: {
            teach: ['Trace the boundary with a pointer before naming anything inside it.', 'Name each external system and what crosses the boundary in which direction.'],
            why: 'The context drawing is the first artifact students produce for their own enterprise.',
            figure: 'Start inside the boundary (demand → operations center → fleet → chargers), then go clockwise round the six external systems. Stop at weather: its arrow is one way, inward, because AeroLink cannot influence the weather.',
            misconceptions: [{ claim: 'Everything outside the boundary is a stakeholder.', correction: 'Weather is an external system but has no stake; stakeholders are people and organizations.' }],
            transition: 'Some of those external systems are run by stakeholders. The next slide records two of them.',
            timing: '4 min figure walk, 4 min pair discussion, 2 min report back.',
          },
        },
      ],
    },
    {
      id: 'fx-apply',
      title: 'Applying it',
      slides: [
        {
          id: 'fx-register-table',
          title: 'Two rows of a stakeholder register',
          purpose: 'Shows the table layout; the .pptx must carry it as a native table.',
          minutes: 8,
          layout: 'table',
          body: [
            {
              kind: 'table',
              header: ['ID', 'Stakeholder', 'Concern', 'Influence'],
              rows: [
                ['STK-004', 'Communities', 'Noise, privacy and access near vertiports', '4'],
                ['STK-010', 'Electric utility', 'Peak load and grid connection cost', '4'],
              ],
              caption: 'FICTIONAL instructor reference (AeroLink).',
            },
          ],
          sources: [{ reading: 'R39a', pages: '1631' }],
          notes: {
            teach: ['Read one row left to right: who, what they care about, how much they can affect the outcome.', 'Ask for the rationale behind each influence score before revealing it.'],
            why: 'The register is the Week 1 Team Record artifact; students need to see a filled row before writing their own.',
            examples: ['STK-004 rationale: local opposition can block vertiport siting through planning processes.', 'STK-010 rationale: grid capacity can cap charging throughput.'],
            transition: 'The utility’s concern is about charging. The next slide works out how many charges one charger can give in a day.',
            timing: '5 min table, 3 min rationale question.',
          },
        },
        {
          id: 'fx-charger-throughput',
          title: 'Worked example: charges per charger per day',
          purpose: 'Shows the worked-example layout with an equation, numbered steps and a full solution in the notes.',
          minutes: 10,
          layout: 'worked-example',
          body: [
            { kind: 'equation', display: 'N = T ÷ b = 960 ÷ 20 = 48', speech: 'N equals T divided by b, which is 960 divided by 20, which equals 48', where: [{ symbol: 'T', meaning: 'operating minutes per day' }, { symbol: 'b', meaning: 'busy minutes per charge' }] },
            {
              kind: 'steps',
              items: [
                { label: 'Given', text: '16 h day; charger busy 20 min per turnaround' },
                { label: 'Convert', text: 'T = 16 × 60 = 960 min' },
                { label: 'Divide', text: 'N = 48 charges per day' },
              ],
            },
          ],
          sources: [],
          notes: {
            teach: ['Let students attempt the number for one minute before showing the steps.', 'Stress the units: minutes divided by minutes per charge gives charges.'],
            why: 'A first quantitative habit: state the given, convert units, then compute.',
            workedSolution: [
              'Given (course convention W8, FICTIONAL): a 16-hour operating day and a charger busy 20 minutes per turnaround.',
              'Convert hours to minutes: T = 16 × 60 = 960 minutes.',
              'Divide by the busy time per charge: N = 960 ÷ 20 = 48 charges per charger per day.',
              'Check: 48 × 20 = 960 minutes, exactly the operating day, so the charger is never idle in this idealized case.',
            ],
            misconceptions: [{ claim: 'The 25-minute turnaround sets the charger’s rate.', correction: 'Pad work (5 min) does not occupy the charger; only the 20-minute charge does (W8).' }],
            transition: 'End of the fixture. In the real lecture, the summary slide would follow.',
            timing: '1 min attempt, 6 min solution, 3 min check and questions.',
          },
        },
      ],
    },
  ],
  studentLesson: [
    {
      id: 'fx-lesson-system',
      title: 'What counts as a system',
      blocks: [
        { kind: 'para', text: '*Fixture text.* The lesson repeats the slide’s definition, so the reader and the slides share one cited source.' },
        { kind: 'definition', term: 'System', text: '“Combination of interacting elements organized to achieve one or more stated purposes.”', source: { reading: 'R38', pages: '1637' } },
        { kind: 'para', text: 'Three parts carry the definition: **interacting elements**, **organization**, and **a stated purpose**. Size plays no part in it.' },
        { kind: 'slide-ref', slide: 'fx-system-definition', text: 'The lecture slide for this section' },
      ],
      sources: [{ reading: 'R38', pages: '1637' }],
    },
    {
      id: 'fx-lesson-context',
      title: 'A boundary and its context',
      blocks: [
        { kind: 'para', text: 'The figure below is the same component that draws the slide and the PowerPoint image.' },
        { kind: 'figure', slide: 'fx-context-figure' },
        { kind: 'heading', text: 'Reading the drawing' },
        { kind: 'bullets', items: ['Start inside the boundary.', { text: 'Then walk the external systems:', sub: ['what crosses the boundary', 'in which direction'] }] },
      ],
      sources: [{ reading: 'R02', pages: '264' }],
    },
    {
      id: 'fx-lesson-throughput',
      title: 'Worked example: charger throughput',
      blocks: [
        { kind: 'equation', display: 'N = T ÷ b = 960 ÷ 20 = 48', speech: 'N equals T divided by b, which is 960 divided by 20, which equals 48', where: [{ symbol: 'T', meaning: 'operating minutes per day' }, { symbol: 'b', meaning: 'busy minutes per charge' }] },
        { kind: 'callout', tone: 'caution', title: 'FICTIONAL numbers', text: 'The 16-hour day and the 20-minute charge are AeroLink teaching conventions (DECISION_LOG W8).' },
        { kind: 'slide-ref', slide: 'fx-charger-throughput' },
      ],
      sources: [],
    },
  ],
}
