import {
  ProcessMining,
  ProcessMiningProvider,
  useProcessMiningContext
} from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'
import { useState } from 'react'

const maxTime = 30

/**
 * A process mining component providing export and save to image functionalities.
 * Currently, the heatmap and the transition events cannot be exported or printed.
 */
function ProcessMiningWrapper() {
  const { exportToSvg, exportToPng, print } = useProcessMiningContext()
  const [timestamp, setTimestamp] = useState(5)
  const { startAnimation, stopAnimation } = useProcessMiningContext()

  return (
    <ProcessMining eventLog={EventLog} timestamp={timestamp}>
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
        <div style={{ display: 'flex', marginTop: 10 }}>
          <button onClick={() => startAnimation(t => setTimestamp(t), timestamp, maxTime, 10000)}>
            Play
          </button>
          <button onClick={stopAnimation}>Stop</button>
        </div>
        <div style={{ display: 'flex', marginTop: 10 }}>
          <div className="toolbar">
            <button className="toolbar-button" onClick={async () => await print({ scale: 2 })}>
              Print
            </button>
            <button
              className="toolbar-button"
              onClick={async () => await exportToSvg({ scale: 2 })}
            >
              Export to SVG
            </button>
            <button
              className="toolbar-button"
              onClick={async () => await exportToPng({ scale: 2 })}
            >
              Export to PNG
            </button>
          </div>
        </div>
      </div>
    </ProcessMining>
  )
}

export default () => {
  return (
    <ProcessMiningProvider>
      <ProcessMiningWrapper></ProcessMiningWrapper>
    </ProcessMiningProvider>
  )
}
