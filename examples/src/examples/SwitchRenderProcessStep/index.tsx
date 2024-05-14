import { ComponentType, useState } from 'react'
import {
  ProcessMining,
  RenderHeatGauge,
  RenderProcessStepProps
} from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'
import './index.css'

function RenderProcessStepGauge({ dataItem, timestamp }: RenderProcessStepProps) {
  const heat = Math.min(1, dataItem.heat!.getValue(timestamp ?? 0) / (dataItem.capacity ?? 100))
  const currentHeat = Math.floor((heat ?? 0) * 30) / 30
  const gaugeSize = 43
  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%'
        }}
        className="render-process-step-gauge"
      >
        <RenderHeatGauge size={gaugeSize} heat={currentHeat}></RenderHeatGauge>
      </div>
    </>
  )
}

function RenderProcessStepText({ dataItem }: RenderProcessStepProps) {
  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%'
        }}
        className="render-process-step-text"
      >
        {dataItem.label}
      </div>
    </>
  )
}

export default () => {
  const [renderProcessStep, setRenderProcessStep] = useState<ComponentType<RenderProcessStepProps>>(
    () => RenderProcessStepGauge
  )

  return (
    <>
      <button
        onClick={() =>
          setRenderProcessStep(() => {
            if (renderProcessStep === RenderProcessStepText) {
              return RenderProcessStepGauge
            } else {
              return RenderProcessStepText
            }
          })
        }
      >
        Toggle Process Step Component
      </button>
      <ProcessMining
        eventLog={EventLog}
        timestamp={5}
        renderProcessStep={renderProcessStep as ComponentType<RenderProcessStepProps>}
      ></ProcessMining>
    </>
  )
}
