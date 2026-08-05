export function formatDollars(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function formatDollarsCompact(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
  }
  return `$${Math.round(value)}`
}

export function formatDuration(months: number): string {
  if (months < 12) return `${Math.round(months)} mo`
  const years = Math.floor(months / 12)
  const rem = Math.round(months % 12)
  return rem === 0 ? `${years} yr` : `${years} yr ${rem} mo`
}

export function niceStep(rough: number): number {
  if (rough <= 0) return 1
  const exponent = Math.floor(Math.log10(rough))
  const fraction = rough / Math.pow(10, exponent)
  let niceFraction: number
  if (fraction <= 1) niceFraction = 1
  else if (fraction <= 2) niceFraction = 2
  else if (fraction <= 5) niceFraction = 5
  else niceFraction = 10
  return niceFraction * Math.pow(10, exponent)
}
