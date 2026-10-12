"""Single source of truth for CLO attainment evidence (review finding C2).

Each graded component is decomposed into rubric parts (share of the component) and each part is
tagged with the CLO it evidences and whether the evidence is individual (I) or team (T).
Only parts listed here are ATTAINMENT evidence; everything else is formative or conduct.
Run:  python -I verification/clo_evidence.py   (prints markdown tables and checks the sums)
"""
import sys

sys.stdout.reconfigure(encoding='utf-8')

# component: (course weight %, [(part label, share of component, CLO or None, 'I'/'T'), ...])
B = {
    'Readiness quizzes': (10, [('formative', 1.0, None, 'I')]),
    'Exam 1': (12, [('Part A', .25, 'B-CLO1', 'I'), ('Part B', .40, 'B-CLO2', 'I'), ('Part C', .35, 'B-CLO3', 'I')]),
    'Exam 2 practical (RB-14)': (13, [('T1,T2,T5,T6', .60, 'B-CLO4', 'I'), ('T3,T4', .40, 'B-CLO5', 'I')]),
    'Review notebook (RB-16) + AI statements (RB-12)': (5, [('RB-16/RB-12', 1.0, 'B-CLO6', 'I')]),
    'CP1': (7, [('RB-1', .45, 'B-CLO1', 'T'), ('RB-2', .45, 'B-CLO2', 'T'), ('RB-12', .10, 'B-CLO6', 'T')]),
    'CP2': (10, [('RB-3.1-3.5', .36, 'B-CLO2', 'T'), ('RB-3.6', .04, 'B-CLO6', 'T'), ('RB-4', .20, 'B-CLO2', 'T'),
                 ('RB-5', .30, 'B-CLO3', 'T'), ('RB-12', .10, 'B-CLO6', 'T')]),
    'CP3': (9, [('RB-6.1-6.5', .3825, 'B-CLO3', 'T'), ('RB-6.6', .0675, 'B-CLO6', 'T'),
                ('RB-7 excl. 7.4', .405, 'B-CLO4', 'T'), ('RB-7.4', .045, 'B-CLO6', 'T'), ('RB-12', .10, 'B-CLO6', 'T')]),
    'CP4': (10, [('RB-8', .75, 'B-CLO4', 'T'), ('RB-17 review RIDs given', .15, 'B-CLO6', 'T'), ('RB-12', .10, 'B-CLO6', 'T')]),
    'CP5': (14, [('RB-8', .25, 'B-CLO4', 'T'), ('RB-9', .30, 'B-CLO5', 'T'), ('RB-10', .15, 'B-CLO5', 'T'),
                 ('RB-11.3 live thread', .045, 'B-CLO5', 'T'), ('RB-11.1,.2,.4,.6', .195, 'B-CLO6', 'T'),
                 ('RB-11.5 individual Q&A', .06, 'B-CLO6', 'I')]),
    'Peer evaluation (RB-13)': (10, [('conduct', 1.0, None, 'I')]),
}

# Pathway A1: S01 weights; exam split = equal weight per S01 coverage topic.
A1 = {
    'Quizzes': (10, [('formative', 1.0, None, 'I')]),
    'Exam 1 (7 topics)': (15, [('ST, stakeholders', 2/7, 'A1-1', 'I'), ('needs, capability, ConOps, requirements', 4/7, 'A1-2', 'I'),
                               ('technology assessment', 1/7, 'A1-3', 'I')]),
    'Exam 2 (10 topics)': (15, [('architecture, integration, V&V', .3, 'A1-2', 'I'), ('trade studies', .1, 'A1-3', 'I'),
                                ('information, DE, MBSE', .3, 'A1-4', 'I'), ('risk, security & resilience, roadmaps', .3, 'A1-5', 'I')]),
    'Stakeholder Ecosystem Map': (2, [('RB-1', 1, 'A1-1', 'T')]),
    'Needs & Capability Report': (3, [('RB-2', 1, 'A1-2', 'T')]),
    'ConOps': (4, [('RB-2', 1, 'A1-2', 'T')]),
    'Requirements Package': (7, [('RB-3', 1, 'A1-2', 'T')]),
    'Technology Assessment': (3, [('RB-5.1-5.2', 1, 'A1-3', 'T')]),
    'Technology Risk Assessment': (2, [('RB-5.3-5.5', 1, 'A1-5', 'T')]),
    'AROU Register': (2, [('RB-5.4-5.5', 1, 'A1-5', 'T')]),
    'Trade Study Report': (5, [('RB-6', 1, 'A1-3', 'T')]),
    'Architecture Concept Description': (3, [('RB-7.1-7.4', 1, 'A1-2', 'T')]),
    'Measures Framework': (1, [('RB-4', 1, 'A1-3', 'T')]),
    'Information View': (2, [('RB-7.5-7.6', 1, 'A1-4', 'T')]),
    'Interface Inventory': (1, [('RB-7.3', 1, 'A1-4', 'T')]),
    'Verification Strategy': (1, [('RB-10', 1, 'A1-2', 'T')]),
    'Known Unknowns Analysis': (1, [('RB-15.3', 1, 'A1-5', 'T')]),
    'Risk, Security & Resilience': (2, [('RB-15.1-15.2', 1, 'A1-5', 'T')]),
    'Enterprise Evolution Roadmap': (1, [('RB-15.4', 1, 'A1-5', 'T')]),
    'Final Package & Executive Presentation': (10, [('RB-11 team criteria (all CLOs)', .8, 'A1-all', 'T'),
                                                    ('RB-11.5 individual Q&A', .2, 'A1-all', 'I')]),
    'Peer evaluation': (10, [('conduct', 1, None, 'I')]),
}

# Pathway A2: S02 weights. Labs: 14 graded submissions (13+14 merged), equal weight 25/14 each.
lab = 1 / 14
A2 = {
    'Weekly team labs': (25, [('Labs 1,2,3,5,7,8 (RB-8)', 6 * lab, 'A2-1', 'T'), ('Lab 4A (RB-3)', .5 * lab, 'A2-1', 'T'),
                              ('Lab 4B AI assessment (RB-12, RB-3.6)', .5 * lab, 'A2-4', 'T'),
                              ('Lab 6 (RB-8)', .75 * lab, 'A2-1', 'T'), ('Lab 6 AI alternatives (RB-12)', .25 * lab, 'A2-4', 'T'),
                              ('Labs 9,10 (RB-9, RB-10)', 2 * lab, 'A2-2', 'T'),
                              ('Lab 11 (RB-6)', .75 * lab, 'A2-3', 'T'), ('Lab 11 AI alternatives (RB-12)', .25 * lab, 'A2-4', 'T'),
                              ('Labs 12, 13+14 (RB-5.5, RB-9.5)', 2 * lab, 'A2-3', 'T'),
                              ('Lab 15 views (RB-11.4)', .75 * lab, 'A2-5', 'T'), ('Lab 15 AI narratives (RB-12)', .25 * lab, 'A2-4', 'T')]),
    'Exam 1': (5, [('model foundations, architecture', 1, 'A2-1', 'I')]),
    'Exam 2': (5, [('behaviour, interfaces', .3, 'A2-1', 'I'), ('digital thread, traceability, verification', .3, 'A2-2', 'I'),
                   ('trade studies, risk', .2, 'A2-3', 'I'), ('critique of AI-generated model fragment [REC, required]', .2, 'A2-4', 'I')]),
    'Exam 3 practical (RB-14)': (10, [('T1,T2,T5,T6', .6, 'A2-1', 'I'), ('T3', .2, 'A2-2', 'I'), ('T4', .2, 'A2-3', 'I')]),
    'Requirements & Capability Review (SRR)': (10, [('RB-8', .7, 'A2-1', 'T'), ('RB-11 team criteria', .24, 'A2-5', 'T'),
                                                    ('RB-11.5 individual', .06, 'A2-5', 'I')]),
    'Architecture & Traceability Review (PDR)': (10, [('RB-8', .3, 'A2-1', 'T'), ('RB-9', .4, 'A2-2', 'T'),
                                                      ('RB-11 team criteria', .24, 'A2-5', 'T'), ('RB-11.5 individual', .06, 'A2-5', 'I')]),
    'Final enterprise team model': (20, [('RB-8', .35, 'A2-1', 'T'), ('RB-9.1-9.4', .2625, 'A2-2', 'T'),
                                         ('RB-9.5', .0875, 'A2-3', 'T'), ('RB-6/RB-5.5', .15, 'A2-3', 'T'), ('RB-12', .15, 'A2-4', 'T')]),
    'Executive presentation': (5, [('RB-11 team criteria', .8, 'A2-5', 'T'), ('RB-11.5 + own portion, per student', .2, 'A2-5', 'I')]),
    'Peer evaluation': (10, [('conduct', 1, None, 'I')]),
}


def table(name, comp):
    total = sum(w for w, _ in comp.values())
    assert abs(total - 100) < 1e-9, (name, total)
    for c, (w, parts) in comp.items():
        assert abs(sum(p[1] for p in parts) - 1) < 1e-9, (name, c, sum(p[1] for p in parts))
    clos = sorted({p[2] for _, parts in comp.values() for p in parts if p[2]})
    out = [f'### {name}: attainment evidence by CLO (% of final grade)', '',
           '| CLO | Individual | Team | Total | Measures (V1) | V2 individual? |', '|---|---|---|---|---|---|']
    for clo in clos:
        ind = sum(w * p[1] for w, parts in comp.values() for p in parts if p[2] == clo and p[3] == 'I')
        team = sum(w * p[1] for w, parts in comp.values() for p in parts if p[2] == clo and p[3] == 'T')
        n = sum(1 for _, parts in comp.values() if any(p[2] == clo for p in parts))
        out.append(f'| {clo} | {ind:.1f} | {team:.1f} | {ind + team:.1f} | {n} components | {"yes" if ind > 0 else "**NO**"} |')
    nonout = sum(w * p[1] for w, parts in comp.values() for p in parts if p[2] is None)
    out.append(f'| formative / conduct | | | {nonout:.1f} | | |')
    out.append(f'| **Total** | | | **{total:.1f}** | | |')
    out.append('')
    out.append(f'**Components and parts ({name})**')
    out.append('')
    out.append('| Component | Weight | Part | Share | CLO | I/T |')
    out.append('|---|---|---|---|---|---|')
    for c, (w, parts) in comp.items():
        for p in parts:
            out.append(f'| {c} | {w} | {p[0]} | {p[1]:.3f} | {p[2] or "—"} | {p[3]} |')
    return '\n'.join(out)


for name, comp in (('Pathway B', B), ('Pathway A1', A1), ('Pathway A2', A2)):
    print(table(name, comp))
    print()
print('ALL SUMS CHECKED')
