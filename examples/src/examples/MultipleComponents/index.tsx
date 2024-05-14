import { LayoutDirection, ProcessMining } from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'
import { useMemo } from 'react'

export default function App() {
  const options = useMemo(() => ({ direction: 'left-to-right' as LayoutDirection }), [])
  return (
    <>
      <ProcessMining eventLog={EventLog} timestamp={2} layoutOptions={options}></ProcessMining>
      <ProcessMining eventLog={EventLog} timestamp={6}></ProcessMining>
    </>
  )
}
