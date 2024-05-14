import {
  ComponentType,
  CSSProperties,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState
} from 'react'
import {
  checkLicense,
  checkStylesheetLoaded,
  ContextMenu,
  ContextMenuItemProvider,
  EdgeStyle as TransitionStyle,
  LicenseError,
  Popup,
  ReactNodeRendering,
  RenderContextMenuProps as RenderContextMenuPropsBase,
  RenderPopupProps as RenderPopupPropsBase,
  RenderTooltipProps as RenderTooltipPropsBase,
  Tooltip,
  useGraphSearch,
  useReactNodeRendering,
  withGraphComponent
} from '@yworks/react-yfiles-core'
import { GraphViewerInputMode, ICanvasObject, IEdge, INode } from 'yfiles'
import {
  ProcessMiningProvider,
  useProcessMiningContext,
  useProcessMiningContextInternal
} from './ProcessMiningProvider'
import { ProcessMiningModel, ProcessMiningModelInternal } from './ProcessMiningModel.ts'
import {
  initializeFocus,
  initializeHover,
  initializeInputMode,
  initializeSelection
} from './core/input.ts'
import {
  extractGraph,
  getProcessStepData,
  getTransitionData,
  ProcessStep,
  Transition
} from './core/process-graph-extraction.ts'
import './styles/process-mining.css'
import {
  initializeEdgeDefaultStyle,
  initializeNodeDefaultStyle,
  updateEdgeStyles,
  updateNodeSizes,
  updateNodeStyles
} from './styles/process-mining-styles.ts'
import { addHeatmap } from './core/heatmap.ts'
import { createTransitionEventVisualSupport } from './styles/TransitionEventVisual.ts'
import { RenderProcessStepProps } from './styles/RenderProcessStep.tsx'
import { RenderTooltipProps } from './components/ProcessMiningTooltip.tsx'
import { RenderPopupProps } from './components/ProcessMiningPopup.tsx'

/**
 * An event that marks one step in the process.
 */
export type ActivityEvent = {
  /** The id of the entity that passes through the process steps. */
  caseId: number | string

  /** The name of the activity that is executed in this event. */
  activity: string

  /** The time in milliseconds when this event starts. */
  timestamp: number

  /** The time in milliseconds this event takes to finish. */
  duration?: number

  /** A cost factor assigned to this event. */
  cost?: number
}

/**
 * A function type that provides styles for the transitions between steps in a process.
 * The source/target represents the start/end item of the connection, respectively.
 */
export type TransitionStyleProvider<ProcessStep> = (
  source: ProcessStep,
  target: ProcessStep
) => TransitionStyle | undefined

/**
 * A callback type invoked when an item has been focused.
 */
export type ItemFocusedListener<ProcessStep> = (item: ProcessStep | null) => void

/**
 * A callback type invoked when an item has been selected or deselected.
 */
export type ItemSelectedListener<ProcessStep> = (selectedItems: ProcessStep[]) => void

/**
 * A callback type invoked when the hovered item has changed.
 */
export type ItemHoveredListener<ProcessStep> = (
  item: ProcessStep | null,
  oldItem?: ProcessStep | null
) => void

/**
 * A function that returns whether the given item matches the search needle.
 */
export type SearchFunction<ProcessStep, TNeedle = string> = (
  item: ProcessStep,
  needle: TNeedle
) => boolean

/**
 * Configures the direction of the flow for the layout.
 */
export type LayoutDirection = 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top'

/**
 * Configuration options for the process mining diagram layout.
 * Note that, to optimize performance and depending on the implementation,
 * it might be necessary to memoize the layout options.
 */
export interface LayoutOptions {
  /**
   * The direction for the flow in the graph.
   */
  direction?: LayoutDirection

  /**
   * The minimum distance between the layers in the hierarchy.
   */
  minimumLayerDistance?: number

  /**
   * The minimum distance between two adjacent nodes in one layer.
   */
  nodeToNodeDistance?: number

  /**
   * The minimum distance between an edge and an adjacent node in one layer.
   */
  nodeToEdgeDistance?: number
  /**
   * Limits the time the layout algorithm can use to the provided number of milliseconds.
   * This is an expert option. The main application is for graphs with many edges, where usually
   * the part of the layout calculations that takes the longest time is the edge routing.
   */
  maximumDuration?: number

  /**
   * Whether to group edges either at their common source node or their common target node.
   */
  edgeGrouping?: boolean
}

/**
 * The props passed to the process mining context-menu component for rendering the context-menu.
 */
export interface RenderContextMenuProps
  extends RenderContextMenuPropsBase<ProcessStep | Transition> {
  /**
   * The current timestamp of the {@link ProcessMining} component.
   */
  timestamp: number
}

/**
 * The props for the {@link ProcessMining} component.
 */
export interface ProcessMiningProps<TEvent extends ActivityEvent, TNeedle> {
  /**
   * The events visualized by the process mining diagram.
   */
  eventLog: TEvent[]
  /**
   * The timestamp in the event log which should be displayed in the diagram. This will affect
   * the visualization of the heatmap and styles that show the workload at this time.
   * To get valid results for the current heat distribution, it must be within the overall
   * time span of the event log.
   * The default is 0.
   */
  timestamp?: number
  /**
   * Whether to show the heatmap visualization. The process mining component calculates a numerical heat value,
   * indicating the workload at the process steps for the current timestamp.
   * The default is <code>true</code>.
   */
  showHeatmap?: boolean
  /**
   * Whether to show the visualization of transition events as circles on a transition.
   * The default is <code>true</code>.
   */
  showTransitionEvents?: boolean
  /**
   * An optional callback that's called when an item is focused.
   *
   * Note that the focused item is not changed if the empty canvas is clicked.
   */
  onItemFocus?: ItemFocusedListener<ProcessStep>
  /**
   * An optional callback that's called when an item is selected or deselected.
   */
  onItemSelect?: ItemSelectedListener<ProcessStep>
  /**
   * An optional callback that's called when the hovered item has changed.
   */
  onItemHover?: ItemHoveredListener<ProcessStep>
  /**
   * A string or a complex object to search for.
   *
   * The default search implementation can only handle strings and searches on the properties of the
   * data item. For more complex search logic, provide an {@link ProcessMining.onSearch} callback.
   */
  searchNeedle?: TNeedle
  /**
   * An optional callback that returns whether the given item matches the search needle.
   *
   * The default search implementation only supports string needles and searches all properties of the data item.
   * Provide this callback to implement custom search logic.
   */
  onSearch?: SearchFunction<ProcessStep, TNeedle>
  /**
   * A custom render component used for rendering the given process step.
   */
  renderProcessStep?: ComponentType<RenderProcessStepProps>
  /**
   * A function that provides a style configuration for the given transition.
   */
  transitionStyles?: TransitionStyleProvider<ProcessStep>
  /**
   * Specifies the CSS class used for the {@link ProcessMining} component.
   */
  className?: string
  /**
   * Specifies the CSS style used for the {@link ProcessMining} component.
   */
  style?: CSSProperties
  /**
   * Specifies the default item size used when no explicit width and height are provided.
   */
  itemSize?: { width: number; height: number }
  /**
   * An optional component that can be used for rendering a custom tooltip.
   */
  renderTooltip?: ComponentType<RenderTooltipProps>
  /**
   * An optional function specifying the context menu items for a data item.
   */
  contextMenuItems?: ContextMenuItemProvider<ProcessStep>
  /**
   * An optional component that renders a custom context menu.
   */
  renderContextMenu?: ComponentType<RenderContextMenuProps>
  /**
   * The optional position of the popup. The default is 'north'.
   */
  popupPosition?:
    | 'east'
    | 'north'
    | 'north-east'
    | 'north-west'
    | 'south'
    | 'south-east'
    | 'south-west'
    | 'west'
  /**
   * An optional component used for rendering a custom popup.
   */
  renderPopup?: ComponentType<RenderPopupProps>

  /**
   * An optional callback that provides size and [hue](https://developer.mozilla.org/en-US/docs/Web/CSS/hue) values to
   * customize the color and the size of a transition event.
   * Since the transition event is not part of the event log but bridges the gap between two events, the events before
   * and after are passed for identification or other information.
   * The default is { size: 7, hue: 200}
   */
  transitionEventStyling?: (
    previousEvent: TEvent,
    nextEvent: TEvent
  ) => { size: number; hue: number }

  /**
   * Whether to enable smart navigation for large graphs, i.e., clicked elements will be moved to a focus point.
   * This feature facilitates the navigation between graph elements, especially
   * when only a part of the graph is visible in the viewport.
   */
  smartClickNavigation?: boolean

  /**
   * Options for configuring the process mining layout.
   * Note that, to optimize performance and depending on the implementation,
   * it might be necessary to memoize the layout options.
   */
  layoutOptions?: LayoutOptions
}

const licenseErrorCodeSample = `import {ProcessMining, registerLicense} from '@yworks/react-yfiles-process-mining' 
import '@yworks/react-yfiles-process-mining/dist/index.css'
import yFilesLicense from './license.json'

function App() {
  registerLicense(yFilesLicense)
            
  const eventLog = [
    { caseId: 0, activity: 'Start', timestamp: 8.383561495922297, duration: 0.0006804154279300233 },
    { caseId: 0, activity: 'Step A', timestamp: 8.928697652413142, duration: 0.10316578562597925 },
    { caseId: 0, activity: 'Step B', timestamp: 9.576999594529966, duration: 0.041202953341980784 },
    { caseId: 0, activity: 'End', timestamp: 10.163338704362792, duration: 0.2746326125522593 }
  ]

  return <ProcessMining eventLog={eventLog}></ProcessMining>
}`

/**
 * The Process Mining component extracts a diagram for process mining from the given event log.
 * All events have to be included in the [eventLog]{@link ProcessMiningProps.eventLog}. The process
 * steps are generated from the activities in the events and the transitions are inferred from
 * consecutive events of the same case ID.
 *
 * ```tsx
 * function ProcessMiningDiagram() {
 *   return (
 *     <ProcessMining eventLog={eventLog}></ProcessMining>
 *   )
 * }
 * ```
 */
export function ProcessMining<TEvent extends ActivityEvent, TNeedle = string>(
  props: ProcessMiningProps<TEvent, TNeedle> & PropsWithChildren
): ReactElement {
  if (!checkLicense()) {
    return (
      <LicenseError
        componentName={'yFiles React Process Mining Component'}
        codeSample={licenseErrorCodeSample}
      />
    )
  }

  const isWrapped = useProcessMiningContextInternal()
  if (isWrapped) {
    return <ProcessMiningCore {...props}>{props.children}</ProcessMiningCore>
  }

  return (
    <ProcessMiningProvider>
      <ProcessMiningCore {...props}>{props.children}</ProcessMiningCore>
    </ProcessMiningProvider>
  )
}

const ProcessMiningCore = withGraphComponent(
  <TEvent extends ActivityEvent, TNeedle>({
    children,
    renderProcessStep,
    transitionStyles,
    timestamp = 0,
    showHeatmap = true,
    showTransitionEvents = true,
    onItemHover,
    onSearch,
    onItemFocus,
    onItemSelect,
    eventLog,
    searchNeedle,
    itemSize,
    renderTooltip,
    contextMenuItems,
    renderContextMenu,
    popupPosition,
    renderPopup,
    transitionEventStyling = () => ({ size: 7, hue: 200 }),
    smartClickNavigation,
    layoutOptions
  }: ProcessMiningProps<TEvent, TNeedle> & PropsWithChildren) => {
    const processMiningModel = useProcessMiningContext()
    const graphComponent = processMiningModel.graphComponent

    const [nodeData, setNodeData] = useState<ProcessStep[]>([])
    const [, setEdgeData] = useState<Transition[]>([])
    const { nodeInfos, setNodeInfos } = useReactNodeRendering<ProcessStep>()

    const transitionEventVisualSupport = useMemo(() => {
      initializeNodeDefaultStyle(graphComponent, setNodeInfos, itemSize)
      initializeEdgeDefaultStyle(graphComponent)
      // initializes basic interaction with the graph including the properties panel
      initializeInputMode(graphComponent, processMiningModel, smartClickNavigation)
      const transitionEventVisualSupport = createTransitionEventVisualSupport(graphComponent)
      if (isInternalProcessMiningModel(processMiningModel)) {
        processMiningModel.transitionEventVisualSupport = transitionEventVisualSupport
      }
      return transitionEventVisualSupport
    }, [])

    useEffect(() => {
      checkStylesheetLoaded(graphComponent.div, 'react-yfiles-process-mining')
    }, [])

    useEffect(() => {
      if (isInternalProcessMiningModel(processMiningModel)) {
        processMiningModel.eventLog = eventLog
      }
      extractGraph(eventLog, graphComponent)
      setNodeData(graphComponent.graph.nodes.map(node => getProcessStepData(node)).toArray())
      setEdgeData(graphComponent.graph.edges.map(edge => getTransitionData(edge)).toArray())
      transitionEventVisualSupport.clearItems()
    }, [eventLog])

    useEffect(() => {
      initializeNodeDefaultStyle(graphComponent, setNodeInfos, itemSize)
      updateNodeSizes(graphComponent, itemSize)
      updateNodeStyles(graphComponent, setNodeInfos, renderProcessStep)
    }, [itemSize?.width, itemSize?.height, transitionStyles, renderProcessStep])

    useEffect(() => {
      initializeEdgeDefaultStyle(graphComponent)
      updateEdgeStyles(graphComponent, transitionStyles)
      setEdgeData(graphComponent.graph.edges.map(edge => getTransitionData(edge)).toArray())
    }, [transitionStyles])

    useEffect(() => {
      let heatMapCanvasObject: ICanvasObject | null = null

      if (showHeatmap) {
        // this function provides the heat for a node or edge at a specific time
        // it is used to update the heat map or the node decoration
        heatMapCanvasObject = addHeatmap(graphComponent, (item: INode | IEdge): number => {
          // we define the heat as the ratio of the current heat value to the item's capacity,
          // but not more than 1
          const data = item instanceof INode ? getProcessStepData(item) : getTransitionData(item)
          return Math.min(1, data.heat!.getValue(timestamp) / data.capacity!)
        })
      }

      return () => {
        if (heatMapCanvasObject) {
          heatMapCanvasObject.remove()
          heatMapCanvasObject = null
        }
      }
    }, [graphComponent, showHeatmap, timestamp])

    useEffect(() => {
      transitionEventVisualSupport.hideVisual()
      if (showTransitionEvents) {
        // add the item visual to be able to render dots for the traversing events
        transitionEventVisualSupport.showVisual(graphComponent)
        transitionEventVisualSupport.updateTime(timestamp)
      }
      if (isInternalProcessMiningModel(processMiningModel)) {
        processMiningModel.showTransitionEvents = showTransitionEvents
      }
    }, [graphComponent, showTransitionEvents])

    useEffect(() => {
      if (isInternalProcessMiningModel<TEvent>(processMiningModel)) {
        processMiningModel.transitionEventStyling = transitionEventStyling
      }
    }, [transitionEventStyling])

    useEffect(() => {
      if (showTransitionEvents) {
        transitionEventVisualSupport.updateTime(timestamp)
        graphComponent.invalidate()
      }
    }, [graphComponent, transitionEventVisualSupport, showTransitionEvents, timestamp])

    useEffect(() => {
      const hoverItemChangedListener = initializeHover(onItemHover, graphComponent)

      return () => {
        // clean up
        hoverItemChangedListener &&
          (
            graphComponent.inputMode as GraphViewerInputMode
          ).itemHoverInputMode.removeHoveredItemChangedListener(hoverItemChangedListener)
      }
    }, [onItemHover])

    useEffect(() => {
      // initialize the focus and selection to display the information of the selected element
      const currentItemChangedListener = initializeFocus(onItemFocus, graphComponent)
      const selectedItemChangedListener = initializeSelection(onItemSelect, graphComponent)

      return () => {
        // clean up the listeners
        currentItemChangedListener &&
          graphComponent.removeCurrentItemChangedListener(currentItemChangedListener)
        selectedItemChangedListener &&
          graphComponent.selection.removeItemSelectionChangedListener(selectedItemChangedListener)
      }
    }, [onItemFocus, onItemSelect])

    const graphSearch = useGraphSearch(graphComponent, searchNeedle, onSearch)
    // provide search hits on the context
    processMiningModel.getSearchHits = () => graphSearch.matchingNodes.map((n: INode) => n.tag)

    // fit graph after initial measurement
    const [finishedInitialMeasurement, setFinishedInitialMeasurement] = useState(false)
    useLayoutEffect(() => {
      graphComponent.fitGraphBounds()
    }, [finishedInitialMeasurement])

    useEffect(() => {
      // apply a layout after the first measurement if the layout options change
      if (finishedInitialMeasurement) {
        void processMiningModel.applyLayout(layoutOptions, true)
      }
    }, [layoutOptions])

    const [measureTrigger, setMeasureTrigger] = useState(false)
    useEffect(() => {
      setMeasureTrigger(!measureTrigger)
    }, [renderProcessStep])

    return (
      <>
        <ReactNodeRendering
          nodeData={nodeData}
          nodeInfos={nodeInfos}
          nodeSize={itemSize}
          onMeasured={() => {
            processMiningModel.applyLayout(layoutOptions, finishedInitialMeasurement).then(() => {
              setFinishedInitialMeasurement(true)
            })
          }}
          onRendered={
            isInternalProcessMiningModel(processMiningModel)
              ? processMiningModel.onRendered
              : undefined
          }
          extraProps={{ timestamp }}
          measureTrigger={measureTrigger}
        />
        {renderTooltip && (
          <Tooltip
            renderTooltip={
              renderTooltip as ComponentType<RenderTooltipPropsBase<ProcessStep | Transition>>
            }
            extraProps={{ timestamp }}
          ></Tooltip>
        )}
        {(contextMenuItems || renderContextMenu) && (
          <ContextMenu
            menuItems={contextMenuItems}
            renderMenu={renderContextMenu as ComponentType<RenderContextMenuPropsBase<ProcessStep>>}
            extraProps={{ timestamp }}
          ></ContextMenu>
        )}
        {renderPopup && (
          <Popup
            position={popupPosition}
            renderPopup={
              renderPopup as ComponentType<RenderPopupPropsBase<ProcessStep | Transition>>
            }
            extraProps={{ timestamp }}
          ></Popup>
        )}
        {children}
      </>
    )
  }
)

function isInternalProcessMiningModel<TEvent extends ActivityEvent>(
  model: ProcessMiningModel
): model is ProcessMiningModelInternal<TEvent> {
  return 'onRendered' in model
}
