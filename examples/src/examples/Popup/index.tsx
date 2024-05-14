import { ProcessMining, RenderPopup } from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'

/**
 * An example App showcasing the popup functionality of the process mining component.
 */
export default () => {
  return <ProcessMining eventLog={EventLog} timestamp={5} renderPopup={RenderPopup}></ProcessMining>
}
