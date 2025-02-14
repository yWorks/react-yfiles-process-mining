import { GraphComponent } from '@yfiles/yfiles'
import { ExportSettings, PrintSettings } from '@yworks/react-yfiles-core'
import { ProcessStep, Transition } from './core/process-graph-extraction.ts'
import { ActivityEvent, LayoutOptions } from './ProcessMining.tsx'
import { TransitionEventVisualSupport } from './styles/TransitionEventVisual.ts'

/**
 * The ProcessMiningModel provides common functionality to interact with the {@link ProcessMining} component.
 */
export interface ProcessMiningModel {
  /**
   * The [yFiles GraphComponent]{@link http://docs.yworks.com/yfileshtml/#/api/GraphComponent} used
   * by the {@link ProcessMining} component to display the graph.
   *
   * This property is intended for advanced users who have a familiarity with the
   * [yFiles for HTML]{@link https://www.yworks.com/products/yfiles-for-html} library.
   */
  graphComponent: GraphComponent

  /**
   * Starts the animation.
   * It takes a callback function to report the progress back, where the progress is the current timestamp in the animation.
   * The start time, end time, and duration parameters define the timing properties of the animation.
   */
  startAnimation(
    progressCallback: (progress: number) => void,
    startTimestamp: number,
    endTimestamp: number,
    duration: number
  ): Promise<void>

  /**
   * Stops the animation.
   */
  stopAnimation(): void

  /**
   * Refreshes the layout of the process mining diagram.
   * It optionally accepts layout options and a flag indicating whether to morph the layout.
   * Note that, to optimize performance and depending on the implementation,
   * it might be necessary to memoize the layout options.
   */
  applyLayout(layoutOptions?: LayoutOptions, morphLayout?: boolean): Promise<void>

  /**
   * Pans the viewport to the center of the given items.
   */
  zoomTo(items: (ProcessStep | Transition)[]): void
  /**
   * Pans the viewport to center the given item.
   */
  zoomToItem(item: ProcessStep | Transition): void
  /**
   * Retrieves the items that match the search currently.
   */
  getSearchHits: () => ProcessStep[]
  /**
   * Increases the zoom level.
   */
  zoomIn(): void
  /**
   * Decreases the zoom level.
   */
  zoomOut(): void
  /**
   * Fits the diagram inside the viewport.
   */
  fitContent(insets?: number): void
  /**
   * Resets the zoom level to 1.
   */
  zoomToOriginal(): void

  /**
   * Exports the process mining diagram to an SVG file.
   * It throws an exception if the diagram cannot be exported.
   * The exception may occur when the diagram contains images from cross-origin sources.
   * In this case, disable {@link ExportSettings.inlineImages} and encode the icons manually to base64.
   */
  exportToSvg(exportSettings?: ExportSettings): Promise<void>

  /**
   * Exports the process mining diagram to a PNG Image.
   * It throws an exception if the diagram cannot be exported.
   * The exception may occur when the diagram contains images from cross-origin sources.
   * In this case, disable {@link ExportSettings.inlineImages} and encode the icons manually to base64.
   */
  exportToPng(exportSettings?: ExportSettings): Promise<void>

  /**
   * Exports and prints the process mining diagram.
   */
  print(printSettings?: PrintSettings): Promise<void>

  /**
   * Triggers a re-rendering of the diagram.
   * This may become useful if properties in the data change and the
   * visualization should update accordingly.
   */
  refresh(): void
}

export interface ProcessMiningModelInternal<TEvent extends ActivityEvent>
  extends ProcessMiningModel {
  onRendered: () => void
  showTransitionEvents: boolean
  eventLog: TEvent[]
  transitionEventStyling?: (
    previousEvent: TEvent,
    nextEvent: TEvent
  ) => { size: number; hue: number }
  transitionEventVisualSupport: TransitionEventVisualSupport
}
