import { useState } from 'react'
import type { PlanStep } from '../types'
import { CheckIcon, ChevronDownIcon } from './Icons'

interface Props {
  steps: PlanStep[]
  onToggle: (stepId: string, completed: boolean) => void
}

export default function StepList({ steps, onToggle }: Props) {
  return (
    <ol className="step-list">
      {steps.map((step, i) => (
        <StepItem key={step.id} step={step} index={i + 1} onToggle={onToggle} />
      ))}
    </ol>
  )
}

function StepItem({ step, index, onToggle }: { step: PlanStep; index: number; onToggle: Props['onToggle'] }) {
  const [expanded, setExpanded] = useState(!step.completed)
  const hasSubsteps = step.substeps.length > 0

  return (
    <li className={`step-item ${step.completed ? 'step-item-done' : ''}`}>
      <div className="step-item-row">
        <button
          type="button"
          className="step-toggle"
          role="checkbox"
          aria-checked={step.completed}
          onClick={() => onToggle(step.id, !step.completed)}
        >
          <span className="step-checkbox" aria-hidden="true">
            {step.completed ? <CheckIcon size={13} /> : index}
          </span>
          <span className="step-title">{step.title}</span>
        </button>
        {hasSubsteps && (
          <button
            type="button"
            className={`step-expand ${expanded ? 'step-expand-open' : ''}`}
            aria-label={expanded ? 'Collapse steps' : 'Expand steps'}
            onClick={() => setExpanded((v) => !v)}
          >
            <ChevronDownIcon size={16} />
          </button>
        )}
      </div>

      {hasSubsteps && expanded && (
        <ul className="substep-list">
          {step.substeps.map((sub) => (
            <li key={sub.id} className={`substep-item ${sub.completed ? 'substep-item-done' : ''}`}>
              <button
                type="button"
                className="step-toggle step-toggle-sub"
                role="checkbox"
                aria-checked={sub.completed}
                onClick={() => onToggle(sub.id, !sub.completed)}
              >
                <span className="step-checkbox step-checkbox-sub" aria-hidden="true">
                  {sub.completed && <CheckIcon size={11} />}
                </span>
                <span className="step-title">{sub.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
