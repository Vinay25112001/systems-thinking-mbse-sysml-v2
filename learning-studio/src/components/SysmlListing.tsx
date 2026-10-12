import { useEffect, useState } from 'react'
import type { SysmlListing } from '../content/schema'
import { reportEntry, sha256Hex, sysmlSource, toolLabel } from '../lib/sysml'
import { Badge } from './ui'

type Verdict = { tone: 'emerald' | 'rose' | 'amber' | 'slate' | 'violet'; text: string }

export function SysmlListingView({ listing }: { listing: SysmlListing }) {
  const src = sysmlSource(listing.file)
  const [verdict, setVerdict] = useState<Verdict>({ tone: 'slate', text: 'Checking validation record…' })

  useEffect(() => {
    let live = true
    const entry = reportEntry(listing.file)
    if (!src) return
    if (!entry) {
      setVerdict({ tone: 'amber', text: 'Not yet validated by the reference implementation' })
      return
    }
    sha256Hex(src).then((h) => {
      if (!live) return
      if (h !== entry.sha256) setVerdict({ tone: 'amber', text: 'Changed since last validation — re-run npm run content:sysml' })
      else if (listing.intent === 'conformant')
        setVerdict(entry.status === 'PASS' ? { tone: 'emerald', text: `Accepted by ${toolLabel()}` } : { tone: 'rose', text: 'Rejected by the reference implementation' })
      else setVerdict(entry.status === 'FAIL' ? { tone: 'violet', text: 'Intentionally invalid — rejected by the reference implementation, as expected' } : { tone: 'rose', text: 'Expected to be invalid but the tool accepted it' })
    })
    return () => {
      live = false
    }
  }, [src, listing.file, listing.intent])

  if (!src) return <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">Missing SysML listing {listing.file}</p>
  return (
    <figure className="rounded-lg border border-slate-200 dark:border-slate-800" data-testid={`sysml-${listing.file}`}>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-1.5 text-xs dark:border-slate-800">
        <span>
          <span className="font-mono">{listing.file}</span> — {listing.caption}
        </span>
        <Badge tone={verdict.tone}>{verdict.text}</Badge>
      </figcaption>
      <pre className="overflow-x-auto bg-slate-50 p-3 text-xs leading-relaxed dark:bg-slate-950" tabIndex={0} aria-label={`SysML v2 textual notation: ${listing.caption}`}>
        <code>{src}</code>
      </pre>
    </figure>
  )
}
