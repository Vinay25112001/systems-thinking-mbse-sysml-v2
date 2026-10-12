// Status bar: model health, TPM margins (when the model has TPMs), mission progress and persistence state.
import { useWorkbench } from '../context'
import { countBySeverity } from '../problems'

function tpmMargins(wb: ReturnType<typeof useWorkbench>) {
  return wb.state.model.elements
    .filter((e) => e.kind === 'TPM' && e.status === 'active')
    .flatMap((e) => {
      const a = e.attributes ?? {}
      const th = Number(a.threshold)
      const est = Number(a.currentEstimate)
      if (!Number.isFinite(th) || !Number.isFinite(est)) return []
      const margin = +(a.sense === 'higher-is-better' ? est - th : th - est).toFixed(2)
      return [{ id: e.id, margin, unit: String(a.unit ?? '') }]
    })
}

const focusRegion = (r: string) => requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-wb-region="${r}"]`)?.focus())

export function StatusBar() {
  const wb = useWorkbench()
  const c = countBySeverity(wb.problems)
  const tpms = tpmMargins(wb)
  const e = wb.evals.find((x) => x.mission.id === wb.missionId) ?? wb.evals[0]
  const idx = wb.evals.indexOf(e)
  const done = wb.evals.filter((x) => x.complete).length
  return (
    <footer className="wb-status wb-region" data-wb-region="status" data-wb-always-visible="true" tabIndex={-1} aria-label="Status bar" data-testid="status-bar">
      <button
        type="button"
        className="wb-status-btn"
        title="Open the Problems list"
        onClick={() => {
          wb.showDock('problems', { expand: true })
          focusRegion('dock')
        }}
      >
        Model health: <b className={c.error ? 'bad' : 'ok'}>{c.error} error{c.error === 1 ? '' : 's'}</b> · <b className={c.warning ? 'warn' : ''}>{c.warning} warning{c.warning === 1 ? '' : 's'}</b>
        {c.info ? ` · ${c.info} note${c.info === 1 ? '' : 's'}` : ''}
      </button>
      {tpms.map((t) => (
        <span key={t.id}>
          {t.id}{' '}
          <b className={t.margin < 0 ? 'bad' : 'ok'}>
            {t.margin > 0 ? '+' : ''}
            {t.margin} {t.unit}
          </b>
        </span>
      ))}
      <button type="button" className="wb-status-btn" title="Go to the mission brief" onClick={() => focusRegion('brief')}>
        Mission {idx + 1} · step {Math.min(e.current + 1, e.total)} of {e.total}
        {e.complete ? ' · complete' : ''}
      </button>
      <span>
        Missions: <b>{done}</b>/{wb.evals.length}
      </span>
      <span className="ml-auto">{wb.storageOk ? 'Saved in this browser' : 'Storage unavailable: work is not saved'}</span>
    </footer>
  )
}
