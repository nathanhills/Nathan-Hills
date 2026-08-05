import type { DebtsResponse, Plan, PlanDetail } from './types'

const API_BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Request failed: ${init?.method ?? 'GET'} ${path} (${res.status})`)
  }
  return res.json()
}

export function getDebts(): Promise<DebtsResponse> {
  return request<DebtsResponse>('/debts')
}

export function getPlans(): Promise<Plan[]> {
  return request<Plan[]>('/plans')
}

export function getPlan(planId: string): Promise<PlanDetail> {
  return request<PlanDetail>(`/plans/${planId}`)
}

export function updateStep(planId: string, stepId: string, completed: boolean): Promise<PlanDetail> {
  return request<PlanDetail>(`/plans/${planId}/steps/${stepId}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  })
}
