# How to teach one week of a professional graduate course online: research summary

Date: 2026-10-12. Purpose: choose the instructional framework for the redesigned weekly flow of the SysML Learning
Studio (Systems Thinking + MBSE with SysML v2, AeroLink case). It feeds `learning-studio/docs/redesign/WEEK1_LEARNING_DESIGN.md`.

Evidence marks: **[V]** I read the source or an authoritative page that reproduces it · **[S]** taken from search-result
summaries only, so it must be verified against the primary text before anyone quotes it · **[I]** my inference.
This complies with the project's research-before-engineering rule only up to the [V] items. The [S] items are leads.

---

## 1. Comparison

| # | Framework | Core claim | Evidence base | What it prescribes for one online week | Limits for our case | Mark |
|---|---|---|---|---|---|---|
| 1 | **Gagné, Nine Events of Instruction** (Gagné, Briggs & Wager 1992) | A lesson works when it runs nine events in order: gain attention, state the objectives, recall prior learning, present the content, guide the learning, elicit performance, give feedback, assess performance, and support retention and transfer. | Derived from conditions-of-learning theory. Widely used as a design checklist rather than tested as a package. | Gives the **session sequence**: hook, then "what you will be able to do", then a link to prior knowledge, then content, then guided practice with feedback, then assessment, then transfer. This is the order the faculty owner described. | It is teacher-centred and linear. On its own it says little about *how* to present each item. | [V] NIU summary of Gagné et al. 1992 |
| 2 | **Merrill, First Principles of Instruction** (2002) | Learning is promoted when learners work on real-world problems (problem-centred) and when they pass through four phases: **activation** of prior experience, **demonstration** ("show me", not just tell), **application**, and **integration** into their own work. | A synthesis of instructional-design theories. Merrill calls it a preliminary report. Later correlational studies support it [S]. | Each topic should **show** the idea on the AeroLink problem (demonstration) before the student applies it. The whole week hangs on one authentic problem, the driving question. Integration means the memo and the defence. | Prescribes phases, not timings or media. | [V] Merrill 2002 PDF (text extracted) |
| 3 | **Ausubel, advance organizers** (1960) | New material is learned meaningfully when it is anchored to a higher-level framework introduced first. | Classic experiments. A meta-analysis found small positive effects across ability levels (Luiten, Ames & Ackerson 1980) [S]. | The **course welcome and the week opener** act as organizers: what the subject is, where this week sits on the course map, and a one-screen preview of the week's concept map. | Effects are modest. The organizer must be conceptual, not just a table of contents. | [S] |
| 4 | **Mayer, multimedia learning principles** (Mayer 2009; 2020) | Twelve principles in three groups. **Reduce extraneous processing**: coherence, signalling, redundancy, spatial contiguity, temporal contiguity. **Manage essential processing**: segmenting, pre-training, modality. **Foster generative processing**: multimedia, personalisation, voice, image. | Many controlled experiments. Effects are strongest for novices. | Every Learn section pairs words with **one** explanatory visual (multimedia principle). Labels sit on the figure (spatial contiguity). The figure highlights only the elements in play (signalling). Decorative content is cut (coherence). The section is short and paced by the student (segmenting). Key terms come before the hard sections (pre-training). The tone is conversational ("you"), but still precise (personalisation). | Modality and voice apply only to narrated media. Our lesson is text plus figures, so on-screen text is appropriate. If videos are added later, narrate them rather than putting the text on screen. | [V] Dartmouth summary of Mayer 2009; [S] grouping |
| 5 | **Sweller, cognitive load theory; worked and faded examples; expertise reversal** (Sweller 1988; Sweller, van Merriënboer & Paas 2019; Kalyuga et al. 2003; Renkl & Atkinson 2003) | Working memory is limited. Novices learn more from studying worked examples than from unguided problem solving. Removing steps gradually (fading) eases the transition to independent work. Guidance that helps novices can hinder learners who already have expertise (expertise reversal). | Large experimental literature. | Topics come with a **worked example**, then **faded** practice, then independent work. This is already the mission loop: Worked, then Guided, then Own. Because graduate students vary widely, explanations should be **skippable** (show the check first, with "show explanation" on demand). The advanced detail goes behind "Go deeper". | Most of the evidence comes from well-structured domains. Systems thinking is less well structured [I]. | [S] (citations confirmed; findings from summaries) |
| 6 | **Bloom's revised taxonomy** (Anderson & Krathwohl 2001; Krathwohl 2002) | Objectives cross six cognitive processes (Remember, Understand, Apply, Analyse, Evaluate, Create) with four knowledge types (factual, conceptual, procedural, metacognitive). | A framework, not an empirical theory. The course already uses it (syllabus §3, §5). | State each objective in plain words with its level. Pitch each check at the objective's level, not below it. | Levels are not strictly hierarchical, and the taxonomy describes the type of task, not the quality of an answer. | [S] |
| 7 | **SOLO taxonomy** (Biggs & Collis 1982) | Grades the **quality of an answer**: prestructural, unistructural, multistructural, relational, extended abstract. | Used widely in higher-education assessment. | Complements Bloom. The target for Week 1 graduate answers is **relational**: the student links the loop structure to the behaviour. The memo aims at **extended abstract**: the student transfers the reasoning to a leverage argument with a stated cost assumption. Used to write rubric descriptors and check feedback. | Coarse for multiple-choice questions. Best used for open answers. | [S] |
| 8 | **Backward design** (Wiggins & McTighe 1998) and **constructive alignment** (Biggs) | Design in three stages: (1) desired results, (2) acceptable evidence, (3) learning experiences. Objectives, activities and assessment must align. | Design methodology. Endorsed by Coursera's own design guidance [S]. | Make the alignment table explicit for every week: objective, Learn section, practice mission, assessment item, rubric row. The course already has the parts (objectives B1.x, rubrics RB-1, quiz items tagged by objective). | Says what to align, not how to sequence a session. | [S] |
| 9 | **BOPPPS** (Instructional Skills Workshop, 1980s) | Bridge-in, Objectives, Pre-assessment, Participatory learning, Post-assessment, Summary. | Many recent applied studies, mostly in medical and engineering education in China [S]. Quality varies. | Essentially Gagné compressed for one session. Adds an explicit **pre-assessment**, which here is the locked prediction in the hook, and a closing **summary**. | Built for a 50-minute live class, not a week. | [S] |
| 10 | **BSCS 5E** (Bybee et al. 2006) | Engage, Explore, Explain, Elaborate, Evaluate. Exploration comes before explanation. | Developed in K-12 science. Supporting studies are mostly in schools [S]. | Supports a short **explore-first** hook: predict the result, then run the explorer before the explanation. | Exploring before any explanation conflicts with worked-example evidence for novices [I]. Keep the exploration small (one prediction). | [S] |
| 11 | **Retrieval practice and spacing** (Roediger & Karpicke 2006; Dunlosky et al. 2013) | Being tested on material produces better delayed retention than restudying it. Practice testing and distributed practice are the two techniques rated high-utility. Rereading, highlighting and summarisation are rated low-utility. | Strong experimental and classroom evidence. | One **retrieval check per Learn section** (ungraded, with feedback). A **recall quiz** after practice. **Spaced re-use**: two or three Week 1 items reappear in the Week 2 opener [I]. Do not count rereading as study. | Checks must require retrieval or application, not recognising wording from two lines above. | [S] |
| 12 | **Freeman et al. 2014, active learning** | A meta-analysis of 225 STEM studies. Active learning raised exam performance by about 0.47 SD, and failure rates were 21.8 % under active learning against 33.8 % under lecturing. | Meta-analysis. Strong evidence. | Every section ends with something to do. Practice uses the workbench, not more reading. The live sessions stay concept studio plus lab. | Measured in classroom courses. The effect online is inferred [I]. | [V] PMC full text |
| 13 | **How open textbooks and MOOCs structure units** | **OpenStax**: each module opens with learning objectives, highlights key terms in bold with definitions in context, calls out key concepts, and ends the chapter with review exercises. **Coursera**: tight alignment from objectives to assessments to content, videos of about 6–10 minutes, formative in-video and practice quizzes before graded ones. **edX/Open edX**: course, section, subsection, unit. Guo, Kim & Rubin (2014, 6.9 M sessions) found that shorter videos are much more engaging. Open edX staff warn that piling up introductory units causes bloat. **MIT OCW**: course home, syllabus, calendar, readings, lecture notes, assignments, exams. **Jupyter Book course templates** (e.g. firasm/jupyterbook_course_template): a 13-week stub structure with persistent progress checkboxes. | Practice and design guidance. Guo et al. is empirical. | The convergent pattern is **objectives first → short segments with key terms → formative check per segment → practice → graded assessment → summary or review**. The introductory material should be short (one welcome screen, not five). | Platform conventions, not learning theory. | [S]; Guo et al. [S] |

### What the frameworks agree on [I]

Strip away the vocabulary and nine of the thirteen sources prescribe the same arc:
1. orient the learner;
2. state the outcomes;
3. connect to what they know;
4. demonstrate on a real problem with a visual;
5. practise with feedback, fading support;
6. assess against the stated outcomes;
7. summarise and bridge.

The frameworks differ in only three places:
- **Explore before explain** (5E) versus **explain before practise** (cognitive load theory, Merrill's demonstration). The resolution: a *small* prediction first, then explanation.
- **Bloom** classifies tasks; **SOLO** grades answers. Use both.
- **Lesson sequence** (Gagné, Merrill, BOPPPS) versus **course alignment** (backward design). These work at different levels and do not conflict.

---

## 2. Chosen framework

**Primary: backward design for alignment, Gagné's nine events as the weekly sequence, Merrill's demonstrate-then-apply cycle inside each topic, and Mayer's principles for every visual section. Retrieval practice and faded worked examples come from cognitive load theory.**

Justification (186 words). Backward design comes first because the course already has measurable objectives (B1.1–B1.4), rubrics (RB-1) and objective-tagged quiz items. What is missing is *visible* alignment, so a table per week makes every section accountable to an objective and an assessment. Gagné supplies the order the faculty owner asked for: introduction, what you will learn, what you will be able to do, content, practice, assessment, transfer. It is also the order students know from textbooks and lectures (OpenStax, Coursera). Merrill fixes Gagné's weakest point, "present the content". Each topic must **demonstrate** the idea on the AeroLink problem before asking students to apply it, and the whole week is anchored on one authentic problem. Mayer governs each section's single visual: labels on the figure, signalling, coherence and short segments. Cognitive load theory justifies the Worked → Guided → Own missions and requires that explanations be skippable for experienced students (expertise reversal). Retrieval practice (Dunlosky; Roediger & Karpicke) and active learning (Freeman) justify one check per section and a recall quiz. 5E is used only for a one-minute prediction hook.

### Mapping used by the blueprint

| Week section | Gagné event | Merrill | BOPPPS | Mayer / CLT |
|---|---|---|---|---|
| 0 Course welcome (once) | (organizer) | problem-centred: the AeroLink enterprise | — | advance organizer, pre-training of terms |
| 1 Week opener: hook, outcomes, assessment, time | 1 attention, 2 objectives, 3 recall | activation | Bridge-in, Objectives, Pre-assessment (prediction) | signalling |
| 2 Learn sections L1–L7 | 4 present, 5 guide | demonstration | Participatory (individual) | segmenting, multimedia, spatial contiguity, coherence; worked example |
| 2 check per section | 6 elicit, 7 feedback | application (low stakes) | — | retrieval practice |
| 3 Summary (concept map) | 9 retention | integration | Summary | signalling |
| 4 Practice (missions m1–m5) | 6, 7 | application with fading support | Participatory (team) | faded worked examples |
| 5 Assessment (Q1, L1, memo) | 8 assess | integration | Post-assessment | — |
| 6 Bridge to Week 2 | 9 transfer | integration | — | spacing |

---

## 3. References

1. Gagné, R. M., Briggs, L. J., & Wager, W. W. (1992). *Principles of Instructional Design* (4th ed.). Harcourt Brace Jovanovich. Summary read: https://www.niu.edu/citl/resources/guides/instructional-guide/gagnes-nine-events-of-instruction.shtml [V]
2. Merrill, M. D. (2002). First principles of instruction. *Educational Technology Research and Development*, 50(3), 43–59. https://mdavidmerrill.wordpress.com/wp-content/uploads/2019/04/firstprinciplesbymerrill.pdf [V]
3. Ausubel, D. P. (1960). The use of advance organizers in the learning and retention of meaningful verbal material. *Journal of Educational Psychology*, 51, 267–272. Luiten, J., Ames, W., & Ackerson, G. (1980). A meta-analysis of the effects of advance organizers on learning and retention. *American Educational Research Journal*, 17, 211–218. Lead: https://www.instructionaldesign.org/theories/subsumption-theory/ [S]
4. Mayer, R. E. (2009). *Multimedia Learning* (2nd ed.). Cambridge University Press. Summary read: https://services.dartmouth.edu/TDClient/1806/Portal/KB/PrintArticle?ID=171655 [V]. Mayer (2020) principles handout: https://ugc.futurelearn.com/uploads/files/7d/d6/7dd6188d-c343-4311-b064-ac98d2c95abc/Multimedia_Principles._R._E._Mayer__2020.pdf [S]
5. Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science*, 12(2), 257–285. https://doi.org/10.1207/s15516709cog1202_4 [S]
6. Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review*, 31, 261–292. https://research.utwente.nl/en/publications/cognitive-architecture-and-instructional-design/ [S]
7. Kalyuga, S., Ayres, P., Chandler, P., & Sweller, J. (2003). The expertise reversal effect. *Educational Psychologist*, 38(1), 23–31. https://ro.uow.edu.au/edupapers/136 [S]
8. Renkl, A., & Atkinson, R. K. (2003). Structuring the transition from example study to problem solving in cognitive skill acquisition: A cognitive load perspective. *Educational Psychologist*, 38(1), 15–22. https://asu.elsevierpure.com/en/publications/structuring-the-transition-from-example-study-to-problem-solving--2 [S]
9. Anderson, L. W., & Krathwohl, D. R. (Eds.) (2001). *A Taxonomy for Learning, Teaching, and Assessing*. Longman. Krathwohl, D. R. (2002). A revision of Bloom's taxonomy: An overview. *Theory into Practice*, 41(4), 212–218. https://my.chartered.college/impact_article/revising-opinions-about-blooms-taxonomy/ [S]
10. Biggs, J., & Collis, K. (1982). *Evaluating the Quality of Learning: The SOLO Taxonomy*. Academic Press. Biggs, J. (1996). Enhancing teaching through constructive alignment. *Higher Education*, 32, 347–364. Lead: https://teaching.unsw.edu.au/node/145 [S]
11. Wiggins, G., & McTighe, J. (1998/2005). *Understanding by Design*. ASCD. https://cft.vanderbilt.edu/?p=984 [S]
12. BOPPPS (Instructional Skills Workshop). https://teaching.cambriancollege.ca/?p=25401 ; review: https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2024.1319711/full [S]
13. Bybee, R. W., Taylor, J. A., Gardner, A., Van Scotter, P., Powell, J. C., Westbrook, A., & Landes, N. (2006). *The BSCS 5E Instructional Model: Origins and Effectiveness*. BSCS. https://www.azed.gov/sites/default/files/media/BSCS_5E_Full_Report.pdf [S]
14. Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science*, 17(3), 249–255. https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf [S]
15. Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest*, 14(1), 4–58. https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html [S]
16. Freeman, S., et al. (2014). Active learning increases student performance in science, engineering, and mathematics. *PNAS*, 111(23), 8410–8415. https://pmc.ncbi.nlm.nih.gov/articles/PMC4060654/ [V]
17. Guo, P. J., Kim, J., & Rubin, R. (2014). How video production affects student engagement: An empirical study of MOOC videos. *Proc. ACM Learning@Scale*. https://up.csail.mit.edu/other-pubs/las2014-pguo-engagement.pdf [S]
18. OpenStax preface (module structure, learning objectives, key terms, call-outs). https://openstax.org/books/college-physics/pages/preface [S]
19. Coursera-style alignment and video length guidance (secondary source). https://uen.pressbooks.pub/foundationsofcoursedesign/?p=88 [S]
20. Open edX course structure and best-practice notes. https://openedx.atlassian.net/wiki/spaces/OEPM/pages/3911876614/Open+edX+Structure+Scheduling [S]
21. MIT OpenCourseWare course components. https://support.learn.mit.edu/hc/en-us/articles/41412262103451-What-is-MIT-OpenCourseWare-OCW [S]
22. Jupyter Book course template. https://github.com/firasm/jupyterbook_course_template [S]

**Verification debt.** Before this research is cited in a faculty-facing document, the [S] items need their primary text read. The priorities are refs 7, 8, 14 and 15, because the blueprint's skippable explanations and per-section checks rest on them.
