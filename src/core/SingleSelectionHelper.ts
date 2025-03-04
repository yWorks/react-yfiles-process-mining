import {
  EventArgs,
  EventRecognizers,
  GraphComponent,
  GraphInputMode,
  GraphItemTypes,
  Command,
  IModelItem,
  KeyboardInputModeBinding,
  ExecuteCommandArgs,
  CanExecuteCommandArgs
} from '@yfiles/yfiles'

type Recognizer = (evt: EventArgs, eventSource: any) => boolean

let commandBindings: KeyboardInputModeBinding[] = []

/**
 * The previously set multi-selection recognizer
 */
let oldMultiSelectionRecognizer: Recognizer | null = null

/**
 * Restores the normal (multi-selection) behavior for the input mode and the commands of the given component.
 */
export function disableSingleSelection(graphComponent: GraphComponent) {
  const mode = graphComponent.inputMode as GraphInputMode
  // restore old settings
  mode.marqueeSelectionInputMode.enabled = true
  if (oldMultiSelectionRecognizer) {
    mode.multiSelectionRecognizer = oldMultiSelectionRecognizer
  }

  // re-activate commands
  mode.availableCommands.add(Command.TOGGLE_ITEM_SELECTION)
  mode.availableCommands.add(Command.SELECT_ALL)

  mode.navigationInputMode.availableCommands.add(Command.EXTEND_SELECTION_LEFT)
  mode.navigationInputMode.availableCommands.add(Command.EXTEND_SELECTION_UP)
  mode.navigationInputMode.availableCommands.add(Command.EXTEND_SELECTION_DOWN)
  mode.navigationInputMode.availableCommands.add(Command.EXTEND_SELECTION_RIGHT)

  // remove the previously registered command bindings
  for (const binding of commandBindings) {
    binding.remove()
  }
  commandBindings = []
}

/**
 * Enables single selection behavior for the input mode and the commands of the given component.
 */
export function enableSingleSelection(graphComponent: GraphComponent) {
  const mode = graphComponent.inputMode as GraphInputMode
  // remember old recognizer so we can restore it later
  oldMultiSelectionRecognizer = mode.multiSelectionRecognizer

  // disable marquee selection
  mode.marqueeSelectionInputMode.enabled = false
  // disable multi selection with Ctrl-Click
  mode.multiSelectionRecognizer = EventRecognizers.NEVER

  // deactivate commands that can lead to multi selection
  mode.availableCommands.remove(Command.TOGGLE_ITEM_SELECTION)
  mode.availableCommands.remove(Command.SELECT_ALL)

  mode.navigationInputMode.availableCommands.remove(Command.EXTEND_SELECTION_LEFT)
  mode.navigationInputMode.availableCommands.remove(Command.EXTEND_SELECTION_UP)
  mode.navigationInputMode.availableCommands.remove(Command.EXTEND_SELECTION_DOWN)
  mode.navigationInputMode.availableCommands.remove(Command.EXTEND_SELECTION_RIGHT)

  // add dummy command bindings that do nothing in order to prevent default behavior
  const dummyExecutedHandler = (_: ExecuteCommandArgs) => {}
  commandBindings.push(
    mode.keyboardInputMode.addCommandBinding(Command.EXTEND_SELECTION_LEFT, dummyExecutedHandler)
  )
  commandBindings.push(
    mode.keyboardInputMode.addCommandBinding(Command.EXTEND_SELECTION_UP, dummyExecutedHandler)
  )
  commandBindings.push(
    mode.keyboardInputMode.addCommandBinding(Command.EXTEND_SELECTION_DOWN, dummyExecutedHandler)
  )
  commandBindings.push(
    mode.keyboardInputMode.addCommandBinding(Command.EXTEND_SELECTION_RIGHT, dummyExecutedHandler)
  )

  // add custom binding for toggle item selection
  commandBindings.push(
    mode.keyboardInputMode.addCommandBinding(
      Command.TOGGLE_ITEM_SELECTION,
      (evt: ExecuteCommandArgs) => toggleItemSelectionExecuted(graphComponent, evt.parameter),
      (evt: CanExecuteCommandArgs) => toggleItemSelectionCanExecute(graphComponent, evt.parameter)
    )
  )
  // Also clear the selection - even though the setup works when more than one item is selected, it looks a bit
  // strange
  graphComponent.selection.clear()
}

/**
 * Checks if toggling the selection state of an item respecting the single selection policy is allowed
 * @param graphComponent The given graphComponent
 * @param parameter The given parameter
 */
function toggleItemSelectionCanExecute(graphComponent: GraphComponent, parameter: any): boolean {
  // if we have an item, the command can be executed
  const modelItem = parameter instanceof IModelItem ? parameter : graphComponent.currentItem
  return modelItem !== null
}

/**
 * Custom command handler that allows toggling the selection state of an item
 * respecting the single selection policy.
 * @param graphComponent The given graphComponent
 * @param parameter The given parameter
 */
function toggleItemSelectionExecuted(graphComponent: GraphComponent, parameter: any): void {
  // get the item
  const modelItem = parameter instanceof IModelItem ? parameter : graphComponent.currentItem
  const inputMode = graphComponent.inputMode as GraphInputMode

  // check if it allowed to be selected
  if (
    modelItem === null ||
    !graphComponent.graph.contains(modelItem) ||
    !GraphItemTypes.itemIsOfTypes(inputMode.selectableItems, modelItem) ||
    !inputMode.graphSelection
  ) {
    return
  }

  const isSelected = inputMode.graphSelection.includes(modelItem)
  if (isSelected) {
    // the item is selected and needs to be unselected - just clear the selection
    inputMode.graphSelection.clear()
  } else {
    // the item is unselected - unselect all other items and select the currentItem
    inputMode.graphSelection.clear()
    inputMode.setSelected(modelItem, true)
  }
}
