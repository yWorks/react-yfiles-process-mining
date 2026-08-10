---
name: react-yfiles-process-mining

description: Use this skill when working with the yFiles React Process Mining component in a React application. This includes creating, adding, integrating, configuring, troubleshooting, or extending the component or workflow. Trigger for process maps, event logs, activities, transitions, heatmaps, performance or duration analysis, slow activities, bottlenecks, variants, search, styling, tooltips, selection, zooming, or layout, including requests that do not mention yFiles or the package name explicitly.
---

# yFiles React Process Mining

Use `@yworks/react-yfiles-process-mining` with an `ActivityEvent[]` event log. Ensure the data is suitable, the yFiles license is registered, the stylesheet is imported, and the component API is used correctly.

## Data preparation

Convert source events to this shape before passing them to `ProcessMining`:

```ts
type ActivityEvent = {
  caseId: number | string // entity moving through the process
  activity: string // executed activity
  timestamp: number // one unit and fixed origin for all events
  duration?: number // same unit as timestamp
  cost?: number // cost associated with the event
}
```

## Minimal react example

Register the license and import the stylesheet; both are required.

```tsx
import {
  ProcessMining,
  registerLicense,
  type ActivityEvent
} from '@yworks/react-yfiles-process-mining'

import '@yworks/react-yfiles-process-mining/dist/index.css'
import yFilesLicense from '<yFiles package path>/lib/license.json'

registerLicense(yFilesLicense)

const eventLog: ActivityEvent[] = [
  { caseId: 0, activity: 'Start', timestamp: 8383, duration: 1 },
  { caseId: 0, activity: 'Step A', timestamp: 8928, duration: 103 },
  { caseId: 0, activity: 'Step B', timestamp: 9577, duration: 41 },
  { caseId: 0, activity: 'End', timestamp: 10163, duration: 275 }
]

export default function App() {
  return <ProcessMining eventLog={eventLog} />
}
```

Replace `eventLog` with suitable application data and `<yFiles package path>` with the actual downloaded package directory.

## References

- Use the [component feature overview](references/features.md) to choose appropriate capabilities.
- Use the [complete API documentation](references/api.md) for exact props, types, and configuration.