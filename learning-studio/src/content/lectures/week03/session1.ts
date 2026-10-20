// Week 3, Session 1 lecture: Technology Assessment / Risk Management / Trade Study — technology readiness, the risk and
// uncertainty register (with security and resilience risks), and technical performance measures. 75-minute session: 69
// minutes of planned content on 24 slides plus the generated "References and credits" slide, and a 6-minute buffer
// (bufferMinutes). Single source for the slide viewer, the faculty notes, the .pptx and the student lesson
// (docs/lectures/PIPELINE.md). Governing direction: DECISION_LOG A20 (teach first, explain in depth, demonstrate, then
// assign) and A21 (the Week 1 architecture is the template; TPMs are taught in Week 3; security and resilience are
// integrated into Weeks 3, 5 and 6).
//
// Review status: new-pending-review. Written 2026-10-19 from docs/lectures/week03/WEEK03_LECTURE_OUTLINE.md §2, with the
// security and resilience slide and the ordinal-scale slide added (A21 item 6; faculty request for the limits of risk
// matrices).
//
// Accuracy rules followed:
//   - Every citation is a verified register entry (readings.generated.json) at a page whose extracted text
//     (_source_cache/*.txt) supports the claim beside it. Two figures the claims rest on are images and were read on the
//     PDF pages (DoD Figure 4-9, likelihood bands and cell layout, R46 p.126; SEBoK's additive value equation, R18 p.469).
//     R39q–R39s (SEBoK glossary: risk, opportunity, uncertainty) and R61a–c (the three MITRE risk articles) were added to
//     the register for this lecture, pending faculty confirmation.
//   - Course conventions are labeled as such (the consequence anchors, the ranking rule, the register form, the
//     evidence-or-assumption rule, the contingency values). Source gaps are named where they bite (no source in the
//     collection argues the ordinal-arithmetic point directly; the full NASA and DoD TRL definitions are not held).
//   - AeroLink Urban Mobility is FICTIONAL. Week 1 and Week 2 data are imported read-only; Week 3 data come from
//     ./aerolinkCase.ts. Numbers on the slides are computed there, not typed here.
//   - Timing: spoken notes (teach, worked solution, figure walk) stay at or below 130 words per minute (./timing.test.ts).
//   - Faculty notes and purposes are stripped from the student build (student-edition.ts).
import type { Lecture } from '../types'
import { requirement } from '../week02/aerolinkCase'
import {
  CHAIN, FADE15, ISSUES, MONTH6, OPPORTUNITIES, ORDINAL_DEMO, R004_EXPECTED, RISKS, TPMS, UNKNOWNS,
  lowestCritical, marginOf, plannedProfile, referenceMarginOf, risk, riskLevel, riskStatement, technology, tpm, wceOf,
} from './aerolinkCase'
import { LIKELIHOOD, TRL_SCALE } from './labBrief'

export const WEEK3_S1_REVIEW = 'new-pending-review' as const

const R = (reading: string, pages: string) => ({ reading, pages })
const t1 = technology('TECH-001')
const t2 = technology('TECH-002')
const t3 = technology('TECH-003')
const low = lowestCritical()
const [p1, p2, p3] = TPMS
const r10 = risk('R-010')
const r04 = risk('R-004')
const r11 = risk('R-011')
const r09 = risk('R-009')
const nRisks = RISKS.length
const nReferenceRisks = RISKS.filter((r) => r.provenance === 'reference').length
const prof3 = plannedProfile(tpm('TPM-003'))
const L3 = LIKELIHOOD.find((l) => l.level === 3)!
const L2 = LIKELIHOOD.find((l) => l.level === 2)!
const f1 = (x: number) => x.toFixed(1)
const f2 = (x: number) => x.toFixed(2)

export const WEEK3_SESSION1: Lecture = {
  week: 3,
  session: 1,
  title: 'Technology Assessment / Risk Management / Trade Study',
  subtitle: 'Session 1: Readiness, risk and the measures that track it',
  bufferMinutes: 6,
  sections: [
    // ============================================================================================ A. framing (8 min)
    {
      id: 'w3s1-framing',
      title: 'Framing: one subject, uncertainty',
      slides: [
        {
          id: 'w3s1-title',
          title: 'Technology Assessment / Risk Management / Trade Study',
          subtitle: 'Session 1: Readiness, risk and the measures that track it',
          purpose: 'Orient students to the scheduled subject, the two sessions and the four parts the week adds to the Team Record.',
          minutes: 1,
          layout: 'title',
          body: [
            {
              kind: 'bullets',
              items: [
                'Today: technology readiness, the risk register, technical performance measures',
                'Session 2: the trade study, worked in full, and the Lab L3 launch',
                'Your Team Record grows: readiness assessment, risk register, TPMs, trade study',
              ],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the subject exactly as the schedule gives it: Technology Assessment, Risk Management, Trade Study. Make the promise: by the end of today you can assess how mature a technology is and say what that number does not tell you, write and rate a risk so that someone else can act on it, include the security and resilience risks that teams usually forget, and set up a technical performance measure with an honest margin.',
              'Say where the work lands: each team extends its Week 2 Team Record for its own approved enterprise. AeroLink remains the worked example; no team models AeroLink.',
            ],
            why: 'Students who see the shape of the week can file each idea as it arrives, and naming the four record parts tells them which ideas they must use within seven days.',
            examples: [
              'Instructor preparation (not for students): decide before class the open items flagged in the notes of slides 12, 15 and 21 (the consequence anchors, the three proposed security and resilience risks, the TPM contingency values). Bring the Week 2 Team Records: teams will need their requirements and measures in Session 2.',
              'Timing plan: 69 minutes of content and a 6-minute buffer. If the session runs long, shorten slide 7 or slide 17; never shorten the worked risk (slide 16) or the worked TPM (slide 21).',
            ],
            misconceptions: [{ claim: 'This week is three separate topics that happen to share a week.', correction: 'All three manage one thing, uncertainty, and each feeds the others: an immature technology is a risk, a risk is watched through a TPM, and the trade study decides with both in view.' }],
            transition: 'First, a decision the AeroLink board wants to make. We answer it at the end of Session 2.',
            timing: '1 min: 30 s subject and promise, 30 s the record parts.',
          },
        },
        {
          id: 'w3s1-driving-question',
          title: 'The driving question: should AeroLink buy six more aircraft?',
          purpose: 'Create a need to know before any explanation, and surface the belief that more vehicles means more capacity.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-driving-question',
            caption: 'Waits are forecast to grow as Year-2 demand reaches 240 trips/day. The board proposes six more aircraft. (FICTIONAL)',
            alt: 'Eighteen small aircraft silhouettes, twelve in solid outline and six in dashed outline labeled plus 6 proposed, lined up toward two charger symbols at a hub. A queue of aircraft waits at the chargers, with a large question mark above the queue. A caption bar reads Year-2 demand 240 trips per day.',
          },
          body: [
            { kind: 'callout', tone: 'note', title: 'Scenario (FICTIONAL)', text: 'Demand will reach 240 trips/day. The board proposes 6 more aircraft: 18 in all.' },
            { kind: 'bullets', items: ['**A** · Yes: more aircraft, shorter waits', '**B** · Only with more charging', '**C** · Build a seventh vertiport instead', '**D** · Cannot tell yet'] },
          ],
          sources: [],
          notes: {
            teach: [
              'Read the scenario. Give thirty seconds of silent thought, then take a show of hands for A to D and write the distribution on the board without comment.',
              'Ask one student who chose A and one who chose B for a reason each. Expect A to be defended with intuition: more vehicles carry more passengers. Expect B from anyone who remembers the Week 1 dynamics model, where the chargers became the limit.',
              'Do not resolve it. Say: we answer this at the end of Session 2, after we have assessed the technologies the answer depends on, written the risks that could break it, and run a trade study. Point out that the question already carries uncertainty: the demand is a forecast, the chargers are a technology that is not yet fully proven, and the board is weighing money against waiting time.',
            ],
            why: 'A prediction made before instruction creates a need to know, and answer A exposes a common misconception: that adding units of one resource raises the capacity of a system whose limit may be another resource. The withheld answer gives both sessions one arc.',
            figure: 'Point at the six dashed aircraft: that is the proposal. Then at the two chargers and the queue in front of them: that is where the trouble may sit. The question mark is over the queue, not over the aircraft.',
            examples: [
              'Typical reasoning for C: “spread the traffic over more sites.” Note it on the board; Session 2 shows that a seventh vertiport alone leaves the network short of aircraft.',
              'An analogue: a hospital buys more ambulances to cut response times and discovers that the bottleneck was the number of emergency-room bays able to receive patients.',
            ],
            misconceptions: [{ claim: 'Capacity is set by the number of vehicles.', correction: 'Capacity is set by the scarcest resource in the cycle. Adding vehicles helps only while vehicles are the scarce resource.' }],
            transition: 'To answer it well we need three instruments. First, what they have in common.',
            timing: '3 min: 30 s read, 30 s think, 1 min vote, 1 min two reasons.',
          },
        },
        {
          id: 'w3s1-three-processes',
          title: 'Three processes, one subject: uncertainty',
          purpose: 'Locate the week among the technical management processes and define risk and uncertainty from the source.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-three-processes',
            caption: 'Technical assessment, risk management and decision management overlap; what they share is uncertainty. One AeroLink artifact in each.',
            alt: 'Three overlapping circles labeled Technical assessment, Risk management and Decision management. The shared center reads uncertainty. Inside each circle one example: high-power charging at TRL 6 in technical assessment; charging capacity lags fleet growth in risk management; the Year-2 capacity decision in decision management. Arrows between circles read measures feed risk analysis and decisions select and treat risks.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Risk: the effect of uncertainty on objectives, or probability and severity of harm', 'Uncertainty: not having accurate or sufficient knowledge', 'Measurement gives indicators for risk analysis', 'Decision management evaluates alternatives that treat risks'],
            },
          ],
          sources: [R('R17', '481'), R('R17', '485'), R('R39s', '1668')],
          notes: {
            teach: [
              'Start with the word itself. SEBoK records two internationally accepted risk concepts: the effect of uncertainty on objectives, where effects may be negative or positive, and the combination of the probability of harm and the severity of that harm. The first ties risk to objectives; the second to harm, and it is the one safety engineering uses (R17 p.481). This week uses the first for program risks and the second when we meet safety and security consequences.',
              'Then uncertainty, from the SEBoK glossary: the result of not having accurate or sufficient knowledge of a situation (R39s p.1668). Every instrument this week is a way of being explicit about missing knowledge.',
              'Finally the links. SEBoK names them under integrated risk management: the measurement process provides indicators for risk analysis, and decision management evaluates alternatives for selecting and treating identified risks (R17 p.485). That is the plan of the week: readiness and TPMs are measurement, the register is risk management, the trade study is decision management.',
            ],
            why: 'Naming the shared subject keeps students from treating the week as three disconnected forms to fill in, and the two definitions of risk prepare the later distinction between program risk and safety or security harm.',
            figure: 'Walk the three circles, then point at the center word. Read the one artifact in each circle; each returns later today or in Session 2. The two arrows are the SEBoK linkages on the slide.',
            misconceptions: [{ claim: 'Risk always means something bad.', correction: 'Under the first definition effects may be positive; systems engineering calls those opportunities (R17 p.482). The register keeps both.' }],
            transition: 'Before measuring anything, we need to sort what kind of uncertainty we are looking at.',
            timing: '2 min: 1 min definitions, 1 min linkages and figure.',
          },
        },
        {
          id: 'w3s1-five-kinds',
          title: 'Five kinds of entry: assumption, risk, opportunity, unknown, issue',
          purpose: 'Separate concepts students conflate, using the probability bounds the sources give.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-five-kinds',
            caption: 'Risks and opportunities sit strictly between probability 0 and 1; an issue sits at exactly 1. Assumptions and unknowns are about knowledge.',
            alt: 'A horizontal probability axis from 0 to 1. Between the ends, two bands: risk (negative consequence) and opportunity (positive consequence). At exactly 1 a marker labeled issue: has occurred or is certain. Above the axis, on a separate band labeled knowledge, two boxes: assumption, taken as true and to be validated; unknown, information not yet available, written as TBD or TBR in a requirement.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['**Risk**: 0 < probability < 1, consequence > 0, in the future', '**Issue**: has occurred or is certain (probability 1)', '**Opportunity**: an outcome better than expected', '**Assumption**: taken as true; must be validated', '**Unknown**: information not yet available (TBD/TBR)'],
            },
          ],
          sources: [R('R39q', '1610'), R('R39r', '1582'), R('R46', '127'), R('R13', '565')],
          notes: {
            teach: [
              'Give the bounds, because they settle most arguments. The SEBoK glossary: a risk has a probability of occurrence greater than zero but less than one, a consequence greater than zero, and a time frame in the future (R39q p.1610). An issue is the same with probability one: the DoD guidebook defines issues as unwanted events that have occurred or are certain to occur, and says issue management applies resources to the consequence, not the likelihood (R46 p.127).',
              'An opportunity, in the risk-management sense of the glossary, is an outcome better than expected (R39r p.1582). The same glossary entry notes that opportunity cannot be bounded as neatly as risk, so treat the register entry as a prompt to look for upside, not a formula.',
              'Assumption and unknown are course definitions; the collection does not define them in the pages we use. An assumption is taken as true for planning and needs a named validation action. An unknown is information not yet available; in a requirement it appears as the TBD or TBR you wrote in Week 2, which SEBoK says must be tracked (R13 p.565). Course convention: one register for assumptions, risks, opportunities and unknowns; issues in a separate log.',
            ],
            why: 'Students routinely write issues as risks and assumptions as facts. A rule based on probability gives them a test they can apply to any entry: is it uncertain, is it certain, or is it about what we know?',
            figure: 'Trace the axis from 0 to 1: risk and opportunity in the open interval, the issue marker at 1. Then the knowledge band above: assumptions and unknowns are not events at all, they are statements about information.',
            examples: [
              `AeroLink: “weather limits not yet published” is an unknown (U-001). “The Week 2 audit found ${ISSUES[0].id === 'I-001' ? 'a need without a requirement' : 'a gap'}” is an issue, because the gap already exists. “Demand will be 240 trips/day” is an assumption (A-006).`,
            ],
            misconceptions: [{ claim: 'A problem we already have is a high-likelihood risk.', correction: 'If it has happened or is certain, it is an issue: probability one. Treat its consequence; write any future effect as a separate risk.' }],
            transition: 'Much of AeroLink’s uncertainty sits in three technologies. How mature are they?',
            timing: '2 min: 1 min bounds, 30 s assumption and unknown, 30 s example.',
          },
        },
      ],
    },
    // ============================================================================================ B. readiness (15 min)
    {
      id: 'w3s1-readiness',
      title: 'Technology readiness',
      slides: [
        {
          id: 'w3s1-tra-purpose',
          title: 'What a readiness assessment is for',
          purpose: 'Purpose before scale: readiness assessment supports investment decisions about critical technologies.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-tra-staircase',
            caption: 'The nine technology readiness levels as a staircase, grouped by the environment in which the technology has been shown to work.',
            alt: 'A staircase of nine numbered steps rising left to right. Steps 1 and 2 are labeled concept; steps 3 and 4 laboratory; steps 5 and 6 relevant environment; steps 7 to 9 operational. The words laboratory, relevant and operational are highlighted. Step 9 carries the label proven in mission operations.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Qualifies technology development and supports investment decisions', 'A TRL summarizes a technology’s degree of maturity', 'Nine levels: basic principles (1) to proven in mission operations (9)', 'Assess maturity and risk of the critical technologies'],
            },
          ],
          sources: [R('R16', '766'), R('R44', '112')],
          notes: {
            teach: [
              'Begin with purpose, because the scale is easy and the purpose is not. SEBoK: technology readiness assessments are established tools used to qualify technology development and help make investment decisions in complex programs, so that technology reaches the end user in a timely way (R16 p.766). The word to underline is decisions: a readiness level is an input to a decision about committing money or schedule to a technology.',
              'SEBoK continues: technology readiness levels are a metric that summarizes the degree of maturity of a technology; the original NASA scale has nine levels, from basic principles observed and reported, level 1, to systems flight proven through successful mission operations, level 9 (R16 p.766).',
              'The DoD guidebook adds who and what: a technology readiness assessment is a systematic, metrics-based process that assesses the maturity of, and the risk associated with, critical technologies, conducted with the help of an independent team of subject-matter experts (R44 p.112). Two words matter for your teams: critical, because you assess the technologies your requirements depend on, not every gadget; and risk, because maturity is only interesting as a source of risk.',
            ],
            why: 'Students who learn the scale before the purpose produce lists of TRL numbers that change no decision. Leading with purpose makes them ask which technologies are critical and what the number will be used for.',
            figure: 'Walk up the staircase and read the four environment groups. The highlighted words, laboratory, relevant and operational, are where most arguments about a TRL happen; the next slide reads the definitions exactly.',
            misconceptions: [{ claim: 'A readiness assessment rates every technology in the system.', correction: 'It rates the critical technologies: those the requirements depend on. A mature, commodity component does not need a TRL argument.' }],
            transition: 'Now the scale itself, read exactly, and what it does not tell you.',
            timing: '3 min: 1 min purpose, 1 min scale, 1 min critical technologies.',
          },
        },
        {
          id: 'w3s1-trl-scale',
          title: 'The scale, read exactly, and what it does not tell you',
          purpose: 'Read the middle of the scale word for word and state the documented limits of TRLs.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-trl-limits',
            caption: 'TRL measures demonstrated maturity in an environment. Producibility, integration and changed environments need other questions.',
            alt: 'The TRL staircase with levels 4 to 7 enlarged and labeled with their SEBoK wording. Three side rails: on the right, can it be produced affordably, labeled manufacturing readiness level; above, does it integrate with the rest of the system, labeled integration readiness and system readiness; below, a warning sign reading off-the-shelf item used beyond its design limits, the TRL changes.',
          },
          body: [
            {
              kind: 'table',
              header: ['TRL', 'SEBoK wording'],
              rows: TRL_SCALE.filter((t) => t.level >= 4 && t.level <= 7).map((t) => [String(t.level), t.text.replace(/\.$/, '')]),
            },
            { kind: 'bullets', items: ['**Not measured**: producibility, integration, criticality, changed environments'] },
          ],
          sources: [R('R16', '767'), R('R16', '768')],
          notes: {
            teach: [
              'Read levels 4 to 7 from SEBoK’s table, which reproduces Mankins 1995: TRL 4, component validation in laboratory environment; TRL 5, component validation in relevant environment; TRL 6, prototype demonstration in a relevant environment; TRL 7, prototype demonstration in an operational environment (R16 p.767). Two things change as you climb: what was shown, a component or a prototype, and where, the laboratory, a relevant environment or the operational one.',
              'Now the limits, also from SEBoK. TRLs do not assess the programmatic influence on a TRL, technology criticality and priority, or software aging; and they do not tell you whether the technology can be produced affordably, which is why manufacturing readiness levels were added (R16 p.767). Integration readiness levels address interface maturity, and system readiness levels combine the TRLs with their integration points (R16 p.768).',
              'One more limit that bites student teams: SEBoK warns that the TRL of an off-the-shelf product changes dramatically if it is used beyond its design limits, for example at very high or very low temperatures or under shock and vibration (R16 p.768). A phone-grade sensor at TRL 9 in a phone is not TRL 9 on a drone in winter.',
            ],
            why: 'Precise wording prevents the most common grading dispute, “we built it, so it is TRL 6”, and the documented limits stop students from treating one number as a verdict on a technology.',
            figure: 'Point at the four enlarged steps and read them. Then the three rails: producibility on the right, integration above, the off-the-shelf warning below. Each rail is a question the TRL leaves open.',
            examples: ['Source gap: the full NASA and DoD definitions, and the DoD readiness assessment guidance, are not in the course collection; SEBoK’s one-line table is the course definition.'],
            misconceptions: [{ claim: 'A higher TRL means a technology is safer to buy.', correction: 'It means more has been demonstrated, in a more realistic environment. Producibility, integration and cost are separate questions the TRL does not answer.' }],
            transition: 'Readiness claims also travel through hype and through words that mean different things to different people.',
            timing: '3 min: 1 min the four levels, 1.5 min the limits, 30 s the off-the-shelf warning.',
          },
        },
        {
          id: 'w3s1-maturity-practice',
          title: 'Maturity in practice: hype, the s-curve and shared meanings',
          purpose: 'Graduate-level judgment about readiness claims: hype, the s-curve and the meaning of “relevant environment”.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-maturity-curve',
            caption: 'Technology matures along an s-curve; TRL is the accepted way to measure its rising slope. Hype often runs ahead of maturity.',
            alt: 'A performance-versus-time s-curve divided into four regions labeled new, improving, mature and aging. A dashed hype curve rises steeply above the early part of the s-curve, peaks and falls back. An annotation on the rising slope reads TRL measures this slope. A side note reads relevant environment must be agreed by users, program office and developer.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Hype can draw funding to unsuitable technology: assess before committing', 'TRL measures the rising slope of the s-curve', 'Agree what “relevant environment” means for your system', 'TRL does not say how well a technology fits your architecture'],
            },
          ],
          sources: [R('R60', '524'), R('R60', '525')],
          notes: {
            teach: [
              'MITRE describes the hype cycle and warns that hype can result in significant program funding going to technologies that may not suit the intended system; when stakeholders give a new technology a lot of attention, evaluate its maturity objectively before committing significant funds (R60 pp.524–525).',
              'MITRE then places TRL on the s-curve of technology maturity, new, improving, mature and aging, and calls TRL the most universally accepted way to assess the upward slope. It adds two cautions you will use in the lab: stakeholders must share a detailed understanding of terms such as relevant environment, interpreted for the system under development; and the scale does not address how well the technology fits the architecture that absorbs it (R60 p.525).',
            ],
            why: 'Teams will cite vendor claims. Knowing that hype is a documented failure mode, and that “relevant environment” must be defined for their own system, lets them read a claim critically instead of copying a number.',
            figure: 'Trace the s-curve and name the four regions, then the dashed hype curve above the early part. The annotation shows what TRL measures; the side note is the agreement on terms MITRE asks for.',
            misconceptions: [{ claim: 'If the press and investors are excited about a technology, it must be mature.', correction: 'Attention peaks early, before maturity; MITRE’s advice is to assess maturity objectively before committing funds.' }],
            transition: 'So how does a team make an honest readiness claim with no supplier data?',
            timing: '2 min: 1 min hype, 1 min s-curve and the two cautions.',
          },
        },
        {
          id: 'w3s1-evidence-rule',
          title: 'Evidence, or a labeled assumption',
          purpose: 'State the course rule that keeps readiness claims honest when teams have no supplier evidence.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-evidence-cards',
            caption: 'Two acceptable TRL claims and one that is not: cite the evidence, or record the claim as an assumption with an owner and a validation action.',
            alt: 'Three cards for the same technology claiming TRL 6. The first carries a report icon and the citation of a test report. The second carries an assumption tag with an owner and a validation action, to be confirmed by the supplier test report. The third has neither and is struck through in red.',
          },
          body: [
            { kind: 'callout', tone: 'key', title: 'Course rule', text: 'Every TRL cites evidence, or is recorded as an assumption with an owner and a validation action.' },
            { kind: 'bullets', items: ['Most student TRLs will be assumptions: acceptable when labeled', 'Interpret the environment words for your system'] },
          ],
          sources: [R('R60', '525')],
          notes: {
            teach: [
              'State the course rule plainly: every TRL either cites evidence, such as a test report or a demonstration record, or is recorded as an assumption with an owner and a validation action. This is a course convention; it is how the maturity criterion of the lab rubric is applied.',
              'Be honest with students about their situation. Few teams will have supplier test data. That is acceptable: an assumption that is labeled, owned and scheduled for validation is honest engineering. A number with no basis is not, and it is graded as missing.',
              'Remind them of the MITRE caution from the last slide: the environment words must be interpreted for the system at hand (R60 p.525). The assumption should say what “relevant environment” meant when the team chose the level.',
            ],
            why: 'Without the rule, readiness levels become guesses presented as facts, and the risk that flows from immaturity disappears. With it, every immature technology carries a named owner and a date by which the guess must be tested.',
            figure: 'Compare the cards left to right: evidence cited, assumption labeled and owned, and the struck-through card with a number and nothing behind it.',
            misconceptions: [{ claim: 'Writing “assumed” is a weakness that loses marks.', correction: 'An honest, owned assumption is the expected answer when evidence is missing. A bare number is the weakness.' }],
            transition: 'Now the whole method once, on AeroLink’s three enabling technologies.',
            timing: '2 min: 1 min rule, 30 s student situation, 30 s environment words.',
          },
        },
        {
          id: 'w3s1-worked-trl',
          title: 'Worked example I: AeroLink’s three enabling technologies',
          purpose: 'Apply the whole readiness method once; students propose each TRL before the reveal.',
          minutes: 5,
          layout: 'worked-example',
          figure: {
            id: 'w3s1-worked-trl',
            caption: 'AeroLink’s readiness assessment. The lowest TRL among the critical technologies leads the summary. Every TRL rests on an assumption. (FICTIONAL)',
            alt: `A three-row assessment table with columns technology, TRL, basis, critical and maturity risk. ${t1.name}: TRL ${t1.trl}, assumption ${t1.basis.ref}, critical, risk ${t1.maturityRisk}. ${t2.name}: TRL ${t2.trl}, assumption ${t2.basis.ref}, critical, risk ${t2.maturityRisk}; this row is boxed and labeled lowest critical TRL. ${t3.name}: TRL ${t3.trl}, assumption ${t3.basis.ref}, not critical for the piloted baseline, risk ${t3.maturityRisk} accepted.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Select', text: 'the critical technologies the requirements depend on' },
                { label: 'Rate', text: 'each on the scale, with evidence or a labeled assumption' },
                { label: 'Judge', text: 'criticality and what the TRL does not tell' },
                { label: 'Summarize', text: 'the lowest critical TRL and its maturity risk' },
              ],
            },
          ],
          sources: [R('R16', '767'), R('R60', '525'), R('R60', '526')],
          notes: {
            teach: [
              'Show only the technology names first and ask pairs to propose a TRL for each, with a reason, in one minute. Take two answers per technology, then reveal.',
              `Charging: TRL ${t1.trl}. The supplier is assumed to have demonstrated a prototype charger at another operator’s vertiport. Is that the operational environment? No: that site’s grid connection and duty cycle differ from AeroLink’s hubs, so it is relevant, not operational, and “prototype demonstration in a relevant environment” fits. The same prototype shown at an AeroLink hub would be TRL 7. Basis: assumption ${t1.basis.ref}, to be confirmed by the supplier test report before the charger order.`,
              `Battery cells: TRL ${t2.trl}, component validation in a relevant environment, on the assumption that pack-level cycling at fast-charge rates was done (${t2.basis.ref}). Detect-and-avoid: TRL ${t3.trl}, laboratory validation only (${t3.basis.ref}).`,
              'Then judge criticality, which is where the engineering is. Ask: which requirement breaks if this technology underperforms?',
            ],
            workedSolution: [
              `Step 1, select. The critical technologies are the ones a requirement depends on. ${t1.criticalWhy} ${t2.criticalWhy} ${t3.name}: ${t3.criticalWhy}`,
              `Step 2, rate. ${t1.id} TRL ${t1.trl}; ${t2.id} TRL ${t2.trl}; ${t3.id} TRL ${t3.trl}. Each basis is an assumption because the course holds no supplier evidence; say so on the record, with the owner and the validation action of each.`,
              `Step 3, judge what the number hides. ${t1.trlLimit} ${t2.trlLimit}`,
              `Step 4, summarize. The lowest TRL among the critical technologies is ${low.id}, ${low.name.toLowerCase()}, at TRL ${low.trl}. MITRE notes that DoD programs do not count a threshold capability met with technology below TRL 6 as “threshold” (R60 p.526); the course uses the same line, so ${low.id} needs a maturity risk, and it has one, ${low.maturityRisk}, which we write in full in the risk section. ${t3.id} is lower still but not critical for the piloted baseline, so its risk is accepted rather than treated.`,
            ],
            why: 'Students see that the hard part of a readiness assessment is not looking up a level but deciding which technologies are critical and saying what each number hides. The lowest critical TRL is the single figure a reviewer reads first.',
            figure: 'Walk the table row by row: name, level, basis, critical or not, maturity risk. The boxed row is the lowest critical TRL. Point out that every basis column says assumption.',
            misconceptions: [{ claim: 'The lowest TRL in the table is the one that matters most.', correction: 'The lowest TRL among the critical technologies matters most. Detect-and-avoid is lower, but the piloted baseline does not depend on it.' }],
            transition: 'An immature technology is a source of risk. How do we write, rate and treat risks?',
            timing: '5 min: 1 min pairs propose, 1.5 min reveal, 1.5 min criticality and limits, 1 min summary.',
          },
        },
      ],
    },
    // ============================================================================================ C. risk (27 min)
    {
      id: 'w3s1-risk',
      title: 'Risk management, including security and resilience',
      slides: [
        {
          id: 'w3s1-risk-process',
          title: 'The risk process: five activities and what each produces',
          purpose: 'Name the activities, the question each answers and its product.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-risk-loop',
            caption: 'The risk process as a loop: each activity answers one question and produces something the next one uses.',
            alt: 'A five-step loop. Planning: what is our process; produces likelihood and consequence criteria. Identification: what can go wrong; produces if-then risk statements. Analysis: how likely and how severe; produces ratings and the register. Mitigation: accept, avoid, transfer or control; produces plans and a burn-down. Monitoring: how has the risk changed; produces register updates and closures. An arrow returns from monitoring to identification.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['**Planning**: what is our process, and our scales?', '**Identification**: what can go wrong?', '**Analysis**: how likely, how severe?', '**Mitigation**: accept, avoid, transfer or control?', '**Monitoring**: how has the risk changed?'],
            },
          ],
          sources: [R('R17', '482'), R('R46', '124'), R('R46', '125')],
          notes: {
            teach: [
              'SEBoK lists the systems-engineering risk process as planning, identification, analysis, treatment and monitoring (R17 p.482). The DoD guidebook uses the same five activities and its Table 4-3 gives the question each answers and its products: planning produces the likelihood and consequence criteria; identification asks what can go wrong and produces risk statements in an if–then construct; analysis produces likelihood and consequence ratings and puts approved risks in a register; mitigation asks whether to accept, avoid, transfer or control; monitoring asks how the risk has changed (R46 pp.124–125).',
              'Point out that the DoD calls the fourth activity mitigation and notes that treatment and handling are used for the same thing (R46 p.125). Students will meet all three words; they mean the same activity.',
            ],
            why: 'Knowing the product of each activity tells students what their lab register must contain, and the loop shape shows that a register handed in once and never revisited is a broken process.',
            figure: 'Go round the loop once, reading question and product. The arrow from monitoring back to identification is the reason risk management is continuous.',
            misconceptions: [{ claim: 'Risk management is identifying risks and listing them.', correction: 'Identification is one of five activities. A list with no analysis, handling or monitoring is not risk management.' }],
            transition: 'Identification produces risk statements. How should one be written?',
            timing: '2 min: 1.5 min the loop, 30 s the vocabulary.',
          },
        },
        {
          id: 'w3s1-risk-statement',
          title: 'Writing a risk: condition, if, then',
          purpose: 'Teach the statement form and the trap of putting the mitigation inside it.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-risk-anatomy',
            caption: 'A risk in the condition–if–then form, with the most common defect struck out: a mitigation written into the statement.',
            alt: 'A risk statement typeset in three colored parts. Condition, in grey: cells are fast-charged about 20 times per aircraft per day and their fade at this duty is known only from assumed supplier data. If, in amber: usable capacity fades by more than 10 % before pack replacement. Then, in red: the 20 % landing reserve cannot be held on the design trip. Below, a struck-out fourth clause reads so we will sample-test packs, labeled mitigation does not belong here.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['**Condition**: what is known today, the root cause', '**If**: the uncertain risk event', '**Then**: the consequences if it occurs', 'Never write the mitigation into the statement'],
            },
          ],
          sources: [R('R17', '483'), R('R46', '125'), R('R61a', '630'), R('R61a', '631'), R('R61a', '633')],
          notes: {
            teach: [
              'SEBoK asks for structured risk descriptions, such as an if–then format, or a condition that leads to a potential consequence, because they help the analyst think through the nature of the risk (R17 p.483). The DoD guidebook says a statement contains the potential event and its consequences and, if known, a contributing cause (R46 p.125).',
              'MITRE combines them into the condition–if–then construct, which the course uses. The condition reflects what is known today and is the root cause; it has occurred or is certain. The if is the risk event, the probabilistic part. The then is the consequence, or set of consequences, if the event occurs (R61a pp.630–631). Notice the probability lives only in the if.',
              'Then the trap. MITRE says: do not include the mitigation statement in the risk statement, and gives the example “if the contractor does not use XYZ for test, then the test will fail”, where the real concern is test sufficiency and XYZ is one mitigation option (R61a p.633). Any statement whose if is “we do not do X” is a mitigation in disguise.',
            ],
            why: 'A well-formed statement is what makes rating and handling possible: the condition points at the root cause, the if is the thing you rate for likelihood, the then is the thing you rate for consequence.',
            figure: 'Read the three colored parts in order and name each: condition, if, then. Then point at the struck clause. Ask the room why it is wrong: it names a treatment, not an uncertainty.',
            examples: ['Rewrite on the board: “If we do not install fire suppression, then a fire will spread” becomes “Condition: high-power charging next to passengers. If a cell enters thermal runaway, then fire can spread on the pad.” Suppression moves to the treatment column.'],
            misconceptions: [{ claim: 'The condition is uncertain too.', correction: 'The condition is what is known now. Only the if carries the probability you will rate.' }],
            transition: 'With a statement in hand, we rate it. Here the tools are familiar and frequently misused.',
            timing: '3 min: 1 min sources, 1 min the three parts, 1 min the trap.',
          },
        },
        {
          id: 'w3s1-rating',
          title: 'Rating risks: defined scales and the reporting matrix',
          purpose: 'Rate consistently with written scales and read the matrix; tailor consequence to the program.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-risk-matrix',
            caption: `The 5 × 5 reporting matrix with AeroLink’s ${nRisks} risks plotted by likelihood and consequence. Cell levels as in DoD Figure 4-9. (FICTIONAL ratings)`,
            alt: `A five-by-five grid, likelihood 1 to 5 upward and consequence 1 to 5 to the right, cells shaded low, moderate or high as in the DoD reporting matrix. Risk identifiers are placed in cells: ${RISKS.map((r) => `${r.id} at ${r.likelihood} by ${r.consequence}`).join('; ')}. Crowded cells show the risk number only, with a legend (03 means R-003). A side note asks: 2 by 5 or 3 by 4, which is worse?`,
          },
          body: [
            { kind: 'table', header: ['Likelihood', 'Probability band'], rows: LIKELIHOOD.map((l) => [`${l.level} ${l.label}`, l.band]) },
            { kind: 'bullets', items: ['**Consequence**: deviation from the performance, schedule or cost baseline, tailored to the program'] },
          ],
          sources: [R('R17', '483'), R('R46', '125'), R('R46', '126'), R('R61b', '635'), R('R61b', '637')],
          notes: {
            teach: [
              'SEBoK: risk analysis estimates the likelihood and the consequence of each risk and converts them into a risk level; there is no best approach, and scales with a matrix, simulations and probabilistic assessments are all used for technical risk (R17 p.483).',
              'The DoD guidebook: consequence is measured as a deviation against the program’s performance, schedule or cost baseline and should be tailored to the program; approved risks go into a register and a reporting matrix (R46 p.125). The matrix is its Figure 4-9 on the next page; the likelihood levels and probability bands in the table are read from that figure, which is an image in the guidebook (R46 p.126).',
              'MITRE adds two practices. Probability is often assessed subjectively when objective methods are not possible, and you must document the rationale for each rating and tailor the criteria to the decision (R61b pp.635, 637). Course convention: written consequence anchors from minimal to severe, in the lab brief, with a written reason for every rating.',
            ],
            why: 'Shared written scales make two raters give the same rating to the same risk, and a recorded reason lets a reviewer challenge the rating instead of the rater.',
            figure: `Orient the grid: likelihood up, consequence right, shading from low to high. Point at the cluster in the moderate band: ${nReferenceRisks} reference risks plus the three security and resilience risks added this week. End on the side note: 2 by 5 or 3 by 4, which is worse? Leave it open for the next slide.`,
            examples: ['Instructor decision: the consequence anchors are a course adaptation of the DoD figure’s performance and schedule columns, which are written for defense programs; confirm or adjust them before the lab opens.'],
            misconceptions: [{ claim: 'A risk matrix gives an objective risk level.', correction: 'It gives a consistent one, if the scales are written and the reasons recorded. The inputs are still judgments, often subjective.' }],
            transition: 'Now the question on the figure, and what the matrix cannot answer.',
            timing: '3 min: 1 min analysis, 1 min DoD and the bands, 1 min rationale and anchors.',
          },
        },
        {
          id: 'w3s1-matrix-limits',
          title: 'What the matrix cannot say: ordinal scales are not numbers',
          purpose: 'Work the arithmetic that shows why likelihood × consequence products mislead on ordinal scales, and when a numeric calculation is legitimate.',
          minutes: 3,
          layout: 'worked-example',
          figure: {
            id: 'w3s1-ordinal-trap',
            caption: 'The product of two ordinal ratings ranks a safety risk below a performance risk, and gives the same number to cells the matrix treats differently.',
            alt: 'Two panels. Left: two cells, likelihood 1 by consequence 5 and likelihood 5 by consequence 1, both with product 5; the first is shaded moderate, the second low. Right: battery fade at 3 by 4, product 12, and thermal runaway at 2 by 5, product 10; both shaded moderate. A bar labeled product ranks fade above thermal runaway; a bar labeled course rule ranks thermal runaway first by consequence.',
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Same product', text: '1 × 5 = 5 × 1 = 5, but the cells differ' },
                { label: 'Wrong order', text: 'fade 3 × 4 = 12 outranks runaway 2 × 5 = 10' },
                { label: 'Course rule', text: 'rank by cell level, then consequence' },
                { label: 'Cardinal', text: 'multiply only measured quantities' },
              ],
            },
          ],
          sources: [R('R17', '483'), R('R17', '486'), R('R61b', '636'), R('R61b', '637')],
          notes: {
            teach: [
              'Many registers multiply the two ratings and sort by the product. Do the arithmetic with the class and see what happens.',
              'Close by naming the evidence honestly. SEBoK prioritizes by risk level and by the pair of maximum probability and maximum consequence (R17 p.483); reading that as a pair rather than a product is the instructor’s gloss. SEBoK also asks that risk-tool results be challenged (R17 p.486). MITRE separates qualitative matrices from quantitative techniques that weight cardinal assessments (R61b pp.636–637). No source in the course collection argues the ordinal-arithmetic point directly; that reasoning is the instructor’s.',
            ],
            workedSolution: [
              `Step 1, same product. Likelihood 1 with consequence 5 gives ${ORDINAL_DEMO.sameProduct[0].product}; likelihood 5 with consequence 1 gives ${ORDINAL_DEMO.sameProduct[1].product}. The DoD matrix shades the first ${ORDINAL_DEMO.sameProduct[0].level.toLowerCase()} and the second ${ORDINAL_DEMO.sameProduct[1].level.toLowerCase()}. The product throws away the asymmetry the matrix was built to keep.`,
              `Step 2, wrong order. Battery fade, R-002, is 3 × 4 = ${ORDINAL_DEMO.r002.product}. Thermal runaway, R-008, is 2 × 5 = ${ORDINAL_DEMO.r008.product}. Sorted by product, fade comes first. But the levels are labels, not quantities: a 5 is not five times a 1, and the gap from 4 to 5, a missed requirement to injury, is not the same size as the gap from 2 to 3. Both cells are ${ORDINAL_DEMO.r002.level.toLowerCase()} in the matrix, so the matrix itself does not rank them.`,
              'Step 3, the course rule. Rank by cell level first; within a level, the higher consequence first; then the higher likelihood. Thermal runaway ranks above fade. This is a course convention, consistent with SEBoK’s pair of maximum values.',
              `Step 4, when multiplication is legitimate. If the consequence is measured in real units, expected value is meaningful. Weather limits lower than planned, R-004: if holds rise from ${R004_EXPECTED.holdsPlanned * 100} % to ${R004_EXPECTED.holdsIfLower * 100} % of operating hours, the service loses 300 × 0.03 = ${R004_EXPECTED.lost} trips a day. Likelihood level 3 is the band ${L3.band}, so the expected loss is between ${R004_EXPECTED.expectedLo} and ${R004_EXPECTED.expectedHi} trips a day, about ${R004_EXPECTED.expectedMid} at the midpoint. That is a number you can compare with the cost of a treatment. The 8 % is a proposed value for the exercise.`,
            ],
            why: 'Students will meet products of ordinal ratings in industry registers. Working one example shows the failure concretely and gives them a defensible alternative, and the cardinal case shows when calculation is actually useful.',
            figure: 'Left panel: same product, different shading. Right panel: the product bar puts fade first; the course-rule bar puts thermal runaway first. Ask which order you would want a safety board to see.',
            misconceptions: [{ claim: 'Multiplying likelihood and consequence gives expected loss.', correction: 'Only when both are numbers on real scales, a probability and a measured loss. Ordinal levels are ranks; their product is not a quantity.' }],
            transition: 'Rated risks need a handling decision. There are more options than mitigation.',
            timing: '3 min: 45 s each of the four steps, sources as you close.',
          },
        },
        {
          id: 'w3s1-handling',
          title: 'Handling options: evaluate all four before choosing',
          purpose: 'Choose deliberately among avoid, control, transfer and accept, with watch as a monitoring option.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-handling-doors',
            caption: 'Four handling options, each shown with one AeroLink risk. Transfer changes who pays, not what passengers experience.',
            alt: 'Four doors side by side. Avoid: commit a hub site only where the utility confirms capacity (grid connection risk). Control: cell-temperature monitoring stops charging (thermal runaway). Transfer: a performance guarantee in the purchase contract (weather limits). Accept: the piloted baseline does not depend on detect-and-avoid. Under the transfer door a note reads consequence for passengers unchanged.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['**Avoid**: change requirements or plans so the risk goes away', '**Control**: reduce likelihood, consequence or both', '**Transfer**: move accountability to a willing party', '**Accept**: a deliberate, approved decision; then monitor', 'Evaluate all four; do not default to mitigation'],
            },
          ],
          sources: [R('R17', '484'), R('R17', '485'), R('R46', '126'), R('R61c', '642'), R('R61c', '644')],
          notes: {
            teach: [
              'SEBoK names four treatment options, assumption, avoidance, control or mitigation, and transfer, and says all four should be evaluated and the best one chosen for each risk; hybrid and contingent strategies are possible, and when the choice is hard, buying information through prototypes or modeling clarifies it (R17 p.484). The DoD guidebook uses accept and monitor, avoid, transfer and control, and gives examples such as risk-reduction prototyping, deferring capability to a later increment and off-ramps to mature technology (R46 p.126).',
              'MITRE defines transfer as reassigning accountability, responsibility and authority to another stakeholder willing to accept the risk, adds watch or monitor, and warns that transfer is a double-edged sword: it creates dependencies and loss of control (R61c pp.642, 644).',
              'The pitfall SEBoK names is automatic mitigation selection: choosing mitigation without evaluating all four options in an unbiased way (R17 p.485). Course convention: the register records one of avoid, mitigate, transfer, accept or watch, with an owner, a treatment and a trigger.',
            ],
            why: 'Defaulting to mitigation spends money on risks that would be cheaper to avoid, transfer or accept. Seeing one real example behind each door makes the options concrete.',
            figure: 'Open each door in turn and read the AeroLink example behind it. Stop at transfer and read the note: the contract compensates AeroLink, but a passenger whose trip is held still waits.',
            misconceptions: [{ claim: 'Accepting a risk means ignoring it.', correction: 'Acceptance is a deliberate, approved decision, and the risk is still monitored with a trigger.' }],
            transition: 'Two kinds of risk are left out of student registers more than any other: security and resilience.',
            timing: '3 min: 1.5 min the four options and examples, 1 min transfer caution, 30 s pitfall.',
          },
        },
        {
          id: 'w3s1-security-resilience',
          title: 'Security and resilience risks belong in the same register',
          purpose: 'Integrate security and resilience into the risk process: adversity, loss and the avoid–withstand–recover objectives.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-security-resilience',
            caption: 'Adversity, whether attack, fault or outage, degrades capability. Resilience aims to avoid, withstand and recover; security limits loss of assets.',
            alt: 'A capability-over-time chart. A flat line at required capability drops when an adversity arrives, holds at a reduced level, then climbs back. Three bands are labeled avoid before the drop, withstand during the reduced level and recover during the climb. Three AeroLink risks are pinned to the chart, each card labeled Security or Resilience: intrusion into the operations platform, altered charger commands, and a regional grid outage. A legend lists the assets at stake: system capability, data and information, infrastructure, people.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Resilience: provide required capability when facing adversity', 'Objectives: **avoid**, **withstand**, **recover**', 'Security: freedom from conditions that lead to loss of assets', 'Adversity includes attacks, faults and outages', 'Plan risk management to take these risks'],
            },
          ],
          sources: [R('R24', '1203'), R('R24', '1204'), R('R24', '1208'), R('R25', '1229'), R('R25', '1231'), R('R39q', '1610')],
          notes: {
            teach: [
              'SEBoK’s resilience article gives the INCOSE working-group definition: resilience is the ability to provide required capability when facing adversity (R24 p.1203). An adversity is any condition that could degrade the delivered capability; it may come from within the system or its environment, be expected or unexpected, malicious or accidental. The three fundamental objectives are avoid, withstand and recover (R24 p.1204). The same article says risk management should be planned to handle the risks, issues and opportunities that resilience activities identify (R24 p.1208).',
              'SEBoK’s security article: security is freedom from those conditions that may lead to loss of assets with undesired consequences, and systems security is about intended and authorized behavior despite adversity (R25 p.1229). Its Table 1 lists the asset classes, including system capability, data and information, infrastructure and people, and its scope note says adversity includes threats, attacks, vulnerabilities, hazards and internal faults such as missing requirements (R25 p.1231). The SEBoK glossary’s second risk definition, threat, vulnerability and consequence, is the one used for attacks and disasters (R39q p.1610).',
              `So we add three risks to AeroLink’s register this week, all proposed for the instructor to confirm: ${r09.name.toLowerCase()}, ${r10.name.toLowerCase()} and ${r11.name.toLowerCase()}. They are written, rated and handled like every other risk; what changes is that the treatment is judged against avoid, withstand and recover, and that we name the asset at stake.`,
            ],
            why: 'Security and resilience are not specialist appendices; they are risks to the capability the needs ask for. Putting them in the same register, in the same form, is the integration the course commits to, and it prepares their return in Weeks 5 and 6.',
            figure: 'Trace the capability line: steady, the drop when adversity arrives, the reduced level, the climb back. Name the three bands. Then point at the three pinned risks: an attack, a fault or attack on chargers, and an outage.',
            examples: [`Ask: which of the three is in the Low cell of the matrix? The grid outage, at ${r11.likelihood} × ${r11.consequence}. Resilience asks a question the matrix does not: how long would recovery take?`],
            misconceptions: [{ claim: 'Security risks are about hackers; faults are reliability, not security.', correction: 'SEBoK’s security scope covers adversity of every kind, including internal faults. The charger risk is written so that the treatment works whether the altered command came from an attacker or a faulty update.' }],
            transition: 'Now one security risk and one external risk, worked in full.',
            timing: '3 min: 1 min resilience, 1 min security, 1 min the three AeroLink risks.',
          },
        },
        {
          id: 'w3s1-worked-risk',
          title: 'Worked example II: writing, rating and handling two risks',
          purpose: 'Apply the whole risk method to a security risk with a safety consequence and to an external risk handled by transfer.',
          minutes: 5,
          layout: 'worked-example',
          figure: {
            id: 'w3s1-worked-risk',
            caption: 'Two register entries expanded: the condition–if–then parts, the ratings with reasons, the handling, and the requirements each threatens. (FICTIONAL)',
            alt: `Two cards. Card one, ${r10.name}: condition, networked and remotely configurable chargers; if, commands or configuration altered by an unauthorized party or a faulty update; then, power limit exceeded or charge past cell limits. Rated ${r10.likelihood} by ${r10.consequence}, ${riskLevel(r10).toLowerCase()}; handling control, with signed configurations and a local temperature interlock; arrows to ${r10.affects.join(', ')}. Card two, ${r04.name}: condition, limits unpublished; if, approved limits lower than planned; then, holds above 5 % and capacity below the requirement. Rated ${r04.likelihood} by ${r04.consequence}; handling transfer by contract guarantee; arrows to ${r04.affects.join(', ')}.`,
          },
          body: [
            {
              kind: 'steps',
              items: [
                { label: 'Write', text: 'condition, if, then; no treatment inside' },
                { label: 'Rate', text: 'likelihood and consequence, each with a reason' },
                { label: 'Handle', text: 'compare all four options; owner, treatment, trigger' },
                { label: 'Link', text: 'to the requirements and scenarios it threatens' },
              ],
            },
          ],
          sources: [R('R61a', '630'), R('R17', '484'), R('R46', '126'), R('R24', '1206'), R('R25', '1231')],
          notes: {
            teach: [
              'Give pairs ninety seconds to write the charger risk from this hint: the chargers are networked and remotely configurable. Take one statement and repair it with the class against the three parts. Then reveal.',
              'Work the second risk, weather limits, faster: the class has seen transfer on the doors slide.',
            ],
            workedSolution: [
              `Write. ${riskStatement(r10)} The condition is a fact today; the if carries the probability; the then names two consequences, a hub trip and a thermal hazard.`,
              `Rate. Likelihood ${r10.likelihood}, ${L2.label.toLowerCase()} (${L2.band}): ${r10.likelihoodWhy} Consequence ${r10.consequence}: ${r10.consequenceWhy} Cell: ${riskLevel(r10).toLowerCase()}.`,
              `Handle. Avoid would mean chargers that cannot be configured remotely, which the operation needs. Transfer to the supplier would not remove the hazard on the pad. Accept is not defensible for a safety consequence. So control: ${r10.treatment} The local interlock applies defense in depth: SEBoK lists coordinated defense among the resilience techniques, for example through a defense-in-depth strategy (R24 p.1206). Owner: ${r10.owner}. Trigger: ${r10.trigger.toLowerCase()}.`,
              `Link. It threatens ${r10.affects.join(', ')}. The asset classes at stake are ${r10.security!.assets.join(' and ').toLowerCase()}; adversity includes faults as well as attacks (R25 p.1231), which is why the treatment does not depend on knowing which caused the change.`,
              `Second risk. ${riskStatement(r04)} Rated ${r04.likelihood} × ${r04.consequence}. Handling: transfer. ${r04.treatment} The consequence rating does not change: the contract moves money to AeroLink, but the passenger whose trip is held still waits. That residual operational risk is why the contingent weather-routing study is attached to the trigger.`,
            ],
            why: 'Working two contrasting risks shows the method is the same for a security risk and an external one, while the handling decision differs for reasons students can state.',
            figure: 'Card one: read the colored parts, the rating, the treatment, then follow the arrows to the requirements. Card two: same order, and stop on the transfer label.',
            misconceptions: [{ claim: 'Transferring a risk lowers its consequence rating.', correction: 'Transfer changes who bears the cost. The operational consequence for passengers is unchanged, so the rating stays and a residual risk remains.' }],
            transition: 'A handled risk still has to be watched. Here is how monitoring goes wrong.',
            timing: '5 min: 1.5 min pairs write, 2 min charger risk worked, 1.5 min weather risk.',
          },
        },
        {
          id: 'w3s1-monitoring-pitfalls',
          title: 'Monitoring, triggers and the pitfalls to avoid',
          purpose: 'Present the register as a living instrument and contrast the named pitfalls with good practices.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-burn-down',
            caption: 'A burn-down for battery fade: planned and actual risk level over time, the trigger on its TPM, and the “sea of green” trap.',
            alt: 'A chart of risk level against months. A planned burn-down line steps down from moderate to low over 18 months. An actual line follows the plan at first, then flattens. Beside it, a column of green status lights for staffing, budget and test schedule, labeled sea of green: the plan looks on track while the risk is not falling. A dashed horizontal marker on a small inset reads trigger: TPM margin below 1 point.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Monitor with metrics, including TPMs, against a burn-down', '**Sea of green**: track the risk, not the plan', 'Done only for reviews → keep the register continuous', 'Automatic mitigation → evaluate all four options', 'Band-aid treatment → address the root cause'],
            },
          ],
          sources: [R('R17', '484'), R('R17', '485'), R('R17', '486'), R('R46', '127')],
          notes: {
            teach: [
              'SEBoK: risk monitoring evaluates the effectiveness of treatment against established metrics; approaches include earned value, program metrics and technical performance measures (R17 p.484). The DoD guidebook: track mitigation against risk burn-down plans and assess performance through associated TPMs (R46 p.127). That is the bridge to the last section today.',
              'Then the pitfalls from SEBoK’s Table 1. Lack of continuity: risk management done only to satisfy reviews. Automatic mitigation selection, from the handling slide. Sea of green: tracking progress of the treatment plan, staffing, budget, data gathering, while the risk itself is largely unaffected. Band-aid treatment: patching each instance instead of the root cause (R17 pp.485–486).',
              'And the good practices from Table 2: understand the limits of risk analysis and challenge results; a robust treatment tries to reduce both probability and consequence; structured monitoring compares actual with anticipated outcomes; update the register at regular intervals and after major changes (R17 p.486).',
            ],
            why: 'Students tend to hand in a register once. Seeing the sea-of-green failure, a plan that looks healthy while the risk is unchanged, explains why each risk needs a trigger tied to an observable quantity.',
            figure: 'Follow the planned line, then the actual line flattening. Point at the green lights: every plan item is on track. Then at the inset: the trigger is on a measured quantity, the TPM margin, not on the plan.',
            misconceptions: [{ claim: 'If every treatment task is on schedule, the risk is under control.', correction: 'That is the sea of green. Watch the quantity the risk threatens; the plan’s progress is not the same thing.' }],
            transition: 'Last in this section: the register is part of the package, linked to what it threatens.',
            timing: '3 min: 1 min monitoring, 1 min pitfalls, 1 min good practices.',
          },
        },
        {
          id: 'w3s1-register-linked',
          title: 'Worked example III: the register, linked to the package',
          purpose: 'Show the register as part of the Team Record, every entry linked to what it affects (assumptions, risks, opportunities, unknowns; issues apart).',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-register-network',
            caption: 'AeroLink’s register entries on the left, the Week 2 artifacts they affect on the right. Unknowns link to the TBDs of the requirements. (FICTIONAL)',
            alt: `A network diagram. Left column groups: assumptions A-001 to A-008; risks ${RISKS.map((r) => r.id).join(', ')}; opportunities ${OPPORTUNITIES.map((o) => o.id).join(' and ')}; unknowns ${UNKNOWNS.map((u) => u.id).join(', ')}. Right column: requirements, capabilities and scenarios. Lines labeled affects connect them, for example charging capacity lags fleet growth to CAP-003, REQ-STK-001 and REQ-STK-004, and the weather-limits unknown to the TBD in REQ-STK-003. Below, separate, the issue log with one entry.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Every entry **affects** named requirements, capabilities or scenarios', 'Each Week 2 TBD or TBR links to an unknown', 'Issues kept in a separate log', 'Owners and triggers make the register actionable'],
            },
          ],
          sources: [R('R13', '565'), R('R17', '483')],
          notes: {
            teach: [
              `AeroLink’s register now holds eight assumptions, ${nRisks} risks, ${OPPORTUNITIES.length} opportunities and ${UNKNOWNS.length} unknowns, with one issue in a separate log, now closed by two new requirements, one obligation each, the notice time an owned TBD. Every entry names what it affects. For example, charging capacity lags fleet growth affects CAP-003, REQ-STK-001 and REQ-STK-004.`,
              'The unknowns are not new: they are the TBD and TBR values you tracked in Week 2. SEBoK says TBDs and TBRs must be tracked (R13 p.565); linking each to an unknown with an owner is how. SEBoK’s list of candidate risk documentation includes potential root causes and a responsible individual (R17 p.483), which is what the owner and the condition give.',
              'Why links matter: when the utility answers the grid-connection question, you can see at once which requirements, which technology and which risk change. That is the document-based form of the digital thread you will model in Week 12.',
              'A living register also keeps its promises visible. Four Week 2 unknowns were due at this trade and none closed, so each is re-dated with a reason instead of being left stale: the grid limit becomes a decision condition, the event cap is enforced by scheduling whichever option wins, and operator workload and fare move to the work that needs them.',
            ],
            why: 'An unlinked register is a separate list nobody reads. Linking each entry to the artifacts it threatens makes change impact visible and makes the register part of the engineering package.',
            figure: 'Point at the four groups on the left, then follow two or three links across. End on the issue log, drawn apart on purpose.',
            misconceptions: [{ claim: 'The risk register belongs to project management, separate from requirements.', correction: 'Each entry threatens specific requirements and capabilities; the link is what lets a change in one show up in the other.' }],
            transition: 'Some risks threaten a number in a requirement. We track those numbers over time.',
            timing: '2 min: 1 min the register, 1 min links and why.',
          },
        },
      ],
    },
    // ============================================================================================ D. TPMs (12 min)
    {
      id: 'w3s1-tpm',
      title: 'Technical performance measures',
      slides: [
        {
          id: 'w3s1-tpm-hierarchy',
          title: 'From MOE and MOP to TPM',
          purpose: 'Complete the measures hierarchy begun in Week 2 and define a TPM and its four attributes.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-tpm-pyramid',
            caption: 'The measures hierarchy with the TPM level added: a TPM tracks, over development, a design parameter behind an MOP.',
            alt: `A three-level pyramid. Top: measure of effectiveness, passenger wait (MOE-001). Middle: measure of performance, charge time to dispatch threshold (MOP-002). Bottom, newly filled: technical performance measure, charge time tracked through design maturity (TPM-001), measuring ${requirement(p1.measures).id}. A side arrow labeled over time points along the bottom level.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['TPMs: measures collected over time to see trends and forecast progress to plan', 'Estimated early from models; replaced by demonstrated data', 'Leading indicators of deficiencies and risk', 'Good TPM: quantifiable, routine, planned profile, tied to a risk'],
            },
          ],
          sources: [R('R15', '532'), R('R44', '113'), R('R44', '116')],
          notes: {
            teach: [
              'SEBoK: technical measurement includes measures of effectiveness, measures of performance and technical performance measures, planned early and performed with increasing fidelity (R15 p.532). Week 2 gave you the first two; today adds the third.',
              'The DoD guidebook: TPMs are measures collected over time to see trends and forecast progress to plan. Early in the life cycle they may be estimated from assumptions, modeling and simulation; demonstrated data replace the estimates later. TPMs provide leading indicators of performance deficiencies or system risk (R44 p.113).',
              'Its four attributes of a good TPM, which your lab gate checks: quantifiable with defined criteria; collected at routine intervals; a curve of planned values, thresholds or goals over time, with at least a planned value at each review; and strongly relevant to a program risk or decision (R44 p.116).',
            ],
            why: 'Students conflate MOPs and TPMs. The distinction is time: an MOP states what the system must achieve; a TPM watches a design estimate of it converge, review by review, while there is still time to act.',
            figure: 'Read the pyramid top down: the passenger’s wait, the charge time that drives it, and the TPM that tracks the charger design’s estimate of that charge time over months.',
            misconceptions: [{ claim: 'A TPM is just an MOP with a target.', correction: 'A TPM is tracked over development with a planned profile and a margin; it exists to warn early, which an MOP checked once at verification cannot do.' }],
            transition: 'Tracking needs exact vocabulary: current estimate, contingency, worst case and margin.',
            timing: '2 min: 30 s hierarchy, 1 min DoD definition, 30 s four attributes.',
          },
        },
        {
          id: 'w3s1-tpm-margin',
          title: 'Current estimate, contingency, worst case and margin',
          purpose: 'Define the four quantities exactly and the equation that relates them.',
          minutes: 3,
          layout: 'equation',
          figure: {
            id: 'w3s1-margin-bar',
            caption: 'For a lower-is-better TPM: the current best estimate, plus contingency to the worst case, then margin up to the threshold. The objective lies below.',
            alt: 'A vertical bar for a lower-is-better measure. From the bottom: the objective line; above it the current best estimate; a hatched contingency band up to the worst-case estimate; an open band labeled margin up to the threshold line at the top. Arrows label contingency decreases as the design matures and margin is trade space.',
          },
          body: [
            { kind: 'equation', display: 'WCE = CBE + contingency      margin = threshold − WCE', speech: 'Worst-case estimate equals current best estimate plus contingency. Margin equals threshold minus worst-case estimate.', where: [{ symbol: 'CBE', meaning: 'current best estimate' }, { symbol: 'contingency', meaning: 'allowance for uncertainty; shrinks as the design matures' }, { symbol: 'margin', meaning: 'growth still possible within the threshold' }] },
            { kind: 'callout', tone: 'note', text: 'Higher-is-better: subtract contingency, and margin = WCE − threshold.' },
          ],
          sources: [R('R44', '117')],
          notes: {
            teach: [
              'Read the DoD definitions slowly; this page is the most misquoted in student work. TPM reporting should account for uncertainties such as measurement error and the immaturity of the item. Allotted values for these are called contingency, and they adjust the current best estimate to a worst-case estimate for comparison against the planned profile, thresholds and goals (R44 p.117).',
              'Contingency typically decreases as the system and measurements mature; a surrogate item warrants more contingency than the end item. Margin is the amount of growth that can be accommodated while still remaining within the threshold, the remainder of threshold minus worst-case estimate, and it is trade space for the program manager (R44 p.117).',
              'So the equation: worst case equals current estimate plus contingency; margin equals threshold minus worst case. For a measure where higher is better, such as energy remaining, contingency is subtracted and the sign of margin is reversed, so that a positive margin always means room to spare. That sign convention is the course’s.',
            ],
            why: 'Without contingency, margin is computed from the optimistic estimate and looks larger than it is; students then report healthy margins on numbers nobody has measured.',
            figure: 'Build the bar from the bottom: objective, current estimate, the hatched contingency band, the open margin band, the threshold at the top. Then point at the two arrow labels.',
            misconceptions: [{ claim: 'Margin is threshold minus the current estimate.', correction: 'Margin is threshold minus the worst-case estimate. Using the current estimate assumes zero contingency, which is only true for a measured end item.' }],
            transition: 'Now AeroLink’s three TPMs, and a correction to the reference data.',
            timing: '3 min: 1 min contingency, 1 min margin, 1 min equation and sign convention.',
          },
        },
        {
          id: 'w3s1-worked-tpm',
          title: 'Worked example IV: AeroLink’s TPMs, margins and planned profile',
          purpose: 'Compute worst case and margin for the three TPMs, read a planned profile, and record the event-cap decision.',
          minutes: 4,
          layout: 'worked-example',
          figure: {
            id: 'w3s1-tpm-profile',
            caption: 'Landing energy reserve: planned worst case at five reviews against the 20 % threshold, and a hypothetical month-6 reading that crosses the trigger. (FICTIONAL)',
            alt: `A line chart of landing energy reserve in percent against months 0, 6, 12, 18 and 24. A horizontal threshold line at 20 % and an objective line at 25 %. The planned worst-case line runs ${prof3.map((p) => f1(p.wce)).join(', ')} across the five reviews. A red point at month 6 shows a hypothetical reading of ${f2(MONTH6.wce)} %, with a dashed marker at 21 % labeled trigger: margin below 1 point.`,
          },
          body: [
            {
              kind: 'table',
              header: ['TPM', 'CBE', 'Cont.', 'WCE', 'Margin'],
              rows: TPMS.map((t) => [`${t.name} (${t.unit})`, String(t.cbe), f1(t.contingency), String(wceOf(t)), f1(marginOf(t))]),
            },
            { kind: 'steps', items: [{ label: 'Compute', text: 'worst case and margin' }, { label: 'Read', text: 'the planned profile' }] },
          ],
          sources: [R('R44', '116'), R('R44', '117')],
          notes: {
            teach: [
              'Give the class the three current estimates and contingencies and ask each row of the room to compute one worst case and margin. Then reveal and correct the reference data together.',
              'Close with the decision this week owes the noise need, and leave the profile on screen while you do.',
            ],
            workedSolution: [
              `Charge time, lower is better: ${p1.cbe} + ${f1(p1.contingency)} = ${wceOf(p1)} min; margin ${p1.threshold} − ${wceOf(p1)} = ${f1(marginOf(p1))} min. Pad-edge noise: ${p2.cbe} + ${f1(p2.contingency)} = ${wceOf(p2)} dBA; margin ${p2.threshold} − ${wceOf(p2)} = ${f1(marginOf(p2))} dBA. Landing energy, higher is better: ${p3.cbe} − ${f1(p3.contingency)} = ${wceOf(p3)} %; margin ${wceOf(p3)} − ${p3.threshold} = ${f1(marginOf(p3))} points.`,
              `The correction. The instructor reference records margins of ${referenceMarginOf(p1)}, ${referenceMarginOf(p2)} and ${referenceMarginOf(p3)}: threshold minus the current estimate, which treats contingency as zero. The DoD defines margin against the worst case (R44 p.117). The contingencies used here are proposed for the instructor to confirm, each with its reason: ${p2.contingencyWhy.toLowerCase()} Noise margin shrinks from ${referenceMarginOf(p2)} to ${f1(marginOf(p2))} dBA, which is why the measurement campaign is a treatment of the noise risk.`,
              `The planned profile. For landing energy the plan holds the estimate at ${p3.cbe} % and lets contingency fall from ${f1(prof3[0].contingency)} to ${f1(prof3[4].contingency)} as cycle tests replace assumptions, so planned worst case rises from ${f1(prof3[0].wce)} to ${f1(prof3[4].wce)} %. Each review has a planned value, as the DoD asks (R44 p.116).`,
              `The event cap. The corrected noise need also bounds the number of evening and early-morning events. Does that need its own TPM? No: the cap is not a design parameter that matures; scheduling enforces it, verified by test, and an operational measure tracks it. The objective and the noise MOE now carry the cap; the aircraft TPM tracks the level of each event only. This is the instructor’s decision for the case, recorded in the reference.`,
            ],
            why: 'Computing three margins by hand, then seeing the reference itself corrected, teaches the definition more firmly than any warning, and the event-cap decision shows that not every requirement needs a TPM.',
            figure: 'Read the threshold and objective lines, then the planned worst-case line climbing as contingency falls. Leave the red month-6 point for the next slide.',
            misconceptions: [{ claim: 'Every requirement with a number should have a TPM.', correction: 'TPMs are for design parameters that are uncertain and tied to a risk. An operational limit enforced by a function is verified and monitored, not tracked as a TPM.' }],
            transition: 'That red point at month 6 is where all three instruments meet.',
            timing: '4 min: 1 min students compute, 1 min reveal and correction, 1 min profile, 1 min event cap.',
          },
        },
        {
          id: 'w3s1-chain',
          title: 'One chain through all three instruments',
          purpose: 'Show the document-based thread from a technology through a risk and a TPM to a requirement and a need, and how a change propagates.',
          minutes: 3,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-chain',
            caption: `Battery cells (TRL ${t2.trl}) → capacity fade risk → landing-energy TPM → planned landing reserve → assurance of flight within safety limits. A test result propagates along the chain. (FICTIONAL)`,
            alt: `Five linked cards left to right: ${CHAIN.join(', ')}. Under each card one line: TRL ${t2.trl} on an assumption; rated 3 by 4, mitigate; margin ${f1(marginOf(p3))} points, trigger below 1; at least 20 % usable energy on landing; the need for flight within safety limits. A red dashed arc runs from the TPM card back over the risk card to the technology card, labeled 12 % fade at month 6.`,
          },
          body: [
            {
              kind: 'bullets',
              items: ['Technology → risk → TPM → requirement → need', `12 % fade: reserve ${f2(MONTH6.cbe)} %, margin ${f2(MONTH6.margin)}: trigger fires`, `15 % fade: reserve ${f1(FADE15)} %, below the threshold`, 'One result changes the whole chain'],
            },
          ],
          sources: [R('R44', '113'), R('R17', '484')],
          notes: {
            teach: [
              `Walk the chain left to right: battery cells at TRL ${t2.trl}, on an assumption; their maturity risk, capacity fade, rated 3 by 4 and mitigated; the TPM that watches it, landing energy, with a margin of ${f1(marginOf(p3))} points and a trigger at 1 point; the requirement it measures, a planned landing reserve of at least 20 %; and the need behind it, assurance of flight within safety limits.`,
              `Now the month-6 reading, a hypothetical value for the exercise. The design trip uses a fixed energy, which the reference estimate of 23 % at 10 % fade fixes at 0.693 of the starting usable energy. If cycle tests show 12 % fade, the reserve is (0.88 − 0.693) ÷ 0.88, about ${f2(MONTH6.cbe)} %. With 1 point of contingency the worst case is ${f2(MONTH6.wce)} % and the margin ${f2(MONTH6.margin)} points: below the trigger.`,
              `So the TPM, a leading indicator (R44 p.113), fires the risk’s trigger; the risk’s likelihood rises from 3 to 4, moving it to a high cell; the treatment, pack replacement scheduled from measured fade, starts. If fade reached 15 %, the reserve would be about ${f1(FADE15)} %, below the threshold itself: the requirement would be infeasible on the design trip unless trips are shortened. That is a requirement change, and it would ripple to capacity.`,
            ],
            why: 'The chain shows why the three instruments are taught together: a readiness assumption creates a risk, a TPM watches it, and one test result moves every link. It is also the document-based version of the digital thread modeled in Phase II.',
            figure: 'Read the five cards and the line under each. Then follow the red dashed arrow back: the measurement at month 6 travels from the TPM to the risk and to the readiness assumption.',
            misconceptions: [{ claim: 'A positive margin means the requirement is safe.', correction: 'A positive but shrinking margin that crosses its trigger is the warning. TPMs are read as trends, not single values.' }],
            transition: 'Session 2 makes a decision with all of this in view. Here is what it needs from today.',
            timing: '3 min: 1 min the chain, 1 min the arithmetic, 1 min propagation.',
          },
        },
      ],
    },
    // ============================================================================================ E. hand-off and exit (7 min)
    {
      id: 'w3s1-close',
      title: 'Hand-off and exit',
      slides: [
        {
          id: 'w3s1-handoff',
          title: 'What Session 2 needs from today',
          purpose: 'Hand off: readiness and risk enter the trade study as criteria, screens or conditions.',
          minutes: 2,
          layout: 'figure-bullets',
          figure: {
            id: 'w3s1-handoff',
            caption: 'A trade study frame with two sockets highlighted: maturity and risk enter as criteria, as must-meet screens, or as conditions on the decision.',
            alt: 'An outline of a trade-study frame with labeled slots: decision, alternatives, criteria, weights, scores, sensitivity, recommendation. Two sockets are highlighted: maturity from the readiness assessment and risk from the register, each with three arrows into the frame labeled criterion, screen and condition.',
          },
          body: [
            {
              kind: 'bullets',
              items: ['Identify uncertainty and assess risk for each decision', 'Maturity and risk enter as criteria, screens or conditions', 'Resilience can be a criterion; security a must-meet screen', 'Bring your enterprise’s technologies and one decision'],
            },
          ],
          sources: [R('R18', '464'), R('R24', '1208')],
          notes: {
            teach: [
              'SEBoK lists, among the best practices of decision management, identifying uncertainty and assessing risks for each decision (R18 p.464). So nothing from today is left behind: readiness and risk enter the trade study in one of three ways. As a criterion, scored for each alternative. As a must-meet screen, applied before scoring. Or as a condition on the recommendation, “valid only if”.',
              'The resilience article is explicit: evaluating alternative solution classes must consider their ability to deliver required capabilities under adversity (R24 p.1208). On Thursday you will see AeroLink use resilience as a weighted criterion and security as two must-meet screens, and we will discuss why those choices differ.',
            ],
            why: 'Students otherwise treat the trade study as a scoring exercise detached from risk. Naming the three ways risk enters prepares the Session 2 design choices.',
            figure: 'Point at the frame’s slots, then the two highlighted sockets and their three arrows each: criterion, screen, condition.',
            misconceptions: [{ claim: 'Risk belongs in the risk register, not the trade study.', correction: 'SEBoK asks for uncertainty and risk in every decision. A trade study that ignores them recommends alternatives whose weaknesses nobody weighed.' }],
            transition: 'Before you go, one minute of retrieval and the preparation for Session 2.',
            timing: '2 min: 1 min three ways, 1 min resilience and the preview.',
          },
        },
        {
          id: 'w3s1-exit',
          title: 'Exit: retrieval and preparation',
          purpose: 'Retrieval of the statement form; set the pre-work for Session 2.',
          minutes: 5,
          layout: 'two-column',
          body: [
            { kind: 'callout', tone: 'key', title: 'One-minute paper', text: 'Rewrite as condition–if–then: “The new app might be late.”' },
          ],
          aside: [
            {
              kind: 'bullets',
              items: ['Each member: two technologies your enterprise depends on, a first TRL and its basis', 'One decision your team will soon face', 'Read the trade-study pages listed on the week page'],
            },
          ],
          sources: [],
          notes: {
            teach: [
              'Run the one-minute paper. Collect a few and read two aloud without names. A good answer names a condition known today, for example a supplier that has missed two earlier milestones; an uncertain event, delivery after the integration start; and a consequence, the integration test slips and the launch date with it. A weak answer repeats the worry or writes a mitigation.',
              'Set the pre-work, about twenty minutes per student: each member lists two technologies the team’s enterprise depends on, with a first TRL and its basis, evidence or assumption; and one decision the team will soon face. Bring both to Session 2; the team will choose its trade-study decision from them in class.',
            ],
            why: 'Retrieval at the end of a session consolidates the statement form, and the pre-work lets Session 2’s lab launch start from each member’s own thinking rather than a blank page.',
            transition: 'Session 2 opens with three retrieval cards and then the trade study.',
            timing: '5 min: 2 min paper, 1 min read two, 2 min pre-work and questions.',
          },
        },
        {
          id: 'w3s1-references',
          title: 'References and credits',
          purpose: 'The generated list of every source cited in this session, with license credits.',
          minutes: 0,
          layout: 'references',
          body: [],
          sources: [],
          notes: {
            teach: ['Point students to the full references; every slide footer cites a register entry and page.'],
            why: 'Every claim in the session is traceable to a verified source page.',
            transition: 'End of Session 1.',
            timing: '0 min (reference slide).',
          },
        },
      ],
    },
  ],
  studentLesson: [
    {
      id: 'w3-lesson-why',
      title: 'Why this week: making uncertainty explicit',
      sources: [R('R17', '481'), R('R17', '485'), R('R39s', '1668')],
      blocks: [
        { kind: 'para', text: 'Your Week 2 package ended with requirements that contain numbers nobody has measured, values marked TBD or TBR, and assumptions that nobody has yet confirmed. That is normal at this stage. This week teaches three instruments that turn those gaps into something a team can manage: a **technology readiness assessment** says how much has been demonstrated for the technologies your requirements depend on; a **risk register** says what could go wrong, how likely and how bad it would be, and who acts; **technical performance measures** watch the riskiest numbers converge over time. Session 2 then uses all three in a **trade study**, the method systems engineers use most often to make a decision among alternatives.' },
        { kind: 'para', text: 'SEBoK records two accepted meanings of risk: the effect of uncertainty on objectives, where effects may be negative or positive, and the combination of the probability of harm and its severity. The first is tied to objectives and is the usual meaning for program risk; the second is tied to harm and is the one safety and security work rely on (R17 p.481). Uncertainty itself is the result of not having accurate or sufficient knowledge of a situation (R39s p.1668).' },
        { kind: 'figure', slide: 'w3s1-three-processes' },
        { kind: 'para', text: 'The three instruments belong to processes that feed each other. SEBoK notes that measurement provides indicators for risk analysis, and that decision management evaluates alternatives for selecting and treating risks (R17 p.485). Keep that loop in mind: a readiness level is only interesting because immaturity creates risk; a risk is only manageable if something observable warns you; and a decision is only defensible if it weighed the risks of each alternative.' },
        { kind: 'heading', text: 'Five kinds of register entry' },
        { kind: 'para', text: 'Before rating anything, sort it. A **risk** has a probability greater than zero and less than one, a consequence greater than zero, and lies in the future (R39q p.1610). An **issue** has occurred or is certain to occur, probability one; issue management works on the consequence, because the likelihood question is settled (R46 p.127). An **opportunity** is a possible outcome better than expected (R39r p.1582). Two further kinds are about knowledge rather than events, and their definitions are the course’s: an **assumption** is taken as true for planning and must be validated by a named action; an **unknown** is information not yet available, which in a requirement appears as a TBD or TBR that must be tracked (R13 p.565).' },
        { kind: 'figure', slide: 'w3s1-five-kinds' },
        { kind: 'para', text: 'The course keeps assumptions, risks, opportunities and unknowns in one register and issues in a separate log. The probability test settles most arguments: if it has already happened, it is an issue, whatever its size; if it is a statement you are relying on, it is an assumption; if it is a value you do not have, it is an unknown.' },
      ],
    },
    {
      id: 'w3-lesson-readiness',
      title: 'Technology readiness: what the number says and what it hides',
      sources: [R('R16', '766'), R('R16', '767'), R('R16', '768'), R('R44', '112'), R('R60', '524'), R('R60', '525'), R('R60', '526')],
      blocks: [
        { kind: 'para', text: 'A technology readiness assessment exists to support decisions. SEBoK describes readiness assessments as tools that qualify technology development and help make investment decisions so that technology reaches the end user in a timely way, and technology readiness levels (TRLs) as a metric summarizing the degree of maturity of a technology on NASA’s nine-level scale (R16 p.766). The DoD guidebook adds that the assessment is systematic and metrics-based, covers the maturity of and the risk associated with the **critical** technologies, and is done with an independent team of experts (R44 p.112). Two words carry the method: assess only the technologies a requirement depends on, and treat maturity as a source of risk.' },
        { kind: 'figure', slide: 'w3s1-tra-purpose' },
        { kind: 'table', header: ['TRL', 'SEBoK Table 1 wording (Mankins 1995)'], rows: TRL_SCALE.map((t) => [String(t.level), t.text]), caption: 'The nine technology readiness levels (R16 p.767).' },
        { kind: 'para', text: 'Read the middle of the scale word by word. Two things change from level 4 to level 7: **what** was shown, a component or a prototype, and **where**, a laboratory, a relevant environment or the operational environment. Arguments about a TRL are almost always arguments about the environment words.' },
        { kind: 'heading', text: 'The documented limits of TRLs' },
        { kind: 'para', text: 'SEBoK is explicit about what the scale leaves out. TRLs do not assess the programmatic influence on a TRL, technology criticality and priority, or software aging, and they do not say whether a technology can be produced affordably, which is why manufacturing readiness levels were added (R16 p.767). Integration readiness levels address interface maturity, and system readiness levels combine the individual TRLs with their integration points (R16 p.768). SEBoK also warns that the TRL of an off-the-shelf product changes dramatically when it is used beyond its design limits, for example at extreme temperatures or under heavy vibration (R16 p.768).' },
        { kind: 'figure', slide: 'w3s1-trl-scale' },
        { kind: 'para', text: 'MITRE adds the judgment a graduate engineer needs. Hype can draw significant funding to technologies that do not suit the intended system, so evaluate maturity objectively before committing (R60 pp.524–525). Technology matures along an s-curve, new, improving, mature and aging, and TRL is the most widely accepted way to assess its rising slope; terms such as “relevant environment” must be interpreted for the system under development and agreed among users, program office and developer; and the scale does not address how well the technology fits the architecture that absorbs it (R60 p.525). DoD programs do not count a threshold capability met with immature technology, below TRL 6, as threshold (R60 p.526).' },
        { kind: 'callout', tone: 'key', title: 'Course rule', text: 'Every TRL cites evidence (a test report, a demonstration record) or is recorded as an assumption with an owner and a validation action. A labeled, owned assumption is the expected answer when evidence is missing; a bare number is graded as missing.' },
        { kind: 'heading', text: 'Worked example: AeroLink’s enabling technologies' },
        { kind: 'para', text: `AeroLink (fictional) depends on three enabling technologies. ${t1.name}: TRL ${t1.trl}, “prototype demonstration in a relevant environment”, on assumption ${t1.basis.ref}: ${t1.basis.text} ${t2.name}: TRL ${t2.trl}, on assumption ${t2.basis.ref}: ${t2.basis.text} ${t3.name}: TRL ${t3.trl}, on assumption ${t3.basis.ref}: laboratory validation only.` },
        { kind: 'figure', slide: 'w3s1-worked-trl' },
        { kind: 'para', text: `The engineering is in the criticality judgment. Ask which requirement breaks if the technology underperforms. ${t1.criticalWhy} ${t2.criticalWhy} ${t3.name}: ${t3.criticalWhy} The **lowest critical TRL** is therefore ${low.name.toLowerCase()} at ${low.trl}; it sits below the TRL 6 line and carries a maturity risk, capacity fade, written in full in the next section. Detect-and-avoid is lower still, but the baseline does not depend on it, so its risk is accepted rather than treated.` },
        { kind: 'para', text: `Finally, say what each number hides. ${t1.trlLimit} ${t2.trlLimit}` },
      ],
    },
    {
      id: 'w3-lesson-risk-writing',
      title: 'The risk process and the risk statement',
      sources: [R('R17', '482'), R('R17', '483'), R('R46', '124'), R('R46', '125'), R('R61a', '630'), R('R61a', '631'), R('R61a', '633')],
      blocks: [
        { kind: 'para', text: 'SEBoK lists the systems-engineering risk process as planning, identification, analysis, treatment and monitoring (R17 p.482). The DoD guidebook names the same five activities and gives the question each answers: what is our process; what can go wrong; how likely and how severe; should the risk be accepted, avoided, transferred or controlled; and how has the risk changed. Its products include likelihood and consequence criteria, if–then risk statements, a risk register, a burn-down plan and register updates (R46 pp.124–125). The words treatment, mitigation and handling are used for the same activity (R46 p.125).' },
        { kind: 'figure', slide: 'w3s1-risk-process' },
        { kind: 'para', text: 'A risk statement must be structured. SEBoK recommends an if–then format, or a condition that leads to a potential consequence, because structure helps the analyst think through the nature of the risk (R17 p.483). The DoD guidebook asks for the potential event, its consequences and, if known, a contributing cause (R46 p.125). The course uses MITRE’s **condition–if–then** construct, which combines both. The *condition* is what is known today: the root cause, something that has occurred or is certain. The *if* is the risk event, the only probabilistic part. The *then* is the consequence or set of consequences if the event occurs (R61a pp.630–631).' },
        { kind: 'figure', slide: 'w3s1-risk-statement' },
        { kind: 'callout', tone: 'caution', title: 'The commonest defect', text: 'Do not put the mitigation into the risk statement (R61a p.633). “If we do not install suppression, then a fire will spread” names a treatment, not an uncertainty. Write the uncertain event, “if a cell enters thermal runaway”, and put suppression under treatment.' },
      ],
    },
    {
      id: 'w3-lesson-risk-rating',
      title: 'Rating risks, the limits of the matrix, and handling',
      sources: [R('R17', '483'), R('R17', '484'), R('R17', '485'), R('R17', '486'), R('R46', '125'), R('R46', '126'), R('R61b', '635'), R('R61b', '637'), R('R61c', '642'), R('R61c', '644')],
      blocks: [
        { kind: 'para', text: 'Risk analysis estimates the likelihood and consequence of each risk and converts them into a level; SEBoK says there is no single best approach, and that scales with a matrix, simulations and probabilistic assessments are all used for technical risks (R17 p.483). The DoD guidebook asks that consequence be measured as a deviation against the program’s performance, schedule or cost baseline, tailored to the program, and that approved risks go into a register and a reporting matrix (R46 p.125). MITRE notes that probability is often assessed subjectively and asks you to document the rationale for every rating (R61b pp.635, 637).' },
        { kind: 'table', header: ['Likelihood level', 'Probability band'], rows: LIKELIHOOD.map((l) => [`${l.level} ${l.label}`, l.band]), caption: 'Likelihood levels of the DoD reporting-matrix example, Figure 4-9 (R46 p.126). The consequence anchors are a course adaptation, in the lab brief.' },
        { kind: 'figure', slide: 'w3s1-rating' },
        { kind: 'heading', text: 'Ordinal scales are not numbers' },
        { kind: 'para', text: `Many registers multiply likelihood by consequence and sort by the product. The levels are ordinal: they are ranks, and the step from 4 to 5 (a missed requirement to injury) is not the same size as the step from 2 to 3. Two consequences follow. First, equal products hide different cells: 1 × 5 and 5 × 1 are both 5, but the reporting matrix shades the first ${ORDINAL_DEMO.sameProduct[0].level.toLowerCase()} and the second ${ORDINAL_DEMO.sameProduct[1].level.toLowerCase()}. Second, products can reverse an order that matters: AeroLink’s battery-fade risk at 3 × 4 = ${ORDINAL_DEMO.r002.product} would outrank thermal runaway at 2 × 5 = ${ORDINAL_DEMO.r008.product}, although both are in the same matrix level and only one can injure people.` },
        { kind: 'figure', slide: 'w3s1-matrix-limits' },
        { kind: 'para', text: `The course therefore ranks risks by cell level, then by the higher consequence, then by the higher likelihood. This is consistent with SEBoK, which prioritizes by level and by the pair of maximum probability and maximum consequence (R17 p.483; reading it as a pair rather than a product is the instructor’s gloss), and asks engineers to understand the limitations of risk analysis tools and challenge the results (R17 p.486). Calculation is legitimate when the consequence is measured in real units: MITRE distinguishes qualitative matrices from quantitative techniques that weight cardinal assessments (R61b pp.636–637). For AeroLink’s weather-limits risk, if holds rose from 5 % to 8 % of operating hours, the service would lose 300 × 0.03 = ${R004_EXPECTED.lost} trips a day; at likelihood level 3 (${L3.band}) the expected loss is ${R004_EXPECTED.expectedLo} to ${R004_EXPECTED.expectedHi} trips a day. No source in the collection argues the ordinal-arithmetic point directly; the reasoning above is the instructor’s.` },
        { kind: 'heading', text: 'Handling options' },
        { kind: 'para', text: 'SEBoK names four treatment options, assumption (acceptance), avoidance, control (mitigation) and transfer, and says all four should be evaluated and the best chosen for each risk; hybrid and contingent strategies are possible, and buying information through prototypes or models can clarify a hard choice (R17 p.484). The DoD guidebook lists accept and monitor, avoid, transfer and control, with examples such as risk-reduction prototyping, deferring capability to a later increment and off-ramps to mature technology (R46 p.126). MITRE defines transfer as reassigning accountability to another stakeholder willing to accept the risk, adds watch, and warns that transfer creates dependencies and loss of control (R61c pp.642, 644). The pitfall to avoid is automatic mitigation selection (R17 p.485).' },
        { kind: 'figure', slide: 'w3s1-handling' },
      ],
    },
    {
      id: 'w3-lesson-security-resilience',
      title: 'Security and resilience risks',
      sources: [R('R24', '1203'), R('R24', '1204'), R('R24', '1206'), R('R24', '1208'), R('R24', '1209'), R('R25', '1229'), R('R25', '1231'), R('R25', '1232'), R('R39q', '1610')],
      blocks: [
        { kind: 'para', text: 'Security and resilience risks are written, rated and handled like any other, but two ideas change how you look for them. SEBoK defines resilience as the ability to provide required capability when facing adversity (R24 p.1203). An adversity is any condition that could degrade delivered capability, from inside the system or its environment, expected or unexpected, malicious or accidental; the three fundamental objectives of resilience are to **avoid**, **withstand** and **recover** from adversity (R24 p.1204). SEBoK asks that risk management be planned to handle the risks resilience work identifies (R24 p.1208), and lists common resilience metrics such as the duration of failure and of recovery and performance before and after a disruption (R24 p.1209).' },
        { kind: 'para', text: 'Security, in SEBoK, is freedom from the conditions that may lead to loss of assets with undesired consequences; systems security means intended and authorized behavior despite adversity (R25 p.1229). The assets include system capability, data and information, infrastructure and people (R25 p.1231, Table 1), and adversity includes attacks, hazards and internal faults such as missing requirements (R25 p.1231). Stakeholders care about the effects of loss rather than the adversity itself, so needs and requirements can be expressed in terms of loss (R25 p.1232). For attacks and disasters, the SEBoK glossary gives a second definition of risk built from threat, vulnerability and consequence (R39q p.1610).' },
        { kind: 'figure', slide: 'w3s1-security-resilience' },
        { kind: 'para', text: `AeroLink’s register gains three such risks this week (proposed values). ${r09.name}: ${riskStatement(r09)} ${r10.name}: ${riskStatement(r10)} ${r11.name}: ${riskStatement(r11)}` },
        { kind: 'para', text: `The charger risk shows the method end to end. Rated ${r10.likelihood} × ${r10.consequence} (${riskLevel(r10).toLowerCase()}): ${r10.likelihoodWhy} ${r10.consequenceWhy} Avoidance would remove remote configuration the operation needs, transfer would not remove the hazard on the pad, and acceptance is not defensible for a safety consequence; so the risk is controlled: ${r10.treatment} The local interlock applies defense in depth: SEBoK lists coordinated defense among the resilience techniques, for example through a defense-in-depth strategy (R24 p.1206). Notice also the grid outage: the matrix puts it in a Low cell, at ${r11.likelihood} × ${r11.consequence}, yet the resilience question, how long until the service recovers, is still worth a contingency plan.` },
        { kind: 'figure', slide: 'w3s1-worked-risk' },
        { kind: 'para', text: `A contrasting case is the weather-limits risk, handled by transfer: ${r04.treatment} Transfer changes who pays, not what passengers experience: the consequence rating stays at ${r04.consequence}, and the residual operational risk is why a contingent study is attached to the trigger.` },
      ],
    },
    {
      id: 'w3-lesson-monitoring',
      title: 'Monitoring and the register as part of the package',
      sources: [R('R17', '484'), R('R17', '485'), R('R17', '486'), R('R46', '127'), R('R13', '565')],
      blocks: [
        { kind: 'para', text: 'Risk monitoring evaluates whether the treatment works, against established metrics; SEBoK lists earned value, program metrics and technical performance measures among the approaches (R17 p.484), and the DoD guidebook asks programs to track mitigation against burn-down plans and through associated TPMs (R46 p.127). SEBoK’s pitfalls describe how monitoring fails: risk management done only for reviews; automatic mitigation; the **sea of green**, where every task of the treatment plan reports on track while the risk itself is unchanged; and band-aid treatment that patches instances instead of the root cause (R17 pp.485–486). Its good practices answer them: challenge analysis results, prefer treatments that reduce both probability and consequence, compare actual with anticipated outcomes, and update the register regularly and after major changes (R17 p.486).' },
        { kind: 'figure', slide: 'w3s1-monitoring-pitfalls' },
        { kind: 'para', text: `The register is part of the engineering package, not a separate list. Every AeroLink entry names the requirements, capabilities or scenarios it affects, and every TBD or TBR from Week 2 is linked to an unknown with an owner, as SEBoK’s tracking of TBDs requires (R13 p.565). The register holds eight assumptions, ${nRisks} risks, ${OPPORTUNITIES.length} opportunities and ${UNKNOWNS.length} unknowns; the one issue, the need the Week 2 audit found without a requirement, sat in a separate log because it was certain; this week closes it with two new requirements, one obligation each (notice, and a way onward), the unknown notice time an owned TBD. Four Week 2 unknowns were due at this week’s trade and none closed; a living register re-dates each with a reason rather than leaving it stale, as the worked examples page shows.` },
        { kind: 'figure', slide: 'w3s1-register-linked' },
      ],
    },
    {
      id: 'w3-lesson-tpm',
      title: 'Technical performance measures: estimate, contingency, worst case, margin',
      sources: [R('R15', '532'), R('R44', '113'), R('R44', '116'), R('R44', '117'), R('R44', '114')],
      blocks: [
        { kind: 'para', text: 'Technical measurement includes measures of effectiveness, measures of performance and technical performance measures (R15 p.532). A TPM is collected over time to see trends and forecast progress to plan; early on it is estimated from assumptions, modeling and simulation, and demonstrated data replace the estimates later; TPMs provide leading indicators of performance deficiencies or system risk (R44 p.113). A good TPM is quantifiable with defined criteria, collected at routine intervals, has a planned profile with at least a planned value at each review, and is strongly relevant to a program risk or decision (R44 p.116). The DoD’s list of core TPM categories includes cybersecurity and program protection alongside system performance (R44 p.114), a reminder that security can be tracked too.' },
        { kind: 'figure', slide: 'w3s1-tpm-hierarchy' },
        { kind: 'para', text: 'Four quantities must be kept apart (R44 p.117). The **current best estimate** (CBE) is today’s value. **Contingency** is an allowance for uncertainty such as measurement error and the immaturity of the item; it typically decreases as the design and measurements mature. The **worst-case estimate** (WCE) is the CBE adjusted by the contingency. **Margin** is the growth that can still be accommodated within the threshold: threshold minus WCE. Margin is trade space; contingency is not.' },
        { kind: 'equation', display: 'WCE = CBE + contingency      margin = threshold − WCE', speech: 'Worst-case estimate equals current best estimate plus contingency. Margin equals threshold minus worst-case estimate.', where: [{ symbol: 'lower-is-better', meaning: 'as written' }, { symbol: 'higher-is-better', meaning: 'WCE = CBE − contingency; margin = WCE − threshold (course sign convention)' }] },
        { kind: 'figure', slide: 'w3s1-tpm-margin' },
        { kind: 'heading', text: 'Worked example: AeroLink’s TPMs' },
        { kind: 'table', header: ['TPM', 'Threshold', 'Objective', 'CBE', 'Contingency', 'WCE', 'Margin'], rows: TPMS.map((t) => [`${t.name} (${t.unit})`, String(t.threshold), String(t.objective), String(t.cbe), f1(t.contingency), String(wceOf(t)), f1(marginOf(t))]), caption: 'Margins computed against the worst case. Contingency values are proposed for the instructor to confirm. (FICTIONAL)' },
        { kind: 'para', text: `The instructor reference recorded margins of ${referenceMarginOf(p1)}, ${referenceMarginOf(p2)} and ${referenceMarginOf(p3)}, computed from the current estimate, which treats contingency as zero. With contingency the noise margin shrinks from ${referenceMarginOf(p2)} to ${f1(marginOf(p2))} dBA because ${p2.contingencyWhy.toLowerCase()} The planned profile of the landing-energy TPM holds the estimate at ${p3.cbe} % while contingency falls from ${f1(prof3[0].contingency)} to ${f1(prof3[4].contingency)} points across five reviews, so the planned worst case rises from ${f1(prof3[0].wce)} to ${f1(prof3[4].wce)} %.` },
        { kind: 'figure', slide: 'w3s1-worked-tpm' },
        { kind: 'para', text: 'Not every numeric requirement needs a TPM. The corrected noise need also limits the number of evening and early-morning events. That cap is not a design parameter that matures with development; the scheduling function enforces it and an operational measure tracks it in service. The case therefore carries the cap in its noise objective and measure, and keeps the aircraft TPM on the level of each event.' },
      ],
    },
    {
      id: 'w3-lesson-chain',
      title: 'One chain through all three instruments',
      sources: [R('R44', '113'), R('R18', '464'), R('R24', '1208')],
      blocks: [
        { kind: 'para', text: `The instruments connect. Battery cells at TRL ${t2.trl} rest on an assumption; their maturity risk is capacity fade, rated 3 × 4 and mitigated; the landing-energy TPM watches it with a margin of ${f1(marginOf(p3))} points and a trigger at 1 point; the TPM measures the requirement for a planned landing reserve of at least 20 %; and that requirement serves the need for assurance of flight within safety limits.` },
        { kind: 'figure', slide: 'w3s1-chain' },
        { kind: 'para', text: `Suppose cycle tests at month 6 show 12 % fade instead of the assumed 10 % (a hypothetical value). The design trip uses a fixed energy, 0.9 × 0.77 = 0.693 of the starting usable energy, so the reserve becomes (0.88 − 0.693) ÷ 0.88 ≈ ${f2(MONTH6.cbe)} %. With 1 point of contingency the worst case is ${f2(MONTH6.wce)} % and the margin ${f2(MONTH6.margin)} points, below the trigger: the TPM, a leading indicator (R44 p.113), fires the risk’s trigger, the likelihood rises and the treatment starts. At 15 % fade the reserve would be about ${f1(FADE15)} %, below the threshold itself, and the requirement would need to change.` },
        { kind: 'para', text: 'Session 2 makes a decision with all of this in view. SEBoK asks that uncertainty be identified and risks assessed for each decision (R18 p.464), and that the evaluation of alternative solutions consider their ability to deliver required capability under adversity (R24 p.1208). Readiness and risk therefore enter a trade study in one of three ways: as a scored criterion, as a must-meet screen applied before scoring, or as a condition on the recommendation.' },
        { kind: 'figure', slide: 'w3s1-handoff' },
      ],
    },
  ],
}
