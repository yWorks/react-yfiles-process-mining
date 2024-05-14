import { ProcessMining, RenderTooltip } from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'

/**
 * An example App showcasing the tooltip functionality of the process mining component.
 */
export default () => {
  return (
    <ProcessMining eventLog={EventLog} timestamp={5} renderTooltip={RenderTooltip}></ProcessMining>
  )
}
