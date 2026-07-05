import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  className?: string
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`rounded-full border border-mint-400/20 bg-mint-400/10 px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.06em] text-mint-400 ${className}`}
    >
      {children}
    </span>
  )
}
