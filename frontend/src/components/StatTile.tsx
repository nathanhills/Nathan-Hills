interface StatTileProps {
  label: string
  value: string
  tone?: 'default' | 'good'
}

export default function StatTile({ label, value, tone = 'default' }: StatTileProps) {
  return (
    <div className="stat-tile">
      <span className="stat-tile-label">{label}</span>
      <span className={`stat-tile-value ${tone === 'good' ? 'tone-good' : ''}`}>{value}</span>
    </div>
  )
}
