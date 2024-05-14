import { RenderNodeProps as RenderProcessStepPropsBase } from '@yworks/react-yfiles-core'
import { ProcessStep } from '../core/process-graph-extraction.ts'
import { RenderHeatGauge } from './RenderHeatGauge.tsx'
import { ProcessMining } from '../ProcessMining.tsx'
import './RenderProcessStep.css'

/**
 * The props passed to the process mining component for rendering the process step.
 */
export interface RenderProcessStepProps extends RenderProcessStepPropsBase<ProcessStep> {
  /**
   * The current timestamp of the {@link ProcessMining} component.
   */
  timestamp: number
}

/**
 * A default component that renders a process step which is extracted from the event log.
 * It shows a heat gauge next to the label of the process step.
 *
 * Note that this visualization has a minimum height of 50. Smaller sizes defined with {@link ProcessMining.itemSize} may
 * result in a broken visualization.
 *
 * The component is already used as a fallback if no render prop is specified on {@link ProcessMining}. However, it can
 * be integrated in another component, for example to have different styles for different items.
 *
 * ```tsx
 * function ProcessMiningDiagram() {
 *   const CustomProcessStep = useMemo(
 *     () => (props: RenderProcessStepProps) => {
 *       const { dataItem } = props
 *       if (dataItem?.label === 'Start') {
 *         return (
 *           <>
 *             <div
 *               style={{
 *                 backgroundColor: 'blue',
 *                 color: 'white',
 *                 width: '100%',
 *                 height: '100%'
 *               }}
 *             >
 *               <div>{dataItem.label}</div>
 *             </div>
 *           </>
 *         )
 *       } else {
 *         return <RenderProcessStep {...props}></RenderProcessStep>
 *       }
 *     },
 *     []
 *   )
 *
 *   return (
 *     <ProcessMining eventLog={eventLog} renderProcessStep={CustomProcessStep}></ProcessMining>
 *   )
 * }
 * ```
 */
export function RenderProcessStep({
  dataItem,
  hovered,
  focused,
  selected,
  timestamp
}: RenderProcessStepProps) {
  const heat = Math.min(1, (dataItem.heat?.getValue(timestamp) ?? 0) / (dataItem.capacity ?? 100))
  const currentHeat = Math.floor((heat ?? 0) * 30) / 30
  const gaugeSize = 43

  return (
    <>
      <div
        className={`yfiles-react-render-process-step ${getHighlightClasses(
          selected,
          hovered,
          focused
        )}`}
        style={{ width: '100%', height: '100%' }}
      >
        <div className="yfiles-react-render-process-step-gauge">
          <RenderHeatGauge size={gaugeSize} heat={currentHeat}></RenderHeatGauge>
        </div>
        <div className="yfiles-react-render-process-step-text">{dataItem.label}</div>
      </div>
    </>
  )
}

function getHighlightClasses(selected: boolean, hovered: boolean, focused: boolean): string {
  const highlights = ['yfiles-react-node-highlight']
  if (focused) {
    highlights.push('yfiles-react-node-highlight--focused')
  }
  if (hovered) {
    highlights.push('yfiles-react-node-highlight--hovered')
  }
  if (selected) {
    highlights.push('yfiles-react-node-highlight--selected')
  }
  return highlights.join(' ')
}
