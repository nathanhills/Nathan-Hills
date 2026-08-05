import { useEffect, useState } from 'react'
import { getDebts, getPlans } from '../api'
import type { DebtsResponse, Plan } from '../types'
import InsightCard from '../components/InsightCard'
import PayoffExplorer from '../components/PayoffExplorer'
import PlanCard from '../components/PlanCard'
import { AlertIcon, HomeIcon } from '../components/Icons'
import { formatDollars, formatDuration } from '../lib/format'

export default function Overview() {
  const [data, setData] = useState<DebtsResponse | null>(null)
  const [plans, setPlans] = useState<Plan[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getDebts(), getPlans()])
      .then(([debts, planList]) => {
        setData(debts)
        setPlans(planList)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load your accounts'))
  }, [])

  if (error) return <main className="page"><p className="error">{error}</p></main>
  if (!data || !plans) return <main className="page"><p>Loading your accounts…</p></main>

  const { highInterestSummary: hi, goodDebtSummary: good } = data
  const cards = data.debts.filter((d) => d.type === 'credit_card')

  return (
    <main className="page">
      <header className="page-header">
        <span className="page-eyebrow">Your accounts · synced just now</span>
        <h1>Let's pay down your debt</h1>
      </header>

      <PayoffExplorer cards={cards} />

      <div className="insight-grid">
        <InsightCard
          tone="critical"
          icon={<AlertIcon />}
          eyebrow="Needs attention"
          title={`${formatDollars(hi.totalBalance)} in high-interest debt`}
        >
          Spread across {hi.count} credit cards averaging <strong>{hi.avgApr}% APR</strong>. At minimum payments
          alone, this takes <strong>{formatDuration(hi.baselineMonths)}</strong> and costs{' '}
          <strong>{formatDollars(hi.baselineTotalInterest)}</strong> in interest.
        </InsightCard>

        <InsightCard tone="good" icon={<HomeIcon />} eyebrow="No action needed" title={`${formatDollars(good.totalBalance)} mortgage — good debt`}>
          A {good.apr}% rate with {formatDuration(good.remainingMonths)} left is low-cost, tax-advantaged, and
          building equity. Leave this one alone.
        </InsightCard>
      </div>

      <section className="plans-section">
        <h2>Ways to pay it off faster</h2>
        <p className="explorer-sub">Three ways to tackle the {formatDollars(hi.totalBalance)} across your cards.</p>
        <div className="plan-grid">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </section>
    </main>
  )
}
