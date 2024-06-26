import {
  type GraphComponent,
  GraphFocusIndicatorManager,
  GraphItemTypes,
  GraphViewerInputMode,
  HoveredItemChangedEventArgs,
  INode,
  ItemHoverInputMode,
  ShowFocusPolicy,
  VoidNodeStyle
} from 'yfiles'
import { enableSingleSelection } from './SingleSelectionHelper.ts'
import { ProcessMiningModel } from '../ProcessMiningModel.ts'
import { getProcessStepData, ProcessStep } from './process-graph-extraction.ts'
import { enableSmartClickNavigation } from './configure-smart-click-navigation.ts'

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
    enableSmartClickNavigation(graphViewerInputMode)
  }

  enableSingleSelection(graphComponent)
}

export function initializeHover(
  onHover: ((item: ProcessStep | null, oldItem?: ProcessStep | null) => void) | undefined,
  graphComponent: GraphComponent
) {
  const inputMode = graphComponent.inputMode as GraphViewerInputMode
  let hoverItemChangedListener = (
    sender: ItemHoverInputMode,
    evt: HoveredItemChangedEventArgs
  ) => {}
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  hoverItemChangedListener = (_, evt): void => {
    // we use the highlight manager to highlight hovered items
    const manager = graphComponent.highlightIndicatorManager
    if (evt.oldItem) {
      manager.removeHighlight(evt.oldItem)
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,@typescript-eslint/strict-boolean-expressions
    if (evt.item) {
      manager.addHighlight(evt.item)
    }

    if (onHover) {
      onHover(evt.item?.tag, evt.oldItem?.tag)
    }
  }
  inputMode.itemHoverInputMode.addHoveredItemChangedListener(hoverItemChangedListener)
  inputMode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  return hoverItemChangedListener
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
  graphComponent.addCurrentItemChangedListener(currentItemChangedListener)
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
      const selectedItems = graphComponent.selection.selectedNodes
        .map(node => getProcessStepData(node))
        .toArray()
      onSelect(selectedItems)
    }
  }
  graphComponent.selection.addItemSelectionChangedListener(itemSelectionChangedListener)
  return itemSelectionChangedListener
}

/**
 * Initializes the highlights for selected or focused elements.
 */
function initializeHighlights(graphComponent: GraphComponent): void {
  graphComponent.selectionIndicatorManager.enabled = false

  // Hide the default focus highlight in favor of the CSS highlighting from the template styles
  graphComponent.focusIndicatorManager = new GraphFocusIndicatorManager({
    showFocusPolicy: ShowFocusPolicy.ALWAYS,
    nodeStyle: VoidNodeStyle.INSTANCE
  })
}
