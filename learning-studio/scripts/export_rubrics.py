"""Export the course rubrics (ASSESSMENT_RUBRICS.md, RB-1 .. RB-17) and the rating scale to the app.

The markdown document is the single source of truth; the app never re-types a rubric.
Writes src/content/rubrics.generated.json. Run:  npm run content:rubrics
Each rubric keeps its prose paragraphs and its tables (header + rows) verbatim.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(HERE)
SRC = os.path.join(os.path.dirname(APP), 'ASSESSMENT_RUBRICS.md')
OUT = os.path.join(APP, 'src', 'content', 'rubrics.generated.json')


def cells(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]


def parse_section(lines):
    """Split a section body into prose paragraphs and tables, preserving order."""
    parts, para, i = [], [], 0
    while i < len(lines):
        line = lines[i]
        if line.startswith('|') and i + 1 < len(lines) and re.match(r'^\|\s*-', lines[i + 1]):
            if para:
                parts.append({'type': 'text', 'text': ' '.join(para)})
                para = []
            header, rows = cells(line), []
            i += 2
            while i < len(lines) and lines[i].startswith('|'):
                rows.append(cells(lines[i]))
                i += 1
            parts.append({'type': 'table', 'header': header, 'rows': rows})
            continue
        if line.strip() in ('', '---'):
            if para:
                parts.append({'type': 'text', 'text': ' '.join(para)})
                para = []
        else:
            para.append(line.strip())
        i += 1
    if para:
        parts.append({'type': 'text', 'text': ' '.join(para)})
    return parts


def main():
    text = open(SRC, encoding='utf-8').read().splitlines()
    rubrics, cur, body, scale = [], None, [], None
    in_scale = False

    def flush():
        if cur:
            rubrics.append({**cur, 'parts': parse_section(body)})

    for line in text:
        m = re.match(r'^## (RB-\d+) (.+)$', line)
        if m:
            flush()
            cur, body = {'id': m.group(1), 'title': m.group(2).strip()}, []
            continue
        if line.startswith('## '):  # any other level-2 heading ends the current rubric
            flush()
            cur, body = None, []
            continue
        if cur is not None:
            body.append(line)
        if line.startswith('**Scale (all criteria)**'):
            in_scale, scale = True, []
        elif in_scale and line.startswith('|') and not re.match(r'^\|\s*-', line):
            c = cells(line)
            if c[0] != 'Level':
                scale.append({'level': int(c[0]), 'name': c[1], 'meaning': c[2]})
        elif in_scale and scale and not line.startswith('|'):
            in_scale = False
    flush()

    ids = [r['id'] for r in rubrics]
    expected = [f'RB-{n}' for n in range(1, 18)]
    if ids != expected:
        raise SystemExit(f'unexpected rubric set: {ids}')
    if not scale or [s['level'] for s in scale] != [4, 3, 2, 1, 0]:
        raise SystemExit(f'rating scale not found or malformed: {scale}')
    json.dump({'generatedFrom': 'ASSESSMENT_RUBRICS.md', 'scale': scale, 'rubrics': rubrics},
              open(OUT, 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)
    print(f'wrote {len(rubrics)} rubrics -> {os.path.relpath(OUT, APP)}')


if __name__ == '__main__':
    main()
