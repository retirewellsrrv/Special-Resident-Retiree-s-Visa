import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  variant?: 'default' | 'centered'
}

export function PageHeader({ title, description, actions, variant = 'default' }: PageHeaderProps) {
  if (variant === 'centered') {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
        )}
        {actions && <div className="mt-2">{actions}</div>}
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-medium text-brand-neutral-900">{title}</h1>
        {description && (
          <p className="text-sm text-brand-neutral-500 mt-1 max-w-xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
