import {
  ProcessMining,
  ProcessMiningProvider,
  useProcessMiningContext
} from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'
import { useRef } from 'react'

function Layout() {
  const { applyLayout } = useProcessMiningContext()

  const layoutDirectionRef = useRef<HTMLSelectElement>(null)

  return (
    <>
      <ProcessMining eventLog={EventLog} timestamp={5.5}></ProcessMining>
      <div style={{ position: 'absolute', top: 50, left: 10, display: 'flex', gap: 5 }}>
        Layout Direction:
        <select
          ref={layoutDirectionRef}
          onChange={() => {
            if (layoutDirectionRef.current) {
              const selectedValue = layoutDirectionRef.current.value as
                | 'top-to-bottom'
                | 'left-to-right'
                | 'bottom-to-top'
                | 'right-to-left'
              if (selectedValue) {
                void applyLayout({ direction: selectedValue }, true)
              }
            }
          }}
        >
          <option value="top-to-bottom">Top-to-bottom</option>
          <option value="left-to-right">Left-to-right</option>
          <option value="bottom-to-top">Bottom-to-top</option>
          <option value="right-to-left">Right-to-left</option>
        </select>
      </div>
    </>
  )
}

export default () => {
  return (
    <ProcessMiningProvider>
      <Layout></Layout>
    </ProcessMiningProvider>
  )
}
