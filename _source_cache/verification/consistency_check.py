"""Cross-document consistency checks for the curriculum package (review C2/M1 follow-up).

Checks: FD-, RB- and R-IDs referenced are defined; no stale (pre-revision-1) reading page ranges remain.
Run from the project root:  python -I _source_cache/verification/consistency_check.py
"""
import importlib.util
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS = ['PROPOSED_COURSE_SYLLABUS_14_WEEK.md', 'PROPOSED_TWO_COURSE_SEQUENCE.md', 'CURRICULUM_COMPARISON.md',
        'COURSE_OUTCOME_ASSESSMENT_MATRIX.md', 'WEEKLY_INSTRUCTIONAL_PLAN.md', 'LABORATORY_AND_CAPSTONE_PLAN.md',
        'ASSESSMENT_RUBRICS.md', 'ACADEMIC_QUALITY_REVIEW.md', 'FACULTY_DECISION_REGISTER.md']
text = {d: open(os.path.join(ROOT, d), encoding='utf-8').read() for d in DOCS if os.path.exists(os.path.join(ROOT, d))}
problems = []

fd_defined = set(re.findall(r'\*\*(FD-\d\d)\*\*', text['FACULTY_DECISION_REGISTER.md']))
for d, t in text.items():
    for fd in set(re.findall(r'FD-(\d\d)', t)):
        if f'FD-{fd}' not in fd_defined:
            problems.append(f'{d}: FD-{fd} referenced but not defined')

rb_defined = set(re.findall(r'^## (RB-\d+)\b', text['ASSESSMENT_RUBRICS.md'], re.M))
for d, t in text.items():
    for rb in set(re.findall(r'RB-(\d+)(?![.\d])', t)):
        if f'RB-{rb}' not in rb_defined:
            problems.append(f'{d}: RB-{rb} referenced but not defined')

spec = importlib.util.spec_from_file_location('r', os.path.join(ROOT, '_source_cache', 'verification', 'readings.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
reg = {r[0] for r in m.R}
for d, t in text.items():
    for rid in set(re.findall(r'\bR(\d\d[a-c]?)\b', t)):
        base = 'R' + rid
        if base not in reg and not any(x.startswith(base) for x in reg):
            problems.append(f'{d}: {base} not in reading register')
    for rid in set(re.findall(r'\b(R(?:06|20|23|33))\b(?![a-c–])', t)):
        problems.append(f'{d}: bare {rid} (split into a/b/c in revision 1)')

stale = ['p.51–55', 'p.264–267', 'p.274–279', 'p.815–820', 'p.867–870', 'p.543–548', 'p.557–568', 'p.528–539',
         'p.767–770', 'p.482–490', 'p.464–476', 'p.570–579', 'p.511–521', 'p.625–633', 'p.634–642', 'p.1203–1215',
         'p.681–687', 'p.56–61', 'p.371–375', 'p.290–300', 'p.380–389', 'p.580–604', 'p.587–596', 'p.597–604',
         'p.829–837', 'p.860–865', 'p.477–481', 'p.1230–1237', 'p.1374–1382', 'p.1396–1401', 'R76 (sl.115)', 'R76 sl.115']
for d, t in text.items():
    if d == 'ACADEMIC_QUALITY_REVIEW.md':
        continue  # the review record quotes old values on purpose
    for s in stale:
        if s in t:
            problems.append(f'{d}: stale reference {s}')

# Round-2 additions (review N1, N2): every referenced project .md file must exist,
# and the RB-14 / RB-12 CLO tags must match clo_evidence.py.
for d in DOCS:
    if not os.path.exists(os.path.join(ROOT, d)):
        problems.append(f'{d}: listed curriculum document is MISSING')
for d, t in text.items():
    for ref in set(re.findall(r'`([A-Z_]+\.md)`', t)):
        if not os.path.exists(os.path.join(ROOT, ref)):
            problems.append(f'{d}: references missing file {ref}')
rub = text['ASSESSMENT_RUBRICS.md']
expect = {'T1': ('B-CLO4', 'A2-1'), 'T2': ('B-CLO4', 'A2-1'), 'T3': ('B-CLO5', 'A2-2'), 'T4': ('B-CLO5', 'A2-3'),
          'T5': ('B-CLO4', 'A2-1'), 'T6': ('B-CLO4', 'A2-1')}
for task, tags in expect.items():
    row = re.search(rf'^\| {task} [^\n]*', rub, re.M)
    last = row.group(0).rstrip().rstrip('|').split('|')[-1] if row else ''
    if not row or any(tg not in last for tg in tags) or (task in ('T1', 'T2', 'T5', 'T6') and 'B-CLO5' in last):
        problems.append(f'ASSESSMENT_RUBRICS.md: RB-14 {task} tags "{last.strip()}" disagree with clo_evidence.py {tags}')
for cid in ('12.1', '12.2', '12.3'):
    row = re.search(rf'^\| {re.escape(cid)} [^\n]*', rub, re.M)
    last = row.group(0).rstrip().rstrip('|').split('|')[-1] if row else ''
    if 'A2-4' not in last or ('A1-4' in last and 'corroborating' not in last):
        problems.append(f'ASSESSMENT_RUBRICS.md: RB-{cid} tags "{last.strip()}" disagree with clo_evidence.py')

print('\n'.join(problems) if problems else 'NO PROBLEMS')
print(f'checked {len(text)} documents; FD defined {len(fd_defined)}; RB defined {len(rb_defined)}; readings {len(reg)}')
