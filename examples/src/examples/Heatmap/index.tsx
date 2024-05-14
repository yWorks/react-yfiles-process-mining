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
function Heatmap() {
  const [timestamp, setTimestamp] = useState(0)
  const [showHeatmap, setShowHeatmap] = useState(true)

  const { startAnimation, stopAnimation } = useProcessMiningContext()

  return (
    <ProcessMining eventLog={EventLog} timestamp={timestamp} showHeatmap={showHeatmap}>
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
          <button onClick={() => startAnimation(t => setTimestamp(t), timestamp, maxTime, 10000)}>
            play
          </button>
          <button onClick={stopAnimation}>stop</button>
        </div>
        <label>Show Heatmap</label>
        <input
          type="checkbox"
          checked={showHeatmap}
          onChange={e => {
            setShowHeatmap((e.target as HTMLInputElement).checked)
          }}
        />
      </div>
    </ProcessMining>
  )
}

export default () => {
  return (
    <ProcessMiningProvider>
      <Heatmap></Heatmap>
    </ProcessMiningProvider>
  )
}
