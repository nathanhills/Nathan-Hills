import { Link } from 'react-router-dom'
import type { Plan } from '../types'
import { formatDollars, formatDuration } from '../lib/format'
import { RecommendedBadge } from './Badge'
import { CheckIcon } from './Icons'

interface Props {
  plan: Plan
}

export default function PlanCard({ plan }: Props) {
  return (
    <Link to={`/plans/${plan.id}`} className={`plan-card ${plan.recommended ? 'plan-card-recommended' : ''}`}>
      {plan.recommended && <RecommendedBadge>Recommended</RecommendedBadge>}
      <h3>{plan.name}</h3>
      <p className="plan-card-tagline">{plan.tagline}</p>

      <div className="plan-card-stats">
        <div>
          <span className="plan-card-stat-value">{formatDollars(plan.monthlyPayment)}</span>
          <span className="plan-card-stat-label">per month</span>
        </div>
        <div>
          <span className="plan-card-stat-value">{formatDuration(plan.months)}</span>
          <span className="plan-card-stat-label">to debt-free</span>
        </div>
        <div>
          <span className="plan-card-stat-value tone-good">{formatDollars(plan.interestSaved)}</span>
          <span className="plan-card-stat-label">saved</span>
        </div>
      </div>

      <ul className="plan-card-pros">
        {plan.pros.slice(0, 2).map((pro) => (
          <li key={pro}>
            <CheckIcon size={13} className="tone-good" />
            {pro}
          </li>
        ))}
      </ul>
      <p className="plan-card-con">{plan.cons[0]}</p>

      <span className="plan-card-cta">See full plan →</span>
    </Link>
  )
}
