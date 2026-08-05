export interface Debt {
  id: string
  name: string
  type: 'credit_card' | 'mortgage'
  balance: number
  apr: number
  minPayment: number
  remainingMonths: number | null
  isHighInterest: boolean
  isGoodDebt: boolean
}

export interface HighInterestSummary {
  count: number
  totalBalance: number
  avgApr: number
  totalMinPayment: number
  baselineMonths: number
  baselineTotalInterest: number
}

export interface GoodDebtSummary {
  totalBalance: number
  apr: number
  monthlyPayment: number
  remainingMonths: number
}

export interface DebtsResponse {
  debts: Debt[]
  highInterestSummary: HighInterestSummary
  goodDebtSummary: GoodDebtSummary
}

export interface Plan {
  id: string
  type: 'personal_loan' | 'balance_transfer' | 'avalanche'
  name: string
  tagline: string
  pros: string[]
  cons: string[]
  recommended: boolean
  recommendedReason: string | null
  monthlyPayment: number
  months: number
  totalCost: number
  interestSaved: number
  monthsSaved: number
  requiresNewCredit: boolean
}

export interface PlanStep {
  id: string
  title: string
  description: string | null
  completed: boolean
  substeps: PlanStep[]
}

export interface PlanDetail extends Plan {
  schedule: number[]
  baselineSchedule: number[]
  progressPercent: number
  steps: PlanStep[]
}
