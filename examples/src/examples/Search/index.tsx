import {
  ProcessMining,
  ProcessMiningProvider,
  ProcessStep,
  useProcessMiningContext
} from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'
import { KeyboardEvent, useState } from 'react'

/**
 * This process mining component offers search functionality.
 * Pressing the 'enter' key will zoom to the elements that match the given search query.
 */
function ProcessMiningWrapper() {
  const processMiningContext = useProcessMiningContext()

  const [searchQuery, setSearchQuery] = useState('')
  const onSearchEnter = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      processMiningContext.zoomTo(processMiningContext.getSearchHits())
    }
  }

  return (
    <>
      <ProcessMining
        eventLog={EventLog}
        searchNeedle={searchQuery}
        onSearch={(data: ProcessStep, searchQuery: string) =>
          data.label?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
        }
      ></ProcessMining>
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 10
        }}
      >
        <input
          className="search"
          type={'search'}
          placeholder="Search..."
          onChange={event => {
            setSearchQuery(event.target.value)
          }}
          onKeyDown={onSearchEnter}
        />
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
