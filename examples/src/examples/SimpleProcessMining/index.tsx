import { ProcessMining } from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'

/**
 * The most basic usage of the process mining component without any customizations.
 */
export default function SimpleProcessMining() {
  return <ProcessMining eventLog={EventLog}></ProcessMining>
}
