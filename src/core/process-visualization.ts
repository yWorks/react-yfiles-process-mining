import { IEnumerable, IGraph } from 'yfiles'
import { ActivityEvent } from '../ProcessMining.tsx'
import { getProcessStepData, getTransitionData } from './process-graph-extraction.ts'
import { TransitionEventVisualSupport } from '../styles/TransitionEventVisual.ts'

/**
 * Prepares the graph for the visualization of heat and events.
 * The nodes are associated with data about the workload.
 */
export function prepareProcessVisualization<TEvent extends ActivityEvent>(
  graph: IGraph,
  eventLog: TEvent[],
  transitionEventStyling: (
    previousEvent: TEvent,
    nextEvent: TEvent
  ) => { size: number; hue: number },
  transitionEventVisualSupport: TransitionEventVisualSupport
): number {
  const eventsByActivities = Object.fromEntries(
    IEnumerable.from(eventLog).groupBy(
      event => event.activity,
      (activity, events) => [activity, events?.toList()]
    )
  )

  // determine the heat over time for each process step
  graph.nodes.forEach(processStep => {
    const processStepData = getProcessStepData(processStep)
    const events = eventsByActivities[processStepData.label]

    // add the event's heat value for its duration
    events?.forEach(event => {
      processStepData.heat!.addValues(
        event.timestamp,
        event.timestamp + (event.duration ?? 0),
        event.cost ?? 1
      )
    })

    processStepData.capacity = processStepData.heat!.getMaxValue()
  })

  // determine the heat over time for each transition
  graph.edges.forEach(transition => {
    const transitionData = getTransitionData(transition)
    const sourceEvents = eventsByActivities[transitionData.sourceLabel]
    const targetEvents = eventsByActivities[transitionData.targetLabel]

    const allEvents = sourceEvents!.concat(targetEvents)
    allEvents
      .groupBy(
        event => event.caseId,
        (caseId, events) => events?.toArray() ?? []
      )
      .filter(events => events.length > 1)
      .map(events => events.sort((event1, event2) => event1.timestamp - event2.timestamp))
      .forEach(events => {
        // skip the last event if there is an odd number of events
        const count = events.length % 2 === 0 ? events.length - 1 : events.length - 2
        for (let i = 0; i < count; i += 2) {
          // add the transition's heat value for its duration
          transitionData.heat!.addValues(events[i].timestamp, events[i + 1].timestamp, 1)

          // add an item to the transition representing the event
          const { hue, size } = transitionEventStyling(events[0], events[1])
          transitionEventVisualSupport.addItem(
            transition,
            false,
            events[0].timestamp,
            events[1].timestamp,
            size,
            hue / 360
          )
        }
      })

    transitionData.capacity = transitionData.heat!.getMaxValue()
  })

  // return the maximum time
  const maxTime =
    eventLog
      .sort((event1: ActivityEvent, event2: ActivityEvent) => event1.timestamp - event2.timestamp)
      .at(-1)?.timestamp ?? 0
  return maxTime + 1
}
