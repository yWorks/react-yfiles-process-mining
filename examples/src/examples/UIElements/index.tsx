import {
  Controls,
  Overview,
  ProcessMining,
  DefaultControlButtons,
  ProcessMiningProvider,
  ProcessStep,
  RenderPopupProps,
  RenderTooltipProps,
  useProcessMiningContext
} from '@yworks/react-yfiles-process-mining'
import EventLog from '../../data/EventLog.ts'
import './index.css'

function RenderHeatTooltip({ data }: RenderTooltipProps) {
  return <div className="tooltip">{`Heat: ${data.heat?.getValue(5.5)}`}</div>
}

function RenderHeatPopup({ item }: RenderPopupProps) {
  return <div className="popup">{`Heat: ${item.heat?.getValue(5.5)}`}</div>
}

function UIElements() {
  const { fitContent, zoomToItem, applyLayout } = useProcessMiningContext()
  return (
    <ProcessMining
      eventLog={EventLog}
      timestamp={5}
      renderTooltip={RenderHeatTooltip}
      renderPopup={RenderHeatPopup}
      contextMenuItems={(item: ProcessStep | null) => {
        if (item) {
          return [
            {
              title: 'Zoom to Item',
              action: () => {
                zoomToItem(item)
              }
            }
          ]
        }
        return [
          {
            title: 'Fit Content',
            action: () => {
              fitContent()
            }
          }
        ]
      }}
    >
      <Controls
        buttons={() => {
          const buttons = DefaultControlButtons()
          buttons.push({
            className: 'apply-layout',
            action: () => {
              applyLayout({ direction: 'left-to-right' })
            },
            tooltip: 'Apply Left-to-Right Layout'
          })
          return buttons
        }}
      ></Controls>
      <Overview></Overview>
    </ProcessMining>
  )
}

export default () => {
  return (
    <ProcessMiningProvider>
      <UIElements></UIElements>
    </ProcessMiningProvider>
  )
}
