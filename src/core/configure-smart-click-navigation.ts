import {
  type GraphComponent,
  GraphViewerInputMode,
  IEdge,
  IModelItem,
  INode,
  ItemClickedEventArgs,
  Point
} from '@yfiles/yfiles'

/**
 * Enables smart navigation for large graphs, i.e., clicked elements will be moved to a focus point.
 * There are two modes:
 * <ul>
 *   <li>Zoom to Viewport Center: The focused item will be moved to the center of the viewport.</li>
 *   <li>Zoom to Mouse Location: The focused item is centered at the mouse location.</li>
 * </ul>
 * This feature facilitates navigation between graph elements, especially
 * when only a part of the graph is visible in the viewport.
 *
 * When a node is clicked, the focus will be moved to the center of the clicked node.
 * When an edge is clicked and its source or target node is not visible, the focus will be moved to
 * the respective source or target node.
 */
export function enableSmartClickNavigation(
  graphInputMode: GraphViewerInputMode,
  graphComponent: GraphComponent,
  mode: 'zoom-to-mouse-location' | 'zoom-to-viewport-center' = 'zoom-to-viewport-center'
) {
  graphInputMode.addEventListener(
    'item-left-clicked',
    async (event: ItemClickedEventArgs<IModelItem>): Promise<void> => {
      if (!event.handled) {
        const item = event.item
        // gets the point where we should zoom in
        const location = getFocusPoint(item, graphComponent)
        if (location) {
          if (mode === 'zoom-to-mouse-location') {
            // zooms to the new location of the mouse
            const offset = event.location.subtract(graphComponent.viewport.center)
            await graphComponent.zoomToAnimated(graphComponent.zoom, location.subtract(offset))
          } else {
            await graphComponent.zoomToAnimated(graphComponent.zoom, location)
          }
        }
      }
    }
  )
}

function getFocusPoint(item: IModelItem, graphComponent: GraphComponent): Point | null {
  if (item instanceof INode) {
    return item.layout.center
  } else if (item instanceof IEdge) {
    // If the source and the target node are in the view port, then zoom to the middle point of the edge
    const targetNodeCenter = item.targetNode!.layout.center
    const sourceNodeCenter = item.sourceNode!.layout.center
    const viewport = graphComponent.viewport
    if (viewport.contains(targetNodeCenter) && viewport.contains(sourceNodeCenter)) {
      // Do nothing if both nodes are visible
      return null
    } else {
      if (
        viewport.center.subtract(targetNodeCenter).vectorLength <
        viewport.center.subtract(sourceNodeCenter).vectorLength
      ) {
        // If the source node is out of the view port, then zoom to it
        return sourceNodeCenter
      } else {
        // Else zoom to the target node
        return targetNodeCenter
      }
    }
  }
  return null
}
