"""Print the extracted text of a reading (by register ID) or of a page range of a source, for authors to read.

  python -I scripts/source_pages.py R13            # whole verified range of reading R13
  python -I scripts/source_pages.py R13 560 562    # a sub-range (must lie inside R13)
  python -I scripts/source_pages.py --list         # the register (ID, source, pages, title, level)

Text comes from ../_source_cache/*.txt (local only; never copy long passages into course content: paraphrase and cite).
"""
import importlib.util
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CACHE = os.path.join(ROOT, '_source_cache')
spec = importlib.util.spec_from_file_location('readings', os.path.join(CACHE, 'verification', 'readings.py'))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
REG = {r[0]: r for r in mod.R}
_pages = {}


def pages(fname):
    if fname not in _pages:
        t = open(os.path.join(CACHE, fname), encoding='utf-8').read()
        parts = re.split(r'=== PAGE (\d+) ===', t)
        _pages[fname] = {int(parts[i]): parts[i + 1] for i in range(1, len(parts), 2)}
    return _pages[fname]


def main(argv):
    sys.stdout.reconfigure(encoding='utf-8')
    if not argv or argv[0] in ('-h', '--help'):
        print(__doc__)
        return 0
    if argv[0] == '--list':
        for r in mod.R:
            print(f'{r[0]:5} {r[1]:4} p.{r[3]}-{r[4]:<5} {r[6]}  {r[5]}')
        return 0
    rid = argv[0]
    if rid not in REG:
        print(f'unknown reading {rid}', file=sys.stderr)
        return 1
    _, src, fname, first, last, title, level = REG[rid]
    lo, hi = (int(argv[1]), int(argv[2] if len(argv) > 2 else argv[1])) if len(argv) > 1 else (first, last)
    if lo < first or hi > last:
        print(f'{rid} covers p.{first}-{last}; requested {lo}-{hi} is outside the verified range', file=sys.stderr)
        return 1
    pg = pages(fname)
    print(f'##### {rid} [{src}] "{title}" level {level}, verified range p.{first}-{last}')
    for p in range(lo, hi + 1):
        print(f'\n=== PAGE {p} ===\n{pg.get(p, "(missing)")}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
