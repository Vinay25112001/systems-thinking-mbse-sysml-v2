"""Export the verified reading register to the app (single source of truth for citations).

Reads ../_source_cache/verification/readings.py (register) and readings_verified.txt (verifier output)
and writes src/content/readings.generated.json. Run:  npm run content:readings
The app never invents a citation: every reading it cites must exist in this file.
"""
import importlib.util
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(HERE)
VER = os.path.join(os.path.dirname(APP), '_source_cache', 'verification')

spec = importlib.util.spec_from_file_location('readings', os.path.join(VER, 'readings.py'))
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

status = {}
for line in open(os.path.join(VER, 'readings_verified.txt'), encoding='utf-8'):
    parts = [p.strip() for p in line.split('|')]
    if len(parts) >= 7 and parts[0].startswith('R'):
        status[parts[0]] = ' | '.join(parts[6:])

SOURCE_TITLES = {
    'S05': 'OMG KerML v1.1 Beta 2 (Release 2026-07)',
    'S06': 'OMG SysML v2.1 Beta 2, Part 1 (Release 2026-07)',
    'S07': 'OMG SysML v2.1 Beta 2, Part 2: v1-to-v2 Transformation',
    'S08': 'OMG Systems Modeling API and Services v1.1 Beta 2',
    'S09': 'Friedenthal, Intro to the SysML v2 Language: Graphical Notation (2023-03-07)',
    'S10': 'Seidewitz, Intro to the SysML v2 Language: Textual Notation (Release 2026-08)',
    'S11': 'SEBoK v2.14 (2026)',
    'S12': 'OUSD(R&E) Systems Engineering Guidebook (2021/2022)',
    'S13': 'The MITRE Systems Engineering Guide (2014)',
}

out = []
for rid, src, _f, first, last, title, level in mod.R:
    st = status.get(rid, 'NOT IN VERIFIER OUTPUT')
    out.append({
        'id': rid,
        'source': src,
        'sourceTitle': SOURCE_TITLES[src],
        'title': title,
        'firstPage': first,
        'lastPage': last,
        'unit': 'slide' if src in ('S09', 'S10') else 'pdf-page',
        'level': level,
        'verification': st,
        'verified': st.startswith('title found on first page') and 'REFERENCE' not in st,
        'declaredException': ('REFERENCE' in st) and rid == 'R30',
    })

dest = os.path.join(APP, 'src', 'content', 'readings.generated.json')
with open(dest, 'w', encoding='utf-8') as fh:
    json.dump({'generatedFrom': '_source_cache/verification/readings.py', 'readings': out}, fh, indent=1, ensure_ascii=False)
print(f'wrote {len(out)} readings to {dest}')
