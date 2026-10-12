// Week 1 Principles view: the systems-thinking principles explorer.
import { PrinciplesExplorer } from '../../components/Week1Exercises'
import week01 from '../../content/weeks/week01'
import { Lead } from './Lead'

export default function PrinciplesView() {
  return (
    <div className="wb-view-body" data-testid="view-principles">
      <Lead>{week01.activities.find((a) => a.id === 'w1-act-principles')!.purpose}</Lead>
      <PrinciplesExplorer />
    </div>
  )
}
