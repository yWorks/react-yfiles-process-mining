import { ProcessStep, Transition } from '../core/process-graph-extraction.ts'
import { RenderPopupProps as RenderPopupPropsBase } from '@yworks/react-yfiles-core'

/**
 * The props passed to the process mining popup component for rendering the popup.
 */
export interface RenderPopupProps extends RenderPopupPropsBase<ProcessStep | Transition> {
  /**
   * The current timestamp of the {@link ProcessMining} component.
   */
  timestamp: number
}

/**
 * A default template for the process mining popup that shows the label of the process step or transition
 * the heat, and the capacity value.
 *
 * ```tsx
 * function App() {
 *   return (
 *     <ProcessMining eventLog={eventLog} renderPopup={RenderPopup}></ProcessMining>
 *   )
 * }
 * ```
 *
 * @param data - The process step or transition element to show the tooltip for.
 */
export function RenderPopup({ item, onClose, timestamp }: RenderPopupProps) {
  let popupContent = ''
  if ('sourceLabel' in item && 'targetLabel' in item) {
    popupContent = `${item.sourceLabel} → ${item.targetLabel}`
  } else if ('label' in item) {
    popupContent = `${item.label}`
  }

  return (
    <div className="yfiles-react-popup__content">
      <div className="yfiles-react-popup__items-props">
        {popupContent}
        {item.capacity && <div>Capacity: {Math.round(item.capacity * 100) / 100}</div>}
        {item.heat && timestamp && <div>Heat: {item.heat.getValue(timestamp)}</div>}
      </div>
      <button className="yfiles-react-popup__close-button" onClick={() => onClose()}>
        x
      </button>
    </div>
  )
}
