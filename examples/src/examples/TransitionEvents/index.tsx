import {
  ProcessMining,
  ProcessMiningProvider,
  useProcessMiningContext
} from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'
import { useState } from 'react'

const maxTime = 30

/**
 * The most basic usage of the process mining component without any customizations.
 */
function TransitionEvents() {
  const [timestamp, setTimestamp] = useState(5)
  const [showTransitionEvents, setShowTransitionEvents] = useState(true)

  const { startAnimation, stopAnimation } = useProcessMiningContext()

  return (
    <ProcessMining
      eventLog={EventLog}
      timestamp={timestamp}
      showHeatmap={false}
      showTransitionEvents={showTransitionEvents}
      transitionEventStyling={(previousEvent, _) => {
        switch (previousEvent.caseId) {
          case 0:
            return { size: 15, hue: 360 }
          case 18:
            return { size: 15, hue: 60 }
          default:
            return {
              size: Math.random() * 3 + 5,
              hue: ((Math.random() * 0.2 + 0.5) / 4 + 0.4) * 360
            }
        }
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start'
        }}
      >
        <label>Time Stamp</label>
        <input
          type="range"
          min={0}
          max={maxTime}
          value={timestamp}
          onInput={e => {
            setTimestamp(parseFloat((e.target as HTMLInputElement).value))
          }}
        />
        <div style={{ display: 'flex' }}>
          <button onClick={() => startAnimation(t => setTimestamp(t), timestamp, maxTime, 100000)}>
            play
          </button>
          <button onClick={stopAnimation}>stop</button>
        </div>
        <label>Show Transition Event</label>
        <input
          type="checkbox"
          checked={showTransitionEvents}
          onChange={e => {
            setShowTransitionEvents((e.target as HTMLInputElement).checked)
          }}
        />
      </div>
    </ProcessMining>
  )
}

export default () => {
  return (
    <ProcessMiningProvider>
      <TransitionEvents></TransitionEvents>
    </ProcessMiningProvider>
  )
}
