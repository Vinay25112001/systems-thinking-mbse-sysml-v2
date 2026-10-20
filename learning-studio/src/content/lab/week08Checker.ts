// Week 8: install and run the course checker. Student-facing guide, single source for the page (#/week/8/lab/checker,
// src/week8/Checker.tsx), the "Install and run the course checker" section of the Lab L8 instructions
// (week08Lab.ts labMarkdown, docs/lectures/week08/WEEK8_LAB_INSTRUCTIONS.md) and the Session 1 live demonstration.
//
// Basis: docs/SYSML_TOOLCHAIN.md, section "Local reference validator" (the developer procedure, Windows/Git Bash) and
// scripts/check_sysml.py itself (folder layout it expects, messages, exit codes, output format). Course facts, not
// specification facts. The Windows procedure and the folder layout were run end to end by the course team on
// 2026-10-19 (a fresh kit folder, the two tool-proof files: PASS and FAIL as recorded); the macOS and Linux commands
// follow the same layout and the publisher's archive formats but have NOT yet been run by the course team, and the guide
// says so. The recorded outputs are read from the course checker report (sysml/lectures/week08/week08-report.json), never
// retyped; week08Checker.test.ts checks the formatting against scripts/check_sysml.py.
//
// Decision (DECISION_LOG A13, A21 decision 8; recorded as a faculty decision item in
// docs/lectures/week08/WEEK8_REVIEW_DISPOSITIONS.md): the in-app lab tool is the required environment for writing the
// model; validity is decided by the course checker, so each TEAM needs one working installation (its checker owner) or
// the lab machines. Installing on a student's own computer is optional and outside the week's hour budget.
// Review status: new-pending-review.
import checkerPy from '../../../scripts/check_sysml.py?raw'
import launcherJava from '../../../scripts/sysml-launcher/SysMLBatchCheck.java?raw'
import report from '../../../sysml/lectures/week08/week08-report.json' with { type: 'json' }
import { sysmlSource } from '../../lib/sysml'
import { PENDING, type NewText } from '../learn/types'

const n = (text: string): NewText => ({ text, review: PENDING })

export const CHECKER_REVIEW = PENDING
export const CHECKER_TITLE = 'Install and run the course checker'
export const JDK_VERSION = '21.0.12.1+1'
export const RELEASE = '2026-08'
export const KERNEL = '0.62.0'
export const JDK_WINDOWS_URL = 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jdk_x64_windows_hotspot_21.0.12.1_1.zip'
export const JDK_WINDOWS_SHA256 = 'f9d6e191ab098c0d416e7d588a24420a8621cd2f4720dab2459b8b7b2d2d8b4e'
export const JDK_RELEASE_PAGE = 'https://github.com/adoptium/temurin21-binaries/releases/tag/jdk-21.0.12.1%2B1'
export const KERNEL_URL = 'https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/releases/download/2026-08/jupyter-sysml-kernel-0.62.0.zip'
export const KERNEL_SHA256 = '5a015ed3f2b3d2dae14e9c3fb9602d9e1fef5f9ce33cf396c422329405cc3cb2'

/** Who must install, and who may (the course decision, stated once). */
export const CHECKER_WHO = n(
  'The lab tool in this app is where your team writes model v0.1; it is the required environment. Whether a model is valid SysML v2 is decided by the course checker, which runs on a computer, not in the browser. So every team needs one working installation before Session 2: the team’s checker owner (normally the AI & Data Management lead) installs it from this guide, and the team runs every file on it. The lab machines are the fallback. Installing it on your own computer as well is optional: about an hour the first time, and not counted in the week’s hours.',
)
export const CHECKER_WHAT = n(
  'The course checker is the OMG SysML v2 Pilot Implementation, release 2026-08 (the implementation published with the SysML v2.1 Beta 2 texts this course cites), run by a small course script. It parses each file, resolves every name against the file and the standard library, and runs the pilot implementation’s validation rules. An ERROR fails the file; a WARNING does not. A PASS shows only that the file parsed, every name resolved and no rule fired: it never shows that the model says what your register says. It runs offline once installed, and nothing you check is uploaded.',
)

export const PREREQUISITES: string[] = [
  'A Windows 10 or 11, macOS or Linux computer on which you may run programs from your home folder (no administrator rights are needed).',
  'About 500 MB of free disk space and a network connection for the two downloads (about 330 MB together).',
  'Python 3.9 or later (python.org). Check it: `python --version` on Windows, `python3 --version` on macOS and Linux.',
  'A terminal: PowerShell on Windows, Terminal on macOS or Linux. The course commands are typed there.',
  'Nothing else: the guide installs its own Java (a portable Temurin JDK 21 folder; your system Java, if any, is not used or changed).',
]

/** The folder layout check_sysml.py expects: its tools folder is two levels above the script. */
export const LAYOUT = [
  'sysml-checker/                      (in your home folder; avoid spaces in the path)',
  '├─ checker/',
  '│  ├─ scripts/',
  '│  │  ├─ check_sysml.py              (download below)',
  '│  │  └─ sysml-launcher/',
  '│  │     └─ SysMLBatchCheck.java     (download below)',
  '│  └─ models/                       (your .sysml files, and the two tool-proof files)',
  '└─ tools/',
  '   ├─ jdk-21/                       (step 2: Java)',
  '   └─ sysml-pilot-2026-08/kernel/   (step 3: the SysML v2 pilot implementation)',
]

export type OsKey = 'windows' | 'macos' | 'linux'
export const OS_LABEL: Record<OsKey, string> = { windows: 'Windows (PowerShell)', macos: 'macOS (Terminal)', linux: 'Linux (terminal)' }
export type Step = { id: string; title: string; text: NewText; commands?: Record<OsKey, string[]>; note?: NewText }

/** Files in the kernel zip (tools/sysml-pilot-2026-08/PROVENANCE.txt and the unpacked kit, 2026-10-19): the 95 files of
 *  the standard library (sysml.library, .index.json included), the checker jar, kernel.json, install.py and LICENSE.
 *  The zip's entry count also depends on whether it lists folders, so the guide states the file count. */
export const KERNEL_LIBRARY_FILES = 95
export const KERNEL_FILES = KERNEL_LIBRARY_FILES + 4
const unzipKernel = (py: string) => `${py} -I -c "import zipfile; z = zipfile.ZipFile('k.zip'); z.extractall('sysml-pilot-2026-08/kernel'); print(sum(not n.endswith('/') for n in z.namelist()), 'files in', len(z.namelist()), 'entries unpacked')"`
/** SHA-256 of each Temurin archive, as published beside it on the release page (the .sha256.txt files, read 2026-10-19). */
export const JDK_SHA256: Record<string, string> = {
  'OpenJDK21U-jdk_x64_windows_hotspot_21.0.12.1_1.zip': JDK_WINDOWS_SHA256,
  'OpenJDK21U-jdk_aarch64_mac_hotspot_21.0.12.1_1.tar.gz': '3623232f33a9c3baadf304480b2535f9a3cba8a58d42ecbb438ba267315d9998',
  'OpenJDK21U-jdk_x64_mac_hotspot_21.0.12.1_1.tar.gz': '44db0f08196daf19a47f90d13388b0c943b67663cb537f998fe29e836fa842ce',
  'OpenJDK21U-jdk_x64_linux_hotspot_21.0.12.1_1.tar.gz': 'ce79869e1307ed8ee1e2baa86a412b1eb5b75d10a01006d788a6f968bcfaee94',
  'OpenJDK21U-jdk_aarch64_linux_hotspot_21.0.12.1_1.tar.gz': '23e37e026f12f3e706f18938ff611db3032d075b09d0879a25d06718c773e223',
}
const jdkSum = (arch: string, os: string) => JDK_SHA256[`OpenJDK21U-jdk_${arch}_${os}_hotspot_21.0.12.1_1.tar.gz`]
const unixJdk = (os: 'mac' | 'linux') => [
  os === 'mac' ? 'ARCH=aarch64     # Apple silicon; on an Intel Mac use ARCH=x64' : 'ARCH=x64         # x86-64; on an ARM computer use ARCH=aarch64',
  'curl -fL -o jdk.tar.gz "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.12.1%2B1/OpenJDK21U-jdk_${ARCH}_' + os + '_hotspot_21.0.12.1_1.tar.gz"',
  `${os === 'mac' ? 'shasum -a 256' : 'sha256sum'} jdk.tar.gz   # aarch64: ${jdkSum('aarch64', os)}; x64: ${jdkSum('x64', os)}`,
  'mkdir _jdkx && tar -xzf jdk.tar.gz -C _jdkx',
  os === 'mac' ? 'mv "_jdkx/jdk-21.0.12.1+1/Contents/Home" jdk-21' : 'mv "_jdkx/jdk-21.0.12.1+1" jdk-21',
  'rm -rf _jdkx jdk.tar.gz',
  './jdk-21/bin/java -version',
]

export const STEPS: Step[] = [
  {
    id: 'folders',
    title: 'Make the folders',
    text: n('Create the folder layout above in your home folder. The course script finds Java and the pilot implementation by this layout, so keep the names exactly as shown.'),
    commands: {
      windows: ['New-Item -ItemType Directory -Force -Path "$HOME\\sysml-checker\\checker\\scripts\\sysml-launcher", "$HOME\\sysml-checker\\checker\\models", "$HOME\\sysml-checker\\tools" | Out-Null', 'cd "$HOME\\sysml-checker\\tools"'],
      macos: ['mkdir -p ~/sysml-checker/checker/scripts/sysml-launcher ~/sysml-checker/checker/models ~/sysml-checker/tools', 'cd ~/sysml-checker/tools'],
      linux: ['mkdir -p ~/sysml-checker/checker/scripts/sysml-launcher ~/sysml-checker/checker/models ~/sysml-checker/tools', 'cd ~/sysml-checker/tools'],
    },
  },
  {
    id: 'java',
    title: 'Install Java (portable JDK 21)',
    text: n(`Download the Eclipse Temurin JDK ${JDK_VERSION} archive, check its SHA-256 checksum, and unpack it as tools/jdk-21. It must be the JDK, not a JRE: the course script compiles a small launcher with javac on its first run.`),
    commands: {
      windows: [
        `curl.exe -fL -o jdk.zip "${JDK_WINDOWS_URL}"`,
        `(Get-FileHash jdk.zip -Algorithm SHA256).Hash   # must be ${JDK_WINDOWS_SHA256.toUpperCase()}`,
        `python -I -c "import zipfile; zipfile.ZipFile('jdk.zip').extractall('_jdkx')"`,
        'Move-Item "_jdkx\\jdk-21.0.12.1+1" jdk-21',
        'Remove-Item -Recurse _jdkx, jdk.zip',
        '.\\jdk-21\\bin\\java -version',
      ],
      macos: unixJdk('mac'),
      linux: unixJdk('linux'),
    },
    note: n(`The last command must report version ${JDK_VERSION}. Never run a download whose checksum differs: delete it and download again.`),
  },
  {
    id: 'kernel',
    title: 'Install the SysML v2 pilot implementation',
    text: n(`Download the pilot implementation, release ${RELEASE} (kernel ${KERNEL}), check its checksum and unpack it into tools/sysml-pilot-2026-08/kernel. It contains the checker and the SysML v2 standard library.`),
    note: n(`The unpack command must end by printing the number of files and entries unpacked; the file count must be ${KERNEL_FILES} (${KERNEL_LIBRARY_FILES} standard-library files, the checker jar, kernel.json, install.py and LICENSE). If it prints a smaller file count or a Traceback instead, the unpack stopped part-way (on Windows usually because the folder path is too long): delete tools/sysml-pilot-2026-08, move sysml-checker to a short path such as C:\\sysml-checker, and repeat this step. Do not use a part-unpacked library: the checker can still start, but its results cannot be trusted.`),
    commands: {
      windows: [`curl.exe -fL -o k.zip "${KERNEL_URL}"`, `(Get-FileHash k.zip -Algorithm SHA256).Hash   # must be ${KERNEL_SHA256.toUpperCase()}`, unzipKernel('python'), 'Remove-Item k.zip'],
      macos: [`curl -fL -o k.zip "${KERNEL_URL}"`, `shasum -a 256 k.zip   # must be ${KERNEL_SHA256}`, unzipKernel('python3'), 'rm k.zip'],
      linux: [`curl -fL -o k.zip "${KERNEL_URL}"`, `sha256sum k.zip   # must be ${KERNEL_SHA256}`, unzipKernel('python3'), 'rm k.zip'],
    },
  },
  {
    id: 'scripts',
    title: 'Save the course script, the launcher and the tool-proof files',
    text: n('Use the download buttons on this page. Save check_sysml.py in checker/scripts, SysMLBatchCheck.java in checker/scripts/sysml-launcher, and the two tool-proof files in checker/models. Keep the file names exactly; a browser that adds .txt to a name breaks the run.'),
  },
  {
    id: 'proof',
    title: 'Verify: run the tool proof',
    text: n('From the checker folder, run the two tool-proof files. The first run takes about half a minute longer, because the launcher is compiled and the standard library is loaded. The pass file must report PASS with no message, and the fail file must FAIL at line 9, column 12, at the unquoted short name: that second result proves the checker can fail.'),
    commands: {
      windows: ['cd "$HOME\\sysml-checker\\checker"', 'python -I scripts\\check_sysml.py models\\tool_proof_pass.sysml models\\invalid_tool_proof_unquoted_id.sysml --report models\\proof-report.json'],
      macos: ['cd ~/sysml-checker/checker', 'python3 -I scripts/check_sysml.py models/tool_proof_pass.sysml models/invalid_tool_proof_unquoted_id.sysml --report models/proof-report.json'],
      linux: ['cd ~/sysml-checker/checker', 'python3 -I scripts/check_sysml.py models/tool_proof_pass.sysml models/invalid_tool_proof_unquoted_id.sysml --report models/proof-report.json'],
    },
    note: n('Copy the whole output into your team’s checker log: it is the first section of team-NN-checker-log.txt.'),
  },
  {
    id: 'model',
    title: 'Run your own model',
    text: n('Export model v0.1 from the lab tool, save it in checker/models and run it the same way, naming your file. Run it again after every change until it reports PASS with zero errors, and explain every warning in the log. Always name the files to check: run with no file name, the script looks for a course folder that your kit does not have.'),
    commands: {
      windows: ['python -I scripts\\check_sysml.py models\\team-07-model-v01.sysml --report models\\model-report.json'],
      macos: ['python3 -I scripts/check_sysml.py models/team-07-model-v01.sysml --report models/model-report.json'],
      linux: ['python3 -I scripts/check_sysml.py models/team-07-model-v01.sysml --report models/model-report.json'],
    },
  },
]

// ------------------------------------------------------------------------------------------- recorded outputs
type Diag = { severity: string; line: number | null; column: number | null; message: string }
type Entry = { file: string; status: string; diagnostics: Diag[] }
const REPORT = report as unknown as { tool: { name: string; release: string; kernelVersion: string }; java: { version: string }; files: Entry[] }
const entry = (file: string): Entry => {
  const e = REPORT.files.find((x) => x.file.replace(/\\/g, '/').endsWith(`/${file}`))
  if (!e) throw new Error(`${file} is not in the Week 8 checker report`)
  return e
}
/** One file's result as check_sysml.py prints it (print_results): the status with its expectation, then each
 *  diagnostic as `severity line:column message`. `shownAs` is the path as the kit layout prints it. */
export function resultLines(file: string, shownAs: string): string[] {
  const e = entry(file)
  const expected = file.startsWith('invalid_') ? 'FAIL' : 'PASS'
  const label = `${e.status.padEnd(5)} (expected ${expected}: ${e.status === expected ? 'OK' : 'MISMATCH'})`
  return [`${label}  ${shownAs}`, ...e.diagnostics.map((d) => `         ${d.severity.padEnd(7)} ${(d.line !== null ? `${d.line}:${d.column}` : '-').padEnd(8)} ${d.message}`)]
}
/** The whole console output of a run on `files` (kit layout, models/ folder), as recorded by the course run. */
export function recordedRun(files: string[]): string[] {
  const es = files.map(entry)
  const count = (s: string) => es.filter((e) => e.status === s).length
  return [
    `${REPORT.tool.name} release ${REPORT.tool.release} (kernel ${REPORT.tool.kernelVersion}), Java ${REPORT.java.version}, library load … s`,
    ...files.flatMap((f) => resultLines(f, `models/${f}`)),
    '',
    `${files.length} file(s): ${count('PASS')} PASS, ${count('FAIL')} FAIL, ${count('ERROR')} ERROR. Report: models/proof-report.json`,
  ]
}
export const PROOF_FILES = ['tool_proof_pass.sysml', 'invalid_tool_proof_unquoted_id.sysml'] as const
export const PROOF_OUTPUT = recordedRun([...PROOF_FILES])

/** How to read the output: each part of the recorded proof run, explained. */
export const READ_OUTPUT: { part: string; meaning: string }[] = [
  { part: 'First line', meaning: 'The tool, its release (2026-08) and kernel (0.62.0), and the Java version. If the release is not 2026-08, you installed a different pilot implementation: grades follow the 2026-08 release.' },
  { part: 'PASS (expected PASS: OK)', meaning: 'The file parsed, every name resolved and no rule fired. The expectation comes from the file name: a file named invalid_… is expected to fail, any other file to pass.' },
  { part: 'FAIL (expected FAIL: OK)', meaning: 'At least one ERROR. For the tool-proof fail file this is the right result.' },
  { part: 'ERROR 9:12 mismatched input …', meaning: 'Severity, line:column, message. Go to that line and column; a syntax error is often reported a token or two after the real mistake, so read the start of the line and the line before it too. One mistake can cause several errors further on: fix the first one and run again.' },
  { part: 'WARNING …', meaning: 'Reported, but the file still passes. Read it anyway (a duplicate name usually means two elements got the same ID or name), and explain each warning in the checker log.' },
  { part: 'Summary line', meaning: 'Counts of PASS, FAIL and ERROR, and where the JSON report was written. ERROR in the count (not in a diagnostic) means the tool itself failed on that file: see troubleshooting.' },
]

export const TROUBLESHOOTING: { symptom: string; fix: string }[] = [
  { symptom: '“SysML reference validator is NOT installed; no file was validated.”', fix: 'The script lists each missing part and the exact path where it looked. Compare with the folder layout: usually jdk-21 or sysml-pilot-2026-08 is misnamed, or the kernel was unpacked one folder too deep or too shallow (the jar must be at tools/sysml-pilot-2026-08/kernel/sysml/jupyter-sysml-kernel-0.62.0-all.jar).' },
  { symptom: '`python` is not recognized, or opens the Microsoft Store (Windows)', fix: 'Install Python 3 from python.org (tick “Add python.exe to PATH”), open a new PowerShell window, or use `py -3` in place of `python` in every command.' },
  { symptom: '“portable JDK 21 (javac)” is missing', fix: 'You downloaded a JRE. Download the JDK archive (its name contains “jdk”, not “jre”) and repeat step 2.' },
  { symptom: 'macOS: “jdk-21/bin/java: No such file or directory”', fix: 'The macOS archive keeps Java inside Contents/Home. Move jdk-21.0.12.1+1/Contents/Home to tools/jdk-21, as in step 2.' },
  { symptom: 'The checksum differs from the one in the guide', fix: 'Delete the file and download it again. If it still differs, do not use it: tell the teaching assistant.' },
  { symptom: '“Compiling the launcher failed”', fix: 'SysMLBatchCheck.java is missing, misnamed (for example SysMLBatchCheck.java.txt) or not in checker/scripts/sysml-launcher. Save it again from this page.' },
  { symptom: '“No such file or directory: …”', fix: 'Run the command from the checker folder (step 5 starts with cd), and name the file with the models/ folder in front.' },
  { symptom: 'A download is blocked or very slow on the campus or company network', fix: 'Use another network, or run your files on your team’s installation or a lab machine; tell the teaching assistant before Session 2.' },
  { symptom: '“The SysML tool did not produce trustworthy results; NOTHING is reported as PASS.”', fix: 'Run the command once more. If it happens again, keep the full output and use the team installation or a lab machine while the teaching assistant looks at it.' },
  { symptom: 'Windows: the unpack command ends in a Traceback (FileNotFoundError), often on a file under sysml.library', fix: 'The folder path is too long for Windows. Delete tools\\sysml-pilot-2026-08, move sysml-checker higher up, for example C:\\sysml-checker, adjust the paths in the commands and unpack again. A part-unpacked library can still start the checker, so never skip this.' },
  { symptom: 'Your own model FAILS', fix: 'That is not an installation problem: the checker is working. Read the first ERROR, fix that line and run again. The fail file of the tool proof shows what a correct FAIL looks like.' },
]

export const FALLBACK = n(
  'No working installation by Session 2? Run the two tool-proof files on your team’s installation, or on a lab machine at the Session 2 checkpoint, and keep both outputs for the log. A team with no working installation at all books a fix with the teaching assistant before day 3 of the lab: the final checker run is part of the submission.',
)
export const TESTED_NOTE = n(
  'Tested by the course team on Windows 11 with this exact layout and these commands (2026-10-19). The macOS and Linux commands use the same layout and the publisher’s archive formats but have not yet been run by the course team: if a step behaves differently on your computer, tell the teaching assistant, and use a lab machine in the meantime.',
)

/** Files the page offers for download: the course script and launcher (the course's own copies, so they never drift)
 *  and the two tool-proof files (the files the checker validated). */
export const DOWNLOADS: { name: string; saveIn: string; what: string; text: () => string }[] = [
  { name: 'check_sysml.py', saveIn: 'checker/scripts/', what: 'the course script that runs the checker', text: () => checkerPy },
  { name: 'SysMLBatchCheck.java', saveIn: 'checker/scripts/sysml-launcher/', what: 'the launcher the script compiles on its first run', text: () => launcherJava },
  ...PROOF_FILES.map((f) => ({ name: f, saveIn: 'checker/models/', what: f.startsWith('invalid_') ? 'tool proof, file 2: must FAIL' : 'tool proof, file 1: must PASS', text: () => sysmlSource(`lectures/week08/${f}`) ?? '' })),
]

// ------------------------------------------------------------------------------------------- Markdown section
const fence = (lines: string[]) => ['```', ...lines, '```']
/** The guide as a Markdown section of the lab instructions (heading level 2). */
export function checkerMarkdown(): string[] {
  const L: string[] = [`## ${CHECKER_TITLE}`, '', '> The same guide, with download buttons for the course files, is on the Laboratory page (`#/week/8/lab/checker`).', '', CHECKER_WHO.text, '', CHECKER_WHAT.text, '', '### Prerequisites', '']
  for (const p of PREREQUISITES) L.push(`- ${p}`)
  L.push('', '### Folder layout', '', ...fence(LAYOUT), '')
  STEPS.forEach((s, i) => {
    L.push(`### Step ${i + 1}. ${s.title}`, '', s.text.text, '')
    if (s.id === 'scripts') for (const d of DOWNLOADS) L.push(`- \`${d.name}\` → \`${d.saveIn}\` (${d.what})`)
    if (s.id === 'scripts') L.push('')
    if (s.commands) for (const os of Object.keys(OS_LABEL) as OsKey[]) L.push(`${OS_LABEL[os]}:`, '', ...fence(s.commands[os]), '')
    if (s.note) L.push(s.note.text, '')
  })
  L.push('### Expected output of the tool proof (recorded course run)', '', ...fence(PROOF_OUTPUT), '', 'Your paths and the library load time will differ; the PASS and FAIL lines and the diagnostic must not.', '')
  L.push('### Reading the output', '')
  for (const r of READ_OUTPUT) L.push(`- **${r.part}.** ${r.meaning}`)
  L.push('', '### Troubleshooting', '', '| Symptom | What to do |', '|---|---|')
  for (const t of TROUBLESHOOTING) L.push(`| ${t.symptom.replace(/\|/g, '\\|')} | ${t.fix.replace(/\|/g, '\\|')} |`)
  L.push('', `**Fallback.** ${FALLBACK.text}`, '', `*${TESTED_NOTE.text}*`, '')
  return L
}
