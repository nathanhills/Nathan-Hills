// Mirrors backend/app/finance.py so the comparison chart can recompute
// instantly on every slider move without a network round trip.

const MAX_MONTHS = 600

export interface PayoffSimulation {
  months: number | null
  totalInterest: number | null
  schedule: number[]
}

export function monthlyRate(apr: number): number {
  return apr / 100 / 12
}

export function amortizedPayment(balance: number, apr: number, months: number): number {
  const r = monthlyRate(apr)
  if (r === 0) return balance / months
  return (balance * r) / (1 - Math.pow(1 + r, -months))
}

export function minViablePayment(balance: number, apr: number): number {
  return balance * monthlyRate(apr)
}

export function simulateFixedPayment(balance: number, apr: number, payment: number): PayoffSimulation {
  const r = monthlyRate(apr)
  const schedule = [balance]
  let totalInterest = 0
  let bal = balance
  let months = 0
  while (bal > 0.005 && months < MAX_MONTHS) {
    const interest = bal * r
    const principal = payment - interest
    if (principal <= 0) {
      return { months: null, totalInterest: null, schedule }
    }
    bal = Math.max(0, bal - principal)
    totalInterest += interest
    months += 1
    schedule.push(bal)
  }
  return { months, totalInterest, schedule }
}

interface MinimalDebt {
  balance: number
  apr: number
  minPayment: number
}

export function combinedBaseline(debts: MinimalDebt[]): PayoffSimulation {
  const sims = debts.map((d) => simulateFixedPayment(d.balance, d.apr, d.minPayment))
  const maxLen = Math.max(...sims.map((s) => s.schedule.length))
  const schedule: number[] = []
  for (let i = 0; i < maxLen; i++) {
    let total = 0
    for (const s of sims) {
      total += i < s.schedule.length ? s.schedule[i] : 0
    }
    schedule.push(total)
  }
  return {
    months: Math.max(...sims.map((s) => s.months ?? 0)),
    totalInterest: sims.reduce((sum, s) => sum + (s.totalInterest ?? 0), 0),
    schedule,
  }
}
