// Week 1 Stakeholders view: the Week 2 stakeholder editor, open early, with the workbench density layer (.wb-embed).
import { StakeholderEditorPage } from '../../pages/StakeholderEditorPage'
import { Lead } from './Lead'

export default function StakeholdersView() {
  return (
    <div className="wb-view-body wb-embed" data-testid="view-stakeholders">
      <Lead>The stakeholder ecosystem editor is the Week 2 lab tool, open early. Each EXT that is an organisation reappears here as a stakeholder in Week 2.</Lead>
      <StakeholderEditorPage />
    </div>
  )
}
