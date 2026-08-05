import type { ReactNode } from 'react'

interface InsightCardProps {
  tone: 'critical' | 'good'
  icon: ReactNode
  eyebrow: string
  title: string
  children: ReactNode
}

export default function InsightCard({ tone, icon, eyebrow, title, children }: InsightCardProps) {
  return (
    <div className={`insight-card insight-card-${tone}`}>
      <div className="insight-card-icon">{icon}</div>
      <div className="insight-card-body">
        <span className="insight-card-eyebrow">{eyebrow}</span>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  )
}
