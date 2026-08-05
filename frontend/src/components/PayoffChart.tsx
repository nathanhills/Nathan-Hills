import { useId, useMemo, useRef, useState } from 'react'
import { formatDollars, formatDollarsCompact, formatDuration, niceStep } from '../lib/format'

interface Props {
  current: number[]
  next: number[]
  currentLabel: string
  nextLabel: string
}

const W = 100
const H = 58
const PLOT_LEFT = 12
const PLOT_RIGHT = 98
const PLOT_TOP = 4
const PLOT_BOTTOM = 40
const X_LABEL_Y = 47

function toPoints(series: number[], domainMonths: number): string {
  return series
    .map((value, i) => {
      const x = PLOT_LEFT + (i / domainMonths) * (PLOT_RIGHT - PLOT_LEFT)
      return `${x},${value}`
    })
    .join(' ')
}

export default function PayoffChart({ current, next, currentLabel, nextLabel }: Props) {
  const gradientId = `payoff-gradient-${useId().replace(/:/g, '')}`
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hoverMonth, setHoverMonth] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)

  const domainMonths = Math.max(current.length, next.length) - 1
  const startBalance = current[0]
  const yStep = niceStep(startBalance / 4)
  const yAxisMax = yStep * 4
  const yTicks = [0, yAxisMax]

  const yScale = (value: number) => PLOT_TOP + (1 - value / yAxisMax) * (PLOT_BOTTOM - PLOT_TOP)
  const xScale = (month: number) => PLOT_LEFT + (month / domainMonths) * (PLOT_RIGHT - PLOT_LEFT)

  const currentScaled = useMemo(
    () => toPoints(current.map(yScale), domainMonths),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current, domainMonths, yAxisMax],
  )
  const nextScaled = useMemo(
    () => toPoints(next.map(yScale), domainMonths),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [next, domainMonths, yAxisMax],
  )

  const currentEndMonth = current.length - 1
  const nextEndMonth = next.length - 1

  const nextAreaPoints = useMemo(
    () => `${xScale(0)},${PLOT_BOTTOM} ${nextScaled} ${xScale(nextEndMonth)},${PLOT_BOTTOM}`,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nextScaled, nextEndMonth, domainMonths],
  )

  const xTicks = [0, domainMonths]
  const labelsClose = Math.abs(currentEndMonth - nextEndMonth) / domainMonths < 0.08

  function labelAnchor(month: number): 'start' | 'middle' | 'end' {
    const x = xScale(month)
    if (x > PLOT_RIGHT - 15) return 'end'
    if (x < PLOT_LEFT + 15) return 'start'
    return 'middle'
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const plotX = Math.min(PLOT_RIGHT, Math.max(PLOT_LEFT, fraction * W))
    const monthFraction = (plotX - PLOT_LEFT) / (PLOT_RIGHT - PLOT_LEFT)
    setHoverMonth(Math.round(monthFraction * domainMonths))
  }

  const tooltipLeftPct = hoverMonth !== null ? Math.min(85, Math.max(15, (xScale(hoverMonth) / W) * 100)) : 0
  const valueAt = (series: number[], month: number) => (month < series.length ? series[month] : 0)

  const tableMonths = useMemo(() => {
    const months = new Set<number>()
    for (let m = 0; m <= domainMonths; m += 6) months.add(m)
    months.add(currentEndMonth)
    months.add(nextEndMonth)
    months.add(domainMonths)
    return Array.from(months).sort((a, b) => a - b)
  }, [domainMonths, currentEndMonth, nextEndMonth])

  return (
    <div className="payoff-chart-card">
      <div className="chart-legend">
        <span className="chart-legend-item">
          <span className="chart-legend-key chart-legend-key-next" />
          {nextLabel}
        </span>
        <span className="chart-legend-item">
          <span className="chart-legend-key chart-legend-key-current" />
          {currentLabel}
        </span>
      </div>
      <div
        className="payoff-chart-wrap"
        ref={wrapRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverMonth(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="payoff-chart" role="img" aria-label={`Balance over time: ${currentLabel} versus ${nextLabel}`}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className="chart-area-stop-start" />
              <stop offset="100%" className="chart-area-stop-end" />
            </linearGradient>
          </defs>

          {yTicks.map((t) => (
            <g key={t}>
              <line x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={yScale(t)} y2={yScale(t)} className="chart-gridline" />
              <text x={PLOT_LEFT - 1.5} y={yScale(t)} className="chart-axis-label chart-y-label">
                {formatDollarsCompact(t)}
              </text>
            </g>
          ))}

          {xTicks.map((m) => (
            <text key={m} x={xScale(m)} y={X_LABEL_Y} className="chart-axis-label chart-x-label" textAnchor="middle">
              {m === 0 ? 'Today' : formatDuration(m)}
            </text>
          ))}

          <polygon points={nextAreaPoints} fill={`url(#${gradientId})`} className="chart-area-next" />

          <polyline points={currentScaled} className="chart-line chart-line-current" />
          <polyline points={nextScaled} className="chart-line chart-line-next" />

          {hoverMonth !== null && (
            <line
              x1={xScale(hoverMonth)}
              x2={xScale(hoverMonth)}
              y1={PLOT_TOP}
              y2={PLOT_BOTTOM}
              className="chart-crosshair"
            />
          )}

          <circle cx={xScale(currentEndMonth)} cy={yScale(0)} r="2.2" className="chart-marker-ring" />
          <circle cx={xScale(currentEndMonth)} cy={yScale(0)} r="1.5" className="chart-marker chart-marker-current" />
          <text
            x={xScale(currentEndMonth)}
            y={yScale(0) - (labelsClose ? 7.5 : 3)}
            textAnchor={labelAnchor(currentEndMonth)}
            className="chart-end-label chart-end-label-current"
          >
            {formatDuration(currentEndMonth)}
          </text>

          <circle cx={xScale(nextEndMonth)} cy={yScale(0)} r="2.2" className="chart-marker-ring" />
          <circle cx={xScale(nextEndMonth)} cy={yScale(0)} r="1.5" className="chart-marker chart-marker-next" />
          <text
            x={xScale(nextEndMonth)}
            y={yScale(0) - 3}
            textAnchor={labelAnchor(nextEndMonth)}
            className="chart-end-label chart-end-label-next"
          >
            {formatDuration(nextEndMonth)}
          </text>
        </svg>

        {hoverMonth !== null && (
          <div className="chart-tooltip" style={{ left: `${tooltipLeftPct}%` }}>
            <div className="chart-tooltip-month">{hoverMonth === 0 ? 'Today' : formatDuration(hoverMonth)}</div>
            <div className="chart-tooltip-row">
              <span className="chart-tooltip-key chart-tooltip-key-next" />
              <strong>{formatDollars(valueAt(next, hoverMonth))}</strong>
              <span className="chart-tooltip-series">{nextLabel}</span>
            </div>
            <div className="chart-tooltip-row">
              <span className="chart-tooltip-key chart-tooltip-key-current" />
              <strong>{formatDollars(valueAt(current, hoverMonth))}</strong>
              <span className="chart-tooltip-series">{currentLabel}</span>
            </div>
          </div>
        )}
      </div>

      <button type="button" className="chart-table-toggle" onClick={() => setShowTable((v) => !v)}>
        {showTable ? 'Hide table' : 'View as table'}
      </button>

      {showTable && (
        <table className="chart-table">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">{nextLabel}</th>
              <th scope="col">{currentLabel}</th>
            </tr>
          </thead>
          <tbody>
            {tableMonths.map((m) => (
              <tr key={m}>
                <td>{m === 0 ? 'Today' : formatDuration(m)}</td>
                <td>{formatDollars(valueAt(next, m))}</td>
                <td>{formatDollars(valueAt(current, m))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
