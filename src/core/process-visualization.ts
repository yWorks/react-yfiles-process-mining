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
    let allEvents
    if (transition.isSelfloop) {
      allEvents = eventsByActivities[transitionData.sourceLabel]
      allEvents.sort((event1, event2) => event1.timestamp - event2.timestamp)
      allEvents = allEvents.map((event, index) => ({
        source: index % 2 === 0,
        event
      }))
    } else {
      const sourceEvents = eventsByActivities[transitionData.sourceLabel].map(event => ({
        source: true,
        event
      }))
      const targetEvents = eventsByActivities[transitionData.targetLabel].map(event => ({
        source: false,
        event
      }))
      allEvents = sourceEvents!.concat(targetEvents)
    }

    allEvents
      .groupBy(
        event => event.event.caseId,
        (caseId, events) => events?.toArray() ?? []
      )
      .filter(events => events.length > 1)
      .map(events =>
        events.sort((event1, event2) => event1.event.timestamp - event2.event.timestamp)
      )
      .forEach(events => {
        for (let i = 0; i < events.length - 1; i++) {
          if (events[i].source && !events[i + 1].source) {
            const event = events[i].event
            const nextEvent = events[i + 1].event

            // add the transition's heat value for its duration
            transitionData.heat!.addValues(event.timestamp, nextEvent.timestamp, 1)

            // add an item to the transition representing the event
            const { hue, size } = transitionEventStyling(event, nextEvent)
            transitionEventVisualSupport.addItem(
              transition,
              false,
              event.timestamp,
              nextEvent.timestamp,
              size,
              hue / 360
            )
          }
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
