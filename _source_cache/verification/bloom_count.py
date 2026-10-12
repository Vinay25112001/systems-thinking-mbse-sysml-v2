"""Count the highest Bloom level of each Pathway B objective in WEEKLY_INSTRUCTIONAL_PLAN.md (review m11).

Objective lines look like:  - B7.3 Test sensitivity ... [Analyse → CLO3]
Writes verification/bloom_count.txt and replaces the <!-- BLOOM_TABLE --> block in the syllabus.
"""
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ORDER = ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create']

plan = open(os.path.join(ROOT, 'WEEKLY_INSTRUCTIONAL_PLAN.md'), encoding='utf-8').read()
part_b = plan.split('# Part A1')[0]
objs = re.findall(r'^- (B\d+\.\d+) .*\[([A-Za-z/ ]+) →', part_b, re.M)
counts = {k: 0 for k in ORDER}
detail = []
for oid, lv in objs:
    levels = [x.strip() for x in lv.split('/')]
    top = max(levels, key=ORDER.index)
    counts[top] += 1
    detail.append(f'{oid}: {top}')
n = len(objs)
rows = ['| Highest level | Objectives | Share |', '|---|---|---|']
rows += [f'| {k} | {v} | {100 * v / n:.0f} % |' for k, v in counts.items() if v]
rows.append(f'| **Total** | **{n}** | 100 % |')
table = '\n'.join(rows)
open(os.path.join(ROOT, '_source_cache', 'verification', 'bloom_count.txt'), 'w', encoding='utf-8').write(
    table + '\n\n' + '\n'.join(detail) + '\n')
syl_path = os.path.join(ROOT, 'PROPOSED_COURSE_SYLLABUS_14_WEEK.md')
syl = open(syl_path, encoding='utf-8').read()
syl = re.sub(r'<!-- BLOOM_TABLE -->.*?<!-- /BLOOM_TABLE -->|<!-- BLOOM_TABLE -->',
             '<!-- BLOOM_TABLE -->\n' + table + '\n<!-- /BLOOM_TABLE -->', syl, count=1, flags=re.S)
open(syl_path, 'w', encoding='utf-8').write(syl)
print(table)
