import { ProcessMining, TransitionStyle, ProcessStep } from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'
import './index.css'

function transitionStyles(source: ProcessStep): TransitionStyle | undefined {
  if (source.label === 'Evaluation') {
    return {
      thickness: 5,
      className: 'dashed-transition',
      targetArrow: { type: 'triangle' }
    }
  }
  return undefined
}

/**
 * A process mining component with a custom transition style.
 */
export default function TransitionStyles() {
  return (
    <ProcessMining
      eventLog={EventLog}
      transitionStyles={transitionStyles}
      smartClickNavigation={true}
    ></ProcessMining>
  )
}
