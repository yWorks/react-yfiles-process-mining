import {
  ClickEventArgs,
  type GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HoveredItemChangedEventArgs,
  INode,
  ItemHoverInputMode
} from '@yfiles/yfiles'
import { enableSingleSelection } from './SingleSelectionHelper.ts'
import { ProcessMiningModel } from '../ProcessMiningModel.ts'
import { getProcessStepData, ProcessStep } from './process-graph-extraction.ts'
import { enableSmartClickNavigation } from './configure-smart-click-navigation.ts'
import type { TransitionEventVisualSupport } from '../styles/TransitionEventVisual.ts'
import type { TransitionEventsClickedListener } from '../ProcessMining.tsx'

/**
 * Set up the graph viewer input mode to and enables interactivity to expand and collapse subtrees.
 */
export function initializeInputMode(
  graphComponent: GraphComponent,
  processMining: ProcessMiningModel,
  smartClickNavigation = false
): void {
  const graphViewerInputMode = new GraphViewerInputMode({
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.PORT | GraphItemTypes.EDGE,
    selectableItems: GraphItemTypes.NODE,
    marqueeSelectableItems: GraphItemTypes.NONE,
    toolTipItems: GraphItemTypes.NONE,
    contextMenuItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    focusableItems: GraphItemTypes.NODE,
    clickHitTestOrder: [GraphItemTypes.PORT, GraphItemTypes.NODE, GraphItemTypes.EDGE]
  })

  initializeHighlights(graphComponent)

  graphComponent.inputMode = graphViewerInputMode

  if (smartClickNavigation) {
    enableSmartClickNavigation(graphViewerInputMode, graphComponent)
  }

  enableSingleSelection(graphComponent)
}

export function initializeHover(
  onHover: ((item: ProcessStep | null, oldItem?: ProcessStep | null) => void) | undefined,
  graphComponent: GraphComponent
) {
  const inputMode = graphComponent.inputMode as GraphViewerInputMode
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  const hoverItemChangedListener = (
    evt: HoveredItemChangedEventArgs,
    _: ItemHoverInputMode
  ): void => {
    // we use the highlight manager to highlight hovered items
    const manager = graphComponent.highlightIndicatorManager
    if (evt.oldItem) {
      manager.items?.remove(evt.oldItem)
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,@typescript-eslint/strict-boolean-expressions
    if (evt.item) {
      manager.items?.add(evt.item)
    }

    if (onHover) {
      onHover(evt.item?.tag, evt.oldItem?.tag)
    }
  }
  inputMode.itemHoverInputMode.addEventListener('hovered-item-changed', hoverItemChangedListener)
  return hoverItemChangedListener
}

/**
 * Adds and returns the listener when transition events are clicked. The return is needed
 * so that the listener can be removed from the graph.
 */
export function initializeTransitionEventsClick(
  onTransitionEventsClick: TransitionEventsClickedListener | undefined,
  graphComponent: GraphComponent,
  transitionEventVisualSupport: TransitionEventVisualSupport
) {
  const inputMode = graphComponent.inputMode as GraphViewerInputMode
  const transitionEventsClickedListener = (evt: ClickEventArgs, _: GraphViewerInputMode): void => {
    if (onTransitionEventsClick) {
      const clickedTransitionEntries = transitionEventVisualSupport.getEntriesAtLocation(
        evt.location
      )
      onTransitionEventsClick(clickedTransitionEntries.map(entry => entry.caseId))
    }
  }
  inputMode.addEventListener('item-clicked', transitionEventsClickedListener)
  inputMode.addEventListener('canvas-clicked', transitionEventsClickedListener)
  return transitionEventsClickedListener
}

/**
 * Adds and returns the listener when the currentItem changes. The return is needed so that the listener
 * can be removed from the graph.
 */
export function initializeFocus(
  onFocus: ((item: ProcessStep | null) => void) | undefined,
  graphComponent: GraphComponent
) {
  let currentItemChangedListener = () => {}
  if (onFocus) {
    // display information about the current employee
    currentItemChangedListener = () => {
      const currentItem = graphComponent.currentItem
      if (currentItem instanceof INode) {
        onFocus(getProcessStepData(currentItem))
      } else {
        onFocus(null)
      }
    }
  }
  graphComponent.addEventListener('current-item-changed', currentItemChangedListener)
  return currentItemChangedListener
}

/**
 * Adds and returns the listener when the selected item changes. The return is needed so that the listener
 * can be removed from the graph.
 */
export function initializeSelection(
  onSelect: ((selectedItems: ProcessStep[]) => void) | undefined,
  graphComponent: GraphComponent
) {
  let itemSelectionChangedListener = () => {}
  if (onSelect) {
    // display information about the current employee
    itemSelectionChangedListener = () => {
      const selectedItems = graphComponent.selection.nodes
        .map(node => getProcessStepData(node))
        .toArray()
      onSelect(selectedItems)
    }
  }
  graphComponent.selection.addEventListener('item-added', itemSelectionChangedListener)
  graphComponent.selection.addEventListener('item-removed', itemSelectionChangedListener)
  return itemSelectionChangedListener
}

/**
 * Initializes the highlights for selected or focused elements.
 */
function initializeHighlights(graphComponent: GraphComponent): void {
  // Hide the default select/focus highlight in favor of the CSS highlighting from the template styles
  graphComponent.graph.decorator.nodes.selectionRenderer.hide()
  graphComponent.graph.decorator.nodes.focusRenderer.hide()
}
