import { ActivityEvent } from '../ProcessMining.tsx'
import { GraphComponent, type IEdge, IEnumerable, type INode, LayoutExecutor } from '@yfiles/yfiles'
import { HeatData } from '../styles/HeatData.ts'

// We need to load the 'view-layout-bridge' module explicitly to prevent tree-shaking
// tools it from removing this dependency which is needed for 'applyLayout'.
LayoutExecutor.ensure()

/**
 * Type that describes one step in the process.
 * This information is associated with every node in the graph.
 */
export type ProcessStep = {
  label: string
  heat?: HeatData
  capacity?: number
  width?: number
  height?: number
}

/**
 * Type that describes one transition in the process.
 * This information is associated with every edge in the graph.
 */
export type Transition = {
  sourceLabel: string
  targetLabel: string
  heat?: HeatData
  capacity?: number
}

/**
 * Returns the information for the given process step.
 */
export function getProcessStepData(step: INode): ProcessStep {
  return step.tag as ProcessStep
}

/**
 * Returns the information for the given transition.
 */
export function getTransitionData(transition: IEdge): Transition {
  return transition.tag as Transition
}

/**
 * Creates default information for a process step with the given activity.
 */
function createProcessStepData(activity: string): ProcessStep {
  return {
    label: activity,
    heat: new HeatData(128, 0, 30),
    capacity: 1
  }
}

/**
 * Creates default information for a transition between the given activities.
 */
function createTransitionData(sourceActivity: string, targetActivity: string): Transition {
  return {
    sourceLabel: sourceActivity,
    targetLabel: targetActivity,
    heat: new HeatData(128, 0, 30),
    capacity: 1
  }
}

/**
 * Extracts a graph from the given event log which represents the process flow.
 */
export function extractGraph(eventLog: ActivityEvent[], graphComponent: GraphComponent): void {
  const graph = graphComponent.graph
  graph.clear()

  const activity2node = new Map<string, INode>()
  const activities2edge = new Map<string, IEdge>()

  // group events by case-id to get the path of each case through the process steps
  IEnumerable.from(eventLog)
    .groupBy(
      event => event.caseId,
      (caseId, events) => events?.toArray() ?? []
    )
    .forEach(events => {
      let lastEvent: ActivityEvent
      events
        // sort the events by timestamp to have the correct order of traversal
        .sort((event1, event2) => event1.timestamp - event2.timestamp)
        .forEach(event => {
          const activity = event.activity

          // add a node for the event's activity
          // if there is no node for this activity, yet
          let node = activity2node.get(activity)
          if (!node) {
            node = graph.createNode({
              // labels: [event.activity],
              tag: createProcessStepData(activity)
            })
            activity2node.set(activity, node)
          }

          // add an edge between the current and the last activity
          // if there is no edge for between them, yet
          const lastActivity = lastEvent?.activity
          let edge = activities2edge.get(lastActivity + activity)
          if (lastEvent && !edge) {
            const lastNode = activity2node.get(lastActivity)!
            edge = graph.createEdge({
              source: lastNode,
              target: node,
              tag: createTransitionData(lastActivity, activity)
            })
            activities2edge.set(lastActivity + activity, edge)
          }

          lastEvent = event
        })
    })

  graphComponent.fitGraphBounds()
}
