import {
  ProcessMining,
  ProcessMiningProvider,
  ProcessStep
} from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'
import { useCallback, useState } from 'react'
import './index.css'

/**
 * This process mining component shows how to handle select, hover and focus events.
 */
function ProcessMiningWrapper() {
  const [focusedItem, setFocusedItem] = useState<ProcessStep | null>(null)
  const [selectedItem, setSelectedItem] = useState<ProcessStep | null>(null)
  const [hoveredItem, setHoveredItem] = useState<ProcessStep | null>(null)

  const onFocus = useCallback((item: ProcessStep | null) => {
    setFocusedItem(item)
  }, [])

  const onSelect = useCallback((items: ProcessStep[]) => {
    setSelectedItem(items.length ? items[0] : null)
  }, [])

  const onHover = useCallback((item: ProcessStep | null) => {
    setHoveredItem(item)
  }, [])

  return (
    <>
      <ProcessMining
        eventLog={EventLog}
        onItemHover={onHover}
        onItemFocus={onFocus}
        onItemSelect={onSelect}
      ></ProcessMining>
      <div className="sidebar">
        <div className="info-panel">
          <div>
            <span>Focused: </span>
            <span>{focusedItem?.label ?? 'No item clicked'}</span>
          </div>
          <div>
            <span>Selected: </span>
            <span>{selectedItem?.label ?? 'No item selected'}</span>
          </div>
          <div>
            <span>Hovered: </span>
            <span>{hoveredItem?.label ?? 'No item hovered'}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default () => {
  return (
    <ProcessMiningProvider>
      <ProcessMiningWrapper></ProcessMiningWrapper>
    </ProcessMiningProvider>
  )
}
