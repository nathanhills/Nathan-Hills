import { useMemo, useState } from 'react'
import type { Debt } from '../types'
import { amortizedPayment, combinedBaseline, minViablePayment, simulateFixedPayment } from '../lib/amortization'
import { formatDollars, formatDuration } from '../lib/format'
import PayoffChart from './PayoffChart'

interface Props {
  cards: Debt[]
}

const DEFAULT_RATE = 14.5
const DEFAULT_TERM = 36

export default function PayoffExplorer({ cards }: Props) {
  const totalBalance = useMemo(() => cards.reduce((sum, c) => sum + c.balance, 0), [cards])
  const baseline = useMemo(
    () => combinedBaseline(cards.map((c) => ({ balance: c.balance, apr: c.apr, minPayment: c.minPayment }))),
    [cards],
  )

  const [rate, setRate] = useState(DEFAULT_RATE)
  const [payment, setPayment] = useState(() => Math.ceil(amortizedPayment(totalBalance, DEFAULT_RATE, DEFAULT_TERM)))

  const minPayment = Math.ceil(minViablePayment(totalBalance, rate) + 10)
  const maxPayment = 1200

  function handleRateChange(value: number) {
    setRate(value)
    const newMin = Math.ceil(minViablePayment(totalBalance, value) + 10)
    setPayment((p) => Math.max(p, newMin))
  }

  const next = useMemo(() => simulateFixedPayment(totalBalance, rate, payment), [totalBalance, rate, payment])

  const interestSaved = next.totalInterest !== null ? baseline.totalInterest! - next.totalInterest : null
  const monthsSaved = next.months !== null ? baseline.months! - next.months : null

  return (
    <section className="explorer-card">
      <h2>See what changes</h2>
      <p className="explorer-sub">
        Drag the rate and payment to see how consolidating your {cards.length} cards could change your payoff —
        compared with paying just the minimums shown today.
      </p>

      <div className="explorer-controls">
        <label className="slider-control">
          <span className="slider-label">
            <span>Interest rate</span>
            <span className="slider-value">{rate.toFixed(2)}%</span>
          </span>
          <input
            type="range"
            min={5}
            max={27}
            step={0.25}
            value={rate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
          />
        </label>

        <label className="slider-control">
          <span className="slider-label">
            <span>Monthly payment</span>
            <span className="slider-value">{formatDollars(payment)}/mo</span>
          </span>
          <input
            type="range"
            min={minPayment}
            max={maxPayment}
            step={5}
            value={payment}
            onChange={(e) => setPayment(Number(e.target.value))}
          />
        </label>

        <div className="slider-control slider-control-readout">
          <span className="slider-label">
            <span>Debt-free in</span>
          </span>
          <div className="readout-value">{next.months !== null ? formatDuration(next.months) : '—'}</div>
        </div>
      </div>

      <PayoffChart
        current={baseline.schedule}
        next={next.schedule}
        currentLabel="Paying minimums"
        nextLabel="Your new plan"
      />

      <div className="explorer-summary">
        <div className="explorer-stat">
          <span className="explorer-stat-label">Interest saved</span>
          <span className="explorer-stat-value tone-good">
            {interestSaved !== null ? formatDollars(Math.max(0, interestSaved)) : '—'}
          </span>
        </div>
        <div className="explorer-stat">
          <span className="explorer-stat-label">Time saved</span>
          <span className="explorer-stat-value tone-good">
            {monthsSaved !== null ? formatDuration(Math.max(0, monthsSaved)) : '—'}
          </span>
        </div>
      </div>
    </section>
  )
}
