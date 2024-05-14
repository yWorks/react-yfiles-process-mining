import SimpleProcessMining from '../examples/SimpleProcessMining'
import HeatMap from '../examples/Heatmap'
import TransitionEvents from '../examples/TransitionEvents'
import Transitions from '../examples/TransitionStyling'
import ProcessStepStyling from '../examples/ProcessStepStyling'
import UIElements from '../examples/UIElements'
import Export from '../examples/Export'
import GraphSearch from '../examples/Search'
import Events from '../examples/Events'
import Tooltips from '../examples/Tooltips'
import Popup from '../examples/Popup'
import Layout from '../examples/Layout'
import MultipleComponents from '../examples/MultipleComponents'
import SwitchRenderProcessStep from '../examples/SwitchRenderProcessStep'

export interface IRoute {
  title: string
  description: string
  path: string
  component: React.ComponentType
}

const routes: IRoute[] = [
  {
    title: 'Simple Process Mining',
    description: 'Setup Example',
    path: 'simple-process-mining',
    component: SimpleProcessMining
  },
  {
    title: 'Heatmap',
    description: 'Demonstrates heatmap options',
    path: 'heatmap',
    component: HeatMap
  },
  {
    title: 'Transition Events',
    description: 'Demonstrates customizing transition events',
    path: 'transition-events',
    component: TransitionEvents
  },
  {
    title: 'Process Step Styling',
    description: 'How to render the process steps',
    path: 'process-step-styling',
    component: ProcessStepStyling
  },
  {
    title: 'Transition Styling',
    description: 'How to customize the transition style',
    path: 'transition-styling',
    component: Transitions
  },
  {
    title: 'UI Elements',
    description: 'How to add controls, overview, context menu, popup, and tooltips',
    path: 'ui-elements',
    component: UIElements
  },
  {
    title: 'Search',
    description: 'Simple example to demonstrate the search component',
    path: 'search',
    component: GraphSearch
  },
  {
    title: 'Export',
    description: 'An example demonstrating the export to an image and printing',
    path: 'export',
    component: Export
  },
  {
    title: 'Events',
    description: 'An example demonstrating how to handle selected, focused and hovered items',
    path: 'events',
    component: Events
  },
  {
    title: 'Tooltips',
    description: 'An example demonstrating the tooltip component',
    path: 'tooltip',
    component: Tooltips
  },
  {
    title: 'Popup',
    description: 'An example demonstrating the popup component',
    path: 'popup',
    component: Popup
  },
  {
    title: 'Layout',
    description: 'An example demonstrating how to run a layout',
    path: 'layout',
    component: Layout
  },
  {
    title: 'Multiple Components',
    description: 'An example with more than one process mining component',
    path: 'multiple-components',
    component: MultipleComponents
  },
  {
    title: 'Switch Process Step Component',
    description: 'An example where the styling of the process steps is changed',
    path: 'switch-render-process-step',
    component: SwitchRenderProcessStep
  }
]

export default routes
