import { ProcessStep, Transition } from '../core/process-graph-extraction.ts'
import { RenderTooltipProps as RenderTooltipPropsBase } from '@yworks/react-yfiles-core'

/**
 * The props passed to the process mining tooltip component for rendering the tooltip.
 */
export interface RenderTooltipProps extends RenderTooltipPropsBase<ProcessStep | Transition> {
  /**
   * The current timestamp of the {@link ProcessMining} component.
   */
  timestamp: number
}

/**
 * A default template for the process mining tooltip that shows the label of the process step or transition
 * and the current heat value.
 *
 * ```tsx
 * function App() {
 *   return (
 *     <ProcessMining eventLog={eventLog} renderTooltip={RenderTooltip}></ProcessMining>
 *   )
 * }
 * ```
 *
 * @param data - The process step or transition element to show the tooltip for.
 * @param timestamp - The current timestamp of the process mining component.
 */
export function RenderTooltip({ data, timestamp }: RenderTooltipProps) {
  let label = ''
  if ('sourceLabel' in data && 'targetLabel' in data) {
    label = `${data.sourceLabel} → ${data.targetLabel}`
  } else if ('label' in data) {
    label = `${data.label}`
  }

  return (
    <div className="yfiles-react-tooltip">
      <div>{label}</div>
      {data.heat && timestamp && <div>Heat: {data.heat.getValue(timestamp)}</div>}
    </div>
  )
}
