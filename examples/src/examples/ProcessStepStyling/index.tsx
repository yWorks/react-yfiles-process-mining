import {
  ProcessMining,
  ProcessMiningProvider,
  RenderProcessStep,
  RenderProcessStepProps
} from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'
import './index.css'

const renderInfo: { [key: string]: string } = {
  Start: 'input',
  'Early Discard': 'output',
  Backlog: 'output',
  Delivery: 'output',
  Store: 'output',
  Rejection: 'output'
}

function CustomProcessStep(props: RenderProcessStepProps) {
  const label = props.dataItem.label

  switch (renderInfo[label]) {
    case 'input':
      return <div className="input">{label}</div>
    case 'output':
      return <div className="output">{label}</div>
    default:
      return RenderProcessStep(props)
  }
}

/**
 * The most basic usage of the process mining component without any customizations.
 */
function ProcessStepStyling() {
  return (
    <ProcessMining
      eventLog={EventLog}
      timestamp={5.5}
      showHeatmap={false}
      showTransitionEvents={false}
      renderProcessStep={CustomProcessStep}
    ></ProcessMining>
  )
}

export default () => {
  return (
    <ProcessMiningProvider>
      <ProcessStepStyling></ProcessStepStyling>
    </ProcessMiningProvider>
  )
}
