import type { ReactNode } from 'react'
import { StarIcon } from './Icons'

interface BadgeProps {
  children: ReactNode
}

export function RecommendedBadge({ children }: BadgeProps) {
  return (
    <span className="badge badge-recommended">
      <StarIcon size={12} />
      {children}
    </span>
  )
}
