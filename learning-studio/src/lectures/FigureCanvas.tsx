// #/figure/:id — one registered figure alone on a clean 1600×900 canvas in the light theme, whatever the viewer's
// theme preference (the .lec-light class pins the light tokens). scripts/build-lectures.mjs screenshots it for the .pptx.
import { useEffect } from 'react'
import { FIGURE_REGISTRY } from '../components/figures/registry'
import { FigureDrawing } from './Blocks'

export default function FigureCanvas({ id }: { id: string }) {
  const entry = FIGURE_REGISTRY[id]
  useEffect(() => {
    document.title = `Figure ${id}`
  }, [id])
  return (
    <main className="lec-light lec-canvas" data-testid="figure-canvas" data-figure={id} data-ready={entry ? 'true' : 'false'}>
      {entry ? <FigureDrawing figure={{ id, alt: entry.title }} /> : <p>Figure “{id}” is not registered.</p>}
    </main>
  )
}
