/**
 * The properties required to render a heat gauge component.
 */
export interface RenderHeatGaugeProps {
  /**
   * The heat value that should be displayed in the gauge.
   */
  heat: number
  /**
   * The size for the heat gauge.
   */
  size: number
}

/**
 * Renders a gauge that displays the current given heat value.
 *
 * The gauge is part of the default {@link RenderProcessStep} but can also added to a custom process step
 * visualization.
 *
 * ```tsx
 * function CustomProcessStep({ dataItem, timestamp }: RenderProcessStepProps) {
 *   const heat = dataItem.heat?.getValue(timestamp) ?? 0
 *   const normalizedHeat = Math.min(1, heat / (dataItem.capacity ?? 100))
 *   return (
 *     <div className="custom-process-step">
 *       <div className="title">{dataItem.label}</div>
 *       <div>Heat: {heat}</div>
 *       <div>Capacity: {dataItem.capacity}</div>
 *       <div className="gauge">
 *         <RenderHeatGauge heat={normalizedHeat} size={50} />
 *       </div>
 *     </div>
 *   )
 * }
 *
 * function App() {
 *   return <ProcessMining eventLog={eventLog} renderProcessStep={CustomProcessStep}></ProcessMining>
 * }
 * ```
 */
export function RenderHeatGauge({ heat, size }: RenderHeatGaugeProps) {
  const { cx, cy, r, thickness } = getCircleLayout(size)
  const currentHeat = heat ?? 0.8

  const perimeter = r * 2 * Math.PI
  const length = perimeter * (1 - currentHeat)
  const color = getIntensityColor(currentHeat)

  return (
    <>
      <svg width={size} height={size}>
        <g style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={'#6e6e6e'}
            fill={'none'}
            strokeWidth={thickness + 4}
          ></circle>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={'none'}
            stroke={'#dcdcdc'}
            strokeWidth={thickness}
          ></circle>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={'none'}
            stroke={color}
            strokeWidth={thickness}
            strokeDashoffset={length}
            strokeDasharray={perimeter}
          ></circle>
        </g>
      </svg>
    </>
  )
}

/**
 * Gets the radius, center and thickness of the gauge circle
 * @param height the height of the heat gauge
 */
function getCircleLayout(height: number): {
  thickness: number
  r: number
  cx: number
  cy: number
} {
  const thickness = Math.max(height / 4, 10)
  const r = height / 2 - thickness / 2 - height / 20
  const cx = height / 2
  const cy = height / 2

  return { thickness, r, cx, cy }
}

/**
 * Returns the color associated with the given intensity value from blue (low) to red (high).
 */
function getIntensityColor(value: number): string {
  return `rgb(${(16 + value * 239) | 0}, ${((1 - value) * 239) | 16}, 16)`
}
