# Reading register for the curriculum documents.
# (id, source, extracted-text file, first PDF page, last PDF page, title text expected on the first page, level)
# Revision 1 (review M1): SEBoK entries are article BODY pages only (reference lists excluded; start may precede
# the running header); multi-article readings split into a/b/c; weak title tokens strengthened.
# level: E = essential (all students), X = extension (optional / graduate), I = instructor reference
SE = 'Guide_to_the_Systems_Engineering_Body_of_Knowledge_v2_14.txt'
DOD = 'Systems_Engineering_Guidebook.txt'
MIT = 'se_guide_book_interactive.txt'
S10 = 'Intro_to_the_SysML_v2_Language_Textual_Notation.txt'
S06 = '2a_OMG_Systems_Modeling_Language.txt'
S09 = 'Intro_to_the_SysML_v2_Language_Graphical_Notation.txt'
S05 = '1_Kernel_Modeling_Language.txt'
S08 = '3_Systems_Modeling_API_and_Services.txt'
S07 = '2b_SysML_v1_to_v2_Transformation.txt'

R = [
    ('R01', 'S11', SE, 51, 54, 'Systems Engineering Overview', 'E'),
    ('R02', 'S11', SE, 264, 266, 'What is Systems Thinking?', 'E'),
    ('R03', 'S11', SE, 268, 272, 'Concepts of Systems Thinking', 'E'),
    ('R04', 'S11', SE, 273, 276, 'Principles of Systems Thinking', 'E'),
    ('R05', 'S11', SE, 279, 285, 'Patterns of Systems Thinking', 'X'),
    ('R06a', 'S11', SE, 380, 382, 'Life Cycle Models', 'E'),
    ('R06b', 'S11', SE, 384, 385, 'Life Cycle Stages', 'E'),
    ('R06c', 'S11', SE, 386, 388, 'Technical Reviews and Audits', 'E'),
    ('R07', 'S11', SE, 814, 818, 'Enterprise Systems Engineering', 'E'),
    ('R08', 'S11', SE, 829, 834, 'The Enterprise as a System', 'X'),
    ('R09', 'S11', SE, 866, 872, 'Systems of Systems (SoS)', 'E'),
    ('R10', 'S11', SE, 543, 547, 'Business or Mission Analysis', 'E'),
    ('R11', 'S11', SE, 549, 556, 'Stakeholder Needs Definition', 'E'),
    ('R12', 'S11', SE, 860, 863, 'Enterprise Capability Management', 'X'),
    ('R13', 'S11', SE, 557, 567, 'System Requirements Definition', 'E'),
    ('R14', 'S11', SE, 476, 480, 'Requirements Management', 'X'),
    ('R15', 'S11', SE, 528, 536, 'Measurement', 'E'),
    ('R16', 'S11', SE, 766, 770, 'Product Systems Engineering Special Activities', 'E'),
    ('R17', 'S11', SE, 481, 486, 'Risk Management', 'E'),
    ('R18', 'S11', SE, 463, 474, 'Decision Management', 'E'),
    ('R19', 'S11', SE, 569, 577, 'System Architecture Design Definition', 'E'),
    ('R20a', 'S11', SE, 580, 584, 'Functional Architecture', 'X'),
    ('R20b', 'S11', SE, 587, 594, 'Logical Architecture', 'E'),
    ('R20c', 'S11', SE, 596, 603, 'Physical Architecture', 'E'),
    ('R21', 'S11', SE, 510, 520, 'Information Management', 'E'),
    ('R22', 'S11', SE, 624, 632, 'System Integration', 'E'),
    ('R23a', 'S11', SE, 634, 640, 'System Verification', 'E'),
    ('R23b', 'S11', SE, 646, 655, 'System Validation', 'X'),
    ('R24', 'S11', SE, 1203, 1212, 'System Resilience', 'E'),
    ('R25', 'S11', SE, 1229, 1235, 'System Security', 'X'),
    ('R26', 'S11', SE, 681, 684, 'Capability Updates, Upgrades, and Modernization', 'E'),
    ('R27', 'S11', SE, 55, 59, 'Fundamentals for Digital Engineering', 'E'),
    ('R28', 'S11', SE, 370, 374, 'Model-Based Systems Engineering (MBSE)', 'E'),
    ('R29', 'S11', SE, 1383, 1384, 'Transitioning Systems Engineering to a Model-based Discipline', 'X'),
    ('R30', 'S11', SE, 1394, 1395, 'Digital Engineering', 'E'),
    ('R31', 'S11', SE, 1368, 1373, 'Artificial Intelligence', 'E'),
    ('R32', 'S11', SE, 1374, 1378, 'Verification and Validation of Systems in Which AI is a Key Element', 'X'),
    ('R33a', 'S11', SE, 290, 292, 'What is a Model?', 'E'),
    ('R33b', 'S11', SE, 295, 297, 'Why Model?', 'E'),
    ('R33c', 'S11', SE, 298, 302, 'Types of Models', 'E'),
    ('R34', 'S11', SE, 608, 614, 'System Analysis', 'X'),
    ('R35', 'S11', SE, 1396, 1399, 'Set-Based Design', 'X'),
    ('R36', 'S11', SE, 498, 502, 'Configuration Baselines', 'X'),
    ('R37', 'S11', SE, 1166, 1170, 'A Framework for Viewing Quality Attributes from the Lens of Loss', 'X'),
    # Added 2026-10-18 (faculty feedback, Week 1 L1): SEBoK glossary entry giving three definitions of system, incl. ISO/IEC/IEEE 15288:2015.
    ('R38', 'S11', SE, 1637, 1637, 'System (glossary)', 'X'),
    # Added 2026-10-18 (Week 1 rebuild: Team Formation / Needs / Identifying Stakeholders), pending faculty confirmation:
    # SEBoK glossary entries for stakeholder (four definitions, incl. ISO/IEC/IEEE 15288:2015; p.1632 continues with
    # 'Stakeholder Needs and Requirements', the ISO/IEC/IEEE 15288:2023 statement of stakeholder needs) and system-of-interest.
    ('R39a', 'S11', SE, 1631, 1632, 'Stakeholder (glossary)', 'X'),
    ('R39b', 'S11', SE, 1652, 1652, 'System-of-Interest (glossary)', 'X'),
    # Added 2026-10-19 (Week 1 lecture outline P9a-P9i; WEEK1_CRITICAL_REVIEW.md 7.2), pending faculty confirmation:
    # SEBoK glossary entries. Life Cycle, Operational Concept, Requirement and System Boundary are the SECOND entry on
    # their page (the running header names Leverage, Operational Capability, Reparability and System Assurance); the
    # verifier accepts a '(glossary)' title only as an entry heading line, so these check the entry itself.
    ('R39c', 'S11', SE, 1493, 1493, 'Enabling System (glossary)', 'X'),
    ('R39d', 'S11', SE, 1497, 1497, 'Enterprise (glossary)', 'X'),
    ('R39e', 'S11', SE, 1501, 1501, 'Environment (glossary)', 'X'),
    ('R39f', 'S11', SE, 1550, 1550, 'Life Cycle (glossary)', 'X'),
    ('R39g', 'S11', SE, 1579, 1579, 'Operational Concept (glossary)', 'X'),
    ('R39h', 'S11', SE, 1607, 1607, 'Requirement (glossary)', 'X'),
    ('R39i', 'S11', SE, 1639, 1639, 'System Boundary (glossary)', 'X'),
    ('R39j', 'S11', SE, 1641, 1641, 'System Context (glossary)', 'X'),
    ('R39k', 'S11', SE, 1662, 1662, 'Team (glossary)', 'X'),
    # Added 2026-10-19 (Week 1 lecture review F22), pending faculty confirmation: the System Requirement glossary entry,
    # first entry on p.1652 (the page R39b shares); the lecture cites it for the system-requirement definition.
    ('R39l', 'S11', SE, 1652, 1652, 'System Requirement (glossary)', 'X'),
    ('R40', 'S12', DOD, 69, 72, '3.2 System Requirements Review', 'E'),
    ('R41', 'S12', DOD, 75, 82, '3.4 Preliminary Design Review', 'E'),
    ('R42', 'S12', DOD, 83, 87, '3.5 Critical Design Review', 'X'),
    ('R43', 'S12', DOD, 109, 110, 'Decision Analysis Process', 'E'),
    ('R44', 'S12', DOD, 110, 117, 'Technical Assessment Process', 'E'),
    ('R45', 'S12', DOD, 118, 119, 'Requirements Management Process', 'E'),
    ('R46', 'S12', DOD, 120, 129, 'Risk Management Process', 'E'),
    ('R47', 'S12', DOD, 138, 140, 'Interface Management Process', 'E'),
    # R48 spans three DoD processes: 4.2.1 Stakeholder Requirements Definition (pp.141-142), 4.2.2 Requirements
    # Analysis (pp.142-144) and 4.2.3 Architecture Design (pp.144-147). It is kept unchanged as the umbrella entry
    # because Weeks 4-5 cite pp.141-146 under it (e.g. p.146, derived requirements, is in 4.2.3). R48a and R48b are
    # the split parts (added 2026-10-19, Week 1 lecture outline 'R48 correction'), pending faculty confirmation.
    ('R48', 'S12', DOD, 141, 147, 'Stakeholder Requirements Definition Process', 'E'),
    ('R48a', 'S12', DOD, 141, 142, 'Stakeholder Requirements Definition Process', 'E'),
    ('R48b', 'S12', DOD, 142, 144, 'Requirements Analysis Process', 'E'),
    ('R49', 'S12', DOD, 149, 151, 'Verification Process', 'E'),
    ('R50', 'S13', MIT, 45, 49, 'Systems Thinking', 'E'),
    ('R51', 'S13', MIT, 50, 59, 'Uncertainty and Complexity', 'X'),
    ('R52', 'S13', MIT, 298, 303, 'Concept of Operations', 'E'),
    ('R53', 'S13', MIT, 293, 297, 'Operational Needs Assessment', 'E'),
    ('R54', 'S13', MIT, 328, 332, 'Analyzing and Defining Requirements', 'E'),
    ('R55', 'S13', MIT, 365, 374, 'Develop System-Level Technical Requirements', 'X'),
    ('R56', 'S13', MIT, 384, 391, 'Assess the Design', 'E'),
    ('R57', 'S13', MIT, 410, 415, 'Interface Management', 'E'),
    ('R58', 'S13', MIT, 433, 438, 'Verification and Validation', 'E'),
    ('R59', 'S13', MIT, 452, 458, 'Use Cases and Mission Threads', 'E'),
    ('R60', 'S13', MIT, 523, 531, 'Assessing Technical Maturity', 'E'),
    ('R61', 'S13', MIT, 626, 647, 'Risk Identification', 'E'),
    ('R62', 'S13', MIT, 341, 347, 'Architectural Frameworks, Models, and Views', 'E'),
    ('R63', 'S13', MIT, 234, 238, 'Stakeholder Assessment and Management', 'E'),
    ('R64', 'S13', MIT, 475, 483, 'Verification and Validation of Simulation Models', 'X'),
    # Added 2026-10-19 (Week 1 lecture outline P11), pending faculty confirmation. Reference list starts on p.327.
    ('R65', 'S13', MIT, 318, 326, 'Eliciting, Collecting, and Developing Requirements', 'E'),
    ('R70', 'S10', S10, 1, 17, 'Introduction to the SysML v2 Language', 'E'),
    ('R71', 'S10', S10, 18, 29, 'Connections', 'E'),
    ('R72', 'S10', S10, 30, 47, 'Action Definition', 'E'),
    ('R73', 'S10', S10, 48, 56, 'State Definitions', 'E'),
    ('R74', 'S10', S10, 86, 91, 'Requirement Definitions', 'E'),
    ('R75', 'S10', S10, 92, 99, 'Analysis Case Definitions', 'E'),
    ('R76', 'S10', S10, 100, 107, 'Use Case Definition', 'E'),
    ('R77', 'S10', S10, 108, 119, 'Metadata', 'E'),
    ('R78', 'S10', S10, 145, 162, 'Standard View Definitions', 'E'),  # B uses sl.147, 157-159 as essential; rest extension
    # R78 spans sl.145 (Standard View Definitions) and the domain libraries on sl.146-162; the verified title is the
    # sl.145 heading, the displayed title (DISPLAY_TITLES below) names the whole range (Week 3 review minor 4).
    ('R79', 'S10', S10, 163, 168, 'Quantities and Units', 'E'),
    ('R80', 'S06', S06, 47, 77, '7.1 Language Overview', 'I'),
    ('R81', 'S06', S06, 90, 116, '7.11 Parts', 'I'),
    ('R82', 'S06', S06, 116, 154, '7.17 Actions', 'I'),
    ('R83', 'S06', S06, 161, 169, '7.21 Requirements', 'I'),
    ('R84', 'S06', S06, 170, 177, '7.23 Analysis Cases', 'I'),
    ('R85', 'S06', S06, 181, 188, '7.26 Views and Viewpoints', 'I'),
    ('R86', 'S06', S06, 558, 574, '9.3.3 Risk Metadata', 'I'),
    ('R87', 'S05', S05, 51, 66, '7.3 Core', 'I'),
    ('R88', 'S08', S08, 31, 36, '7.1 API Model', 'X'),
    ('R89', 'S07', S07, 33, 59, '1 Scope', 'I'),
    ('R90', 'S09', S09, 5, 22, 'Systems Modeling Language', 'E'),
    # Added 2026-10-19 (Week 1 lecture outline P1-P8 and P10; WEEK1_CRITICAL_REVIEW.md 7.2), pending faculty
    # confirmation. Narrowed body ranges: R91 is the principles list (article begins p.127); R95 is the IPT passage
    # (article begins p.755); R98 is Table 1, the 15288:2015 technical processes (article begins p.997).
    # R99 is DoD section 2 'Stakeholders' (p.51) and 'Integrated Product Teams' (p.52).
    ('R91', 'S11', SE, 130, 130, 'Systems Engineering Principles', 'X'),
    ('R92', 'S11', SE, 326, 327, 'Engineered System Context', 'E'),
    ('R93', 'S11', SE, 330, 331, 'Identifying and Understanding Problems and Opportunities', 'X'),
    ('R94', 'S11', SE, 540, 541, 'System Concept Definition', 'E'),
    ('R95', 'S11', SE, 761, 761, 'Product Systems Engineering Key Aspects', 'X'),
    ('R96', 'S11', SE, 986, 990, 'Team Capability', 'E'),
    ('R97', 'S11', SE, 994, 995, 'Team Dynamics', 'X'),
    ('R98', 'S11', SE, 1001, 1002, 'Diversity, Equity, and Inclusion', 'E'),
    ('R99', 'S12', DOD, 51, 52, 'Stakeholders', 'E'),
    # Added 2026-10-19 (Week 2 lecture outline, register additions P2-1..P2-4; docs/lectures/week02/WEEK02_LECTURE_OUTLINE.md
    # section 9), PENDING FACULTY CONFIRMATION. SEBoK glossary entries; each is checked as an entry heading line. Concept of
    # Operations is the second entry on p.1469 (running header 'Concept Definition (glossary)'); Capability is the second
    # entry on p.1457 (first entry Call Center) and its discussion (feature, capability, benefit) continues on p.1458.
    ('R39m', 'S11', SE, 1469, 1469, 'Concept of Operations (ConOps) (glossary)', 'X'),
    ('R39n', 'S11', SE, 1581, 1581, 'Operational Scenario (glossary)', 'X'),
    ('R39o', 'S11', SE, 1669, 1669, 'Use Case (glossary)', 'X'),
    ('R39p', 'S11', SE, 1457, 1458, 'Capability (glossary)', 'X'),
    # Added 2026-10-19 (Week 3 lecture outline, register additions P3-1..P3-3 and the R61 split;
    # docs/lectures/week03/WEEK03_LECTURE_OUTLINE.md section 9), PENDING FACULTY CONFIRMATION. Glossary entries are checked as
    # entry heading lines: Risk is the SECOND entry on p.1610 (running header 'Rhumb Line (glossary)'); Opportunity and
    # Uncertainty are entry headings on pp.1582 and 1668. R61 (MITRE pp.626-647) spans three articles, each opening with its
    # own 'Definition:' block; R61 stays as the umbrella entry and R61a/b/c name each article so citations say which.
    ('R39q', 'S11', SE, 1610, 1610, 'Risk (glossary)', 'X'),
    ('R39r', 'S11', SE, 1582, 1582, 'Opportunity (glossary)', 'X'),
    ('R39s', 'S11', SE, 1668, 1668, 'Uncertainty (glossary)', 'X'),
    ('R61a', 'S13', MIT, 626, 633, 'Risk Identification', 'E'),
    ('R61b', 'S13', MIT, 634, 640, 'Risk Impact Assessment and Prioritization', 'X'),
    ('R61c', 'S13', MIT, 641, 647, 'Risk Mitigation Planning, Implementation, and Progress Monitoring', 'X'),
    # Added 2026-10-19 (Week 4 build: Architecture / Information View; docs/lectures/week04/WEEK04_LECTURE_OUTLINE.md section 9,
    # proposed additions P4-1..P4-7), PENDING FACULTY CONFIRMATION. Glossary entries are checked as entry heading lines:
    # Architecture and Architecture Framework head pp.1445 and 1446; View is the SECOND entry on p.1677 (running header
    # 'Viable (glossary)'); Viewpoint heads p.1678; Function is the SECOND entry on p.1510 (running header 'Framework
    # (glossary)') and its discussion continues on p.1511. R48c is the DoD 4.2.3 Architecture Design Process split from the
    # umbrella R48 (heading on p.144, process text to p.147). R66 is the MITRE article 'Information and Data Management'
    # (definition block on p.111; data turned into information for decisions p.112; 'data without context has no value' p.113).
    ('R39t', 'S11', SE, 1445, 1445, 'Architecture (glossary)', 'X'),
    ('R39u', 'S11', SE, 1446, 1446, 'Architecture Framework (glossary)', 'X'),
    ('R39v', 'S11', SE, 1677, 1677, 'View (glossary)', 'X'),
    ('R39w', 'S11', SE, 1678, 1678, 'Viewpoint (glossary)', 'X'),
    ('R39x', 'S11', SE, 1510, 1511, 'Function (glossary)', 'X'),
    ('R48c', 'S12', DOD, 144, 147, 'Architecture Design Process', 'E'),
    ('R66', 'S13', MIT, 111, 113, 'Information and Data Management', 'X'),
    # Added 2026-10-19 in the Week 4 batch at the request of the Week 8 build (coordinator), PENDING FACULTY CONFIRMATION.
    # R67 and R68 are SEBoK glossary entries checked as entry heading lines (Model heads p.1567; Model-Based Systems
    # Engineering (MBSE) is the SECOND entry on p.1569, running header 'Model Validation (glossary)', its heading wrapped
    # over two lines). R69 is SysML v2 Part 1 section 7.27 Metadata (heading on p.188), for the #keyword prefix on a
    # dependency. View and Viewpoint (pp.1677, 1678) are R39v and R39w above.
    ('R67', 'S11', SE, 1567, 1567, 'Model (glossary)', 'X'),
    ('R68', 'S11', SE, 1569, 1569, 'Model-Based Systems Engineering (MBSE) (glossary)', 'X'),
    ('R69', 'S06', S06, 188, 194, '7.27 Metadata', 'I'),
    # Added 2026-10-19 (Week 5 build: Components / Interfaces; docs/lectures/week05/WEEK05_LECTURE_OUTLINE.md section 9,
    # proposed additions P5-1..P5-4 and P5-6), PENDING FACULTY CONFIRMATION. Glossary entries are checked as entry heading
    # lines: Interface heads p.1541; Component is the SECOND entry on p.1467 (running header 'Complexity avoidance
    # (glossary)'); System Element is the SECOND entry on p.1643 (running header 'System Deployment and Use (glossary)');
    # System Breakdown Structure heads p.1640. R104 is the DoD guidebook subsection 'Work Breakdown Structure' (heading on
    # p.104: product-oriented decomposition, outcomes not actions, WBS dictionary). P5-5 (SEBoK pp.429-430) was not needed.
    ('R100', 'S11', SE, 1541, 1541, 'Interface (glossary)', 'X'),
    ('R101', 'S11', SE, 1467, 1467, 'Component (glossary)', 'X'),
    ('R102', 'S11', SE, 1643, 1643, 'System Element (glossary)', 'X'),
    ('R103', 'S11', SE, 1640, 1640, 'System Breakdown Structure (glossary)', 'X'),
    ('R104', 'S12', DOD, 104, 104, 'Work Breakdown Structure', 'X'),
]

# Displayed titles, where the verified first-page heading would mislead about the whole range. The verifier still checks
# the title in R; scripts/export_readings.py shows this one instead (Week 3 review minor 4, 2026-10-19).
DISPLAY_TITLES = {
    'R78': 'Standard View Definitions and Domain Libraries (metadata, analysis, cause and effect, requirements derivation)',
}
