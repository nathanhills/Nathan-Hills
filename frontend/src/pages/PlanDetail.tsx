import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPlan, updateStep } from '../api'
import type { PlanDetail as PlanDetailType } from '../types'
import StatTile from '../components/StatTile'
import ProgressMeter from '../components/ProgressMeter'
import StepList from '../components/StepList'
import PayoffChart from '../components/PayoffChart'
import { RecommendedBadge } from '../components/Badge'
import { ArrowLeftIcon, CheckIcon } from '../components/Icons'
import { formatDollars, formatDuration } from '../lib/format'

export default function PlanDetail() {
  const { planId } = useParams<{ planId: string }>()
  const [plan, setPlan] = useState<PlanDetailType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!planId) return
    getPlan(planId)
      .then(setPlan)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load this plan'))
  }, [planId])

  async function handleToggle(stepId: string, completed: boolean) {
    if (!planId) return
    const updated = await updateStep(planId, stepId, completed)
    setPlan(updated)
  }

  if (error) return <main className="page"><p className="error">{error}</p></main>
  if (!plan) return <main className="page"><p>Loading plan…</p></main>

  return (
    <main className="page">
      <Link to="/" className="back-link">
        <ArrowLeftIcon size={15} /> All options
      </Link>

      <header className="page-header">
        {plan.recommended && <RecommendedBadge>Recommended</RecommendedBadge>}
        <h1>{plan.name}</h1>
        <p className="page-subtitle">{plan.tagline}</p>
      </header>

      {plan.recommendedReason && (
        <div className="callout">
          <CheckIcon size={16} className="tone-good" />
          <p>{plan.recommendedReason}</p>
        </div>
      )}

      <div className="stat-tile-grid">
        <StatTile label="Monthly payment" value={`${formatDollars(plan.monthlyPayment)}/mo`} />
        <StatTile label="Debt-free in" value={formatDuration(plan.months)} />
        <StatTile label="Total cost" value={formatDollars(plan.totalCost)} />
        <StatTile label="You'll save" value={formatDollars(plan.interestSaved)} tone="good" />
      </div>

      <section className="detail-section">
        <div className="detail-section-header">
          <h2>Progress to debt-free</h2>
          <ProgressMeter percent={plan.progressPercent} />
        </div>
        <PayoffChart
          current={plan.baselineSchedule}
          next={plan.schedule}
          currentLabel="Paying minimums"
          nextLabel={plan.name}
        />
      </section>

      <section className="detail-section">
        <h2>Steps to complete this plan</h2>
        <StepList steps={plan.steps} onToggle={handleToggle} />
      </section>

      <section className="detail-section pros-cons-section">
        <div>
          <h3>Pros</h3>
          <ul className="pros-cons-list pros-list">
            {plan.pros.map((pro) => (
              <li key={pro}>{pro}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Cons</h3>
          <ul className="pros-cons-list cons-list">
            {plan.cons.map((con) => (
              <li key={con}>{con}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
