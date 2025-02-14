import { GraphComponent, PolylineEdgeStyle, Rect, Size } from '@yfiles/yfiles'
import { ComponentType, Dispatch, SetStateAction } from 'react'
import {
  convertToPolylineEdgeStyle,
  NodeRenderInfo,
  ReactComponentHtmlNodeStyle,
  RenderNodeProps
} from '@yworks/react-yfiles-core'
import { getProcessStepData, ProcessStep } from '../core/process-graph-extraction.ts'
import { RenderProcessStep, RenderProcessStepProps } from './RenderProcessStep.tsx'
import { TransitionStyleProvider } from '../ProcessMining.tsx'

/**
 * Sets style defaults for nodes.
 */
export function initializeNodeDefaultStyle(
  graphComponent: GraphComponent,
  setNodeInfos: Dispatch<SetStateAction<NodeRenderInfo<ProcessStep>[]>>,
  nodeSize?: { width: number; height: number }
): void {
  const graph = graphComponent.graph

  graph.nodeDefaults.style = new ReactComponentHtmlNodeStyle<ProcessStep>(
    RenderProcessStep as ComponentType<RenderNodeProps<ProcessStep>>,
    setNodeInfos
  )

  if (nodeSize) {
    graph.nodeDefaults.size = new Size(nodeSize.width, nodeSize.height)
  }

  // Hide the default highlight in favor of the CSS highlighting from the template styles
  graphComponent.highlightIndicatorManager.enabled = false
}

/**
 * Sets style defaults for edges.
 */
export function initializeEdgeDefaultStyle(graphComponent: GraphComponent): void {
  graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px #33a',
    targetArrow: '#33a triangle',
    smoothingLength: 100
  })
}

export function updateNodeSizes(
  graphComponent: GraphComponent,
  itemSize?: { width: number; height: number }
): void {
  graphComponent.graph.nodes.forEach(node => {
    if (itemSize) {
      graphComponent.graph.setNodeLayout(node, Rect.fromCenter(node.layout.center, itemSize))
    } else {
      const data = getProcessStepData(node)
      if (data.width && data.height) {
        graphComponent.graph.setNodeLayout(
          node,
          Rect.fromCenter(node.layout.center, [data.width, data.height])
        )
      }
    }
  })
}

export function updateNodeStyles(
  graphComponent: GraphComponent,
  setNodeInfos: Dispatch<SetStateAction<NodeRenderInfo<ProcessStep>[]>>,
  renderProcessStep?: ComponentType<RenderProcessStepProps>
): void {
  const renderStep = renderProcessStep ?? RenderProcessStep
  graphComponent.graph.nodes.forEach(node => {
    graphComponent.graph.setStyle(
      node,
      new ReactComponentHtmlNodeStyle<ProcessStep>(
        renderStep as ComponentType<RenderNodeProps<ProcessStep>>,
        setNodeInfos
      )
    )
  })
}

export function updateEdgeStyles(
  graphComponent: GraphComponent,
  transitionStyles?: TransitionStyleProvider<ProcessStep>
) {
  if (transitionStyles) {
    graphComponent.graph.edges.forEach(edge => {
      const styleProperties = transitionStyles(
        getProcessStepData(edge.sourceNode!),
        getProcessStepData(edge.targetNode!)
      )
      graphComponent.graph.setStyle(
        edge,
        styleProperties
          ? convertToPolylineEdgeStyle(styleProperties)
          : graphComponent.graph.edgeDefaults.style
      )
    })
  }
}
