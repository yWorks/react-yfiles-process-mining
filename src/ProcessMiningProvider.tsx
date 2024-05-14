import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import {
  exportImageAndSave,
  ExportSettings,
  exportSvgAndSave,
  printDiagram,
  PrintSettings,
  useGraphComponent,
  withGraphComponentProvider
} from '@yworks/react-yfiles-core'
import { ProcessMiningModel, ProcessMiningModelInternal } from './ProcessMiningModel.ts'
import {
  GraphComponent,
  HierarchicLayout,
  HierarchicLayoutData,
  HierarchicLayoutEdgeLayoutDescriptor,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutRoutingStyle,
  ICommand,
  IGraph,
  INode,
  MutableRectangle,
  NodeHalo
} from 'yfiles'
import { getProcessStepData, ProcessStep, Transition } from './core/process-graph-extraction.ts'
import { AnimationController } from './animation/AnimationController.ts'
import { ActivityEvent, LayoutOptions } from './ProcessMining.tsx'
import { TransitionEventVisualSupport } from './styles/TransitionEventVisual.ts'
import { prepareProcessVisualization } from './core/process-visualization.ts'

const ProcessMiningContext = createContext<ProcessMiningModel | null>(null)

export function useProcessMiningContextInternal(): ProcessMiningModel | null {
  return useContext(ProcessMiningContext)
}

/**
 * A hook that provides access to the {@link ProcessMiningModel} which has various functions that can be used to
 * interact with the {@link ProcessMining} diagram. It can only be used inside an {@link ProcessMining} component or an
 * {@link ProcessMiningProvider}.
 * @returns the {@link ProcessMiningModel} used in this context.
 *
 * ```tsx
 * function ProcessMiningWrapper() {
 *   const { fitContent, zoomToItem } = useProcessMiningContext()
 *
 *   return (
 *     <>
 *       <ProcessMining eventLog={eventLog} contextMenuItems={(item: ProcessStep | null) => {
 *           if (item) {
 *             return [{ title: 'Zoom to Item', action: () => item && zoomToItem(item) }]
 *           }
 *           return []
 *         }}>
 *       </ProcessMining>
 *       <Sidebar>
 *         <button onClick={fitContent}>Fit Content</button>
 *       </Sidebar>
 *     </>
 *   )
 * }
 *
 * function ProcessMiningDiagram() {
 *   return (
 *     <ProcessMiningProvider>
 *       <ProcessMiningWrapper></ProcessMiningWrapper>
 *     </ProcessMiningProvider>
 *   )
 * }
 * ```
 */
export function useProcessMiningContext(): ProcessMiningModel {
  const context = useContext(ProcessMiningContext)
  if (context === null) {
    throw new Error(
      'This method can only be used inside an Process Mining component or ProcessMiningProvider.'
    )
  }
  return context
}

/**
 * The ProcessMiningProvider component is a [context provider]{@link https://react.dev/learn/passing-data-deeply-with-context},
 * granting external access to the process mining diagram beyond the {@link ProcessMining} component itself.
 *
 * This functionality proves particularly valuable when there's a toolbar or sidebar housing elements that require
 * interaction with the process mining diagram. Examples would include buttons for zooming in and out or fitting the graph into the viewport.
 *
 * The snippet below illustrates how to leverage the ProcessMiningProvider, enabling a component featuring both a {@link ProcessMining} diagram
 * and a sidebar to utilize the {@link useProcessMiningContext} hook.
 *
 * ```tsx
 * function ProcessMiningWrapper() {
 *   const { fitContent, zoomToItem } = useProcessMiningContext()
 *
 *   return (
 *     <>
 *       <ProcessMining eventLog={eventLog} contextMenuItems={(item: ProcessStep | null) => {
 *           if (item) {
 *             return [{ title: 'Zoom to Item', action: () => item && zoomToItem(item) }]
 *           }
 *           return []
 *         }}>
 *       </ProcessMining>
 *       <Sidebar>
 *         <button onClick={fitContent}>Fit Content</button>
 *       </Sidebar>
 *     </>
 *   )
 * }
 *
 * function ProcessMiningDiagram() {
 *   return (
 *     <ProcessMiningProvider>
 *       <ProcessMiningWrapper></ProcessMiningWrapper>
 *     </ProcessMiningProvider>
 *   )
 * }
 * ```
 */
export const ProcessMiningProvider = withGraphComponentProvider(
  ({ children }: PropsWithChildren) => {
    const graphComponent = useGraphComponent()

    if (!graphComponent) {
      return children
    }

    const processMining = useMemo(() => {
      return createProcessMiningModel(graphComponent)
    }, [])

    return (
      <ProcessMiningContext.Provider value={processMining}>
        {children}
      </ProcessMiningContext.Provider>
    )
  }
)

const defaultMargins = { top: 5, right: 5, left: 5, bottom: 5 }

const defaultLayoutOptions: LayoutOptions = {
  direction: 'top-to-bottom',
  minimumLayerDistance: 20,
  nodeToNodeDistance: 10,
  nodeToEdgeDistance: 10,
  maximumDuration: Number.POSITIVE_INFINITY,
  edgeGrouping: false
}

/**
 * Creates the {@link ProcessMiningModel}.
 */
export function createProcessMiningModel<TEvent extends ActivityEvent>(
  graphComponent: GraphComponent
): ProcessMiningModelInternal<TEvent> {
  let onRenderedCallback: null | (() => void) = null

  // this is a hack, so we have something like `await nextTick()`
  // that we can use instead of `setTimeout()`
  const setRenderedCallback = (cb: () => void) => {
    onRenderedCallback = cb
  }
  const onRendered = () => {
    onRenderedCallback?.()
    onRenderedCallback = null
  }

  // initialize the animation
  const animationController = new AnimationController(graphComponent)

  function zoomTo(items: (ProcessStep | Transition)[]) {
    if (items.length === 0) {
      return
    }
    const targetBounds = new MutableRectangle()
    const graph = graphComponent.graph
    items.forEach(item => {
      if ('sourceLabel' in item && 'targetLabel' in item) {
        const source = getNode(item.sourceLabel, graph)!
        const target = getNode(item.targetLabel, graph)!

        const edge = graph.getEdge(source, target)
        if (edge) {
          targetBounds.add(edge.sourceNode!.layout)
          targetBounds.add(edge.targetNode!.layout)
        }
      } else {
        const node = getNode(item.label, graph)!
        targetBounds.add(node.layout)
      }
    })
    graphComponent.focus()
    void graphComponent.zoomToAnimated(targetBounds.toRect().getEnlarged(200))
  }

  let _showTransitionEvents: boolean
  let _eventLog: TEvent[]
  let _transitionEventStyling: (
    previousEvent: TEvent,
    nextEvent: TEvent
  ) => { size: number; hue: number }
  let _transitionEventVisualSupport: TransitionEventVisualSupport

  return {
    graphComponent,

    set showTransitionEvents(value: boolean) {
      _showTransitionEvents = value
    },

    set eventLog(value: TEvent[]) {
      _eventLog = value
    },

    set transitionEventStyling(
      value: (previousEvent: TEvent, nextEvent: TEvent) => { size: number; hue: number }
    ) {
      _transitionEventStyling = value
    },

    set transitionEventVisualSupport(value: TransitionEventVisualSupport) {
      _transitionEventVisualSupport = value
    },

    async startAnimation(
      progressCallback: (timestamp: number) => void,
      startTimestamp: number,
      endTimestamp: number,
      duration: number
    ): Promise<void> {
      await animationController.startAnimation(
        progress => progressCallback(startTimestamp + progress * (endTimestamp - startTimestamp)),
        duration
      )
    },

    stopAnimation() {
      animationController.stopAnimation()
    },

    async applyLayout(layoutOptions = defaultLayoutOptions, morphLayout = false) {
      if (_showTransitionEvents && _eventLog) {
        _transitionEventVisualSupport.hideVisual()
        _transitionEventVisualSupport.clearItems()
      }

      const layout = new HierarchicLayout({
        layoutOrientation: layoutOptions.direction,
        minimumLayerDistance: layoutOptions.minimumLayerDistance,
        nodeToNodeDistance: layoutOptions.nodeToNodeDistance,
        nodeToEdgeDistance: layoutOptions.nodeToEdgeDistance,
        maximumDuration: layoutOptions.maximumDuration,
        automaticEdgeGrouping: layoutOptions.edgeGrouping,
        edgeLayoutDescriptor: new HierarchicLayoutEdgeLayoutDescriptor({
          routingStyle: new HierarchicLayoutRoutingStyle(
            HierarchicLayoutEdgeRoutingStyle.CURVED,
            false
          )
        })
      })
      const layoutData = new HierarchicLayoutData({
        nodeHalos: () => NodeHalo.create(5)
      })
      await graphComponent.morphLayout({
        layout,
        morphDuration: morphLayout ? '1s' : '0s',
        layoutData,
        targetBoundsInsets: 50
      })

      if (_showTransitionEvents && _eventLog) {
        _transitionEventVisualSupport.showVisual(graphComponent)
      }

      if (_eventLog) {
        prepareProcessVisualization(
          graphComponent.graph,
          _eventLog,
          _transitionEventStyling ?? (() => ({ size: 7, hue: 200 })),
          _transitionEventVisualSupport
        )
      }
    },

    zoomToItem(item: ProcessStep | Transition) {
      zoomTo([item])
    },

    zoomTo,

    zoomIn() {
      ICommand.INCREASE_ZOOM.execute(null, graphComponent)
    },

    zoomOut() {
      ICommand.DECREASE_ZOOM.execute(null, graphComponent)
    },

    zoomToOriginal() {
      ICommand.ZOOM.execute(1.0, graphComponent)
    },

    fitContent() {
      ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
    },

    async exportToSvg(exportSettings: ExportSettings) {
      const settings = exportSettings ?? {
        zoom: graphComponent.zoom,
        scale: graphComponent.zoom,
        margins: defaultMargins,
        inlineImages: true
      }
      await exportSvgAndSave(settings, graphComponent, setRenderedCallback)
    },

    async exportToPng(exportSettings: ExportSettings) {
      const settings = exportSettings ?? {
        zoom: graphComponent.zoom,
        scale: 1.0,
        margins: defaultMargins
      }
      await exportImageAndSave(settings, graphComponent, setRenderedCallback)
    },

    async print(printSettings: PrintSettings) {
      const settings = printSettings ?? {
        zoom: graphComponent.zoom,
        scale: 1.0,
        margins: defaultMargins
      }
      await printDiagram(settings, graphComponent)
    },

    refresh() {
      graphComponent.invalidate()
    },
    getSearchHits: () => [], // will be replaced during initialization
    onRendered
  }
}

export function getNode(label: string, graph: IGraph): INode | null {
  return graph.nodes.find(node => getProcessStepData(node).label === label)
}
