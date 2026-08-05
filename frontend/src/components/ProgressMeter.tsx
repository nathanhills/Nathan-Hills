interface Props {
  percent: number
}

export default function ProgressMeter({ percent }: Props) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="progress-meter">
      <div className="progress-meter-track">
        <div className="progress-meter-fill" style={{ width: `${clamped}%` }} />
      </div>
      <span className="progress-meter-value">{clamped.toFixed(0)}% complete</span>
    </div>
  )
}
