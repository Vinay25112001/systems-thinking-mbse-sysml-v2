"""Check that every reading in readings.py starts on the cited PDF page.

Usage (from _source_cache):  python -I verification/verify_readings.py
Prints one line per reading and writes verification/readings_verified.txt.
"""
import importlib.util
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(encoding='utf-8')
spec = importlib.util.spec_from_file_location('readings', os.path.join(BASE, 'verification', 'readings.py'))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

_cache = {}


def pages(fname):
    if fname not in _cache:
        _cache[fname] = open(os.path.join(BASE, fname), encoding='utf-8').read().split('\n=== PAGE ')
    return _cache[fname]


def body(fname, n):
    return pages(fname)[n].split(' ===\n', 1)[1]


def norm(s):
    return re.sub(r'\W+', ' ', s).lower().strip()


def heading(title, text):
    """Return True if the title is a heading on the page: a whole line, or two or three consecutive lines
    joined (a heading wrapped over lines), whose normalised text equals the normalised title."""
    t = norm(title)
    ls = [norm(x) for x in text.split('\n')]
    ls = [x for x in ls if x]
    return any(' '.join(ls[i:i + k]) == t for k in (1, 2, 3) for i in range(len(ls)))


lines, ok = [], 0
for rid, src, fname, first, last, title, level in mod.R:
    # A glossary page holds several entries and its running header names only the first, so a substring match
    # could hit the header, a cross-reference or a longer term ('Subsystem (glossary)' contains 'system glossary').
    # A '(glossary)' title therefore counts only as an entry heading line; other titles may also match in text.
    gloss = title.endswith('(glossary)')
    if not title:
        where = 'RANGE ONLY (not verified)'
    elif heading(title, body(fname, first)):
        where = 'title found on first page (heading line)'
        ok += 1
    elif norm(title) in norm(body(fname, first)) and not gloss:
        where = 'title found on first page (in text)'
        ok += 1
    elif gloss and norm(title) in norm(body(fname, first)):
        where = 'GLOSSARY TITLE IN TEXT BUT NOT AS AN ENTRY HEADING'
    elif first > 1 and norm(title) in norm(body(fname, first - 1)):
        where = 'TITLE ON PREVIOUS PAGE'
    else:
        where = 'TITLE NOT FOUND'
    refs = ''
    if src == 'S11':  # a reference list must not start inside the assigned body range (after the start page's heading)
        for n in range(first + 1, last + 1):
            ls = [x.strip() for x in body(fname, n).split('\n') if x.strip()]
            if any(x in ('References', 'Works Cited') for x in ls[1:8]):
                refs = f' | REFERENCE LIST STARTS ON p.{n}'
                ok -= 1 if where.startswith('title found on first page') else 0
                break
    lines.append(f'{rid} | {src} | PDF {first}-{last} | {last - first + 1} pp | {level} | {title} | {where}{refs}')

lines.append(f'start page title-verified and (SEBoK) free of reference lists: {ok}/{len(mod.R)}')
print('\n'.join(lines))
with open(os.path.join(BASE, 'verification', 'readings_verified.txt'), 'w', encoding='utf-8') as fh:
    fh.write('\n'.join(lines) + '\n')
