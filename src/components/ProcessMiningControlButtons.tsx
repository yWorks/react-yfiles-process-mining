import {
  ControlButton,
  DefaultControlButtons as ControlButtonsBase
} from '@yworks/react-yfiles-core'

/**
 * Default [buttons]{@link ControlsProps.buttons} for the {@link Controls} component that provide
 * actions to interact with the viewport of the process mining.
 *
 * This includes the following buttons: zoom in, zoom out, zoom to the original size and fit the graph into the viewport.
 *
 * @returns an array of [control buttons]{@link ControlsProps.buttons}.
 *
 * ```tsx
 * function ProcessMiningDiagram() {
 *   return (
 *     <ProcessMining eventLog={eventLog}>
 *       <Controls buttons={DefaultControlButtons}></Controls>
 *     </ProcessMining>
 *   )
 * }
 * ```
 */
export function DefaultControlButtons(): ControlButton[] {
  return ControlButtonsBase()
}
