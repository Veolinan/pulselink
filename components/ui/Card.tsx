import { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6 md:p-8',
}

export default function Card({
  children,
  className = '',
  onClick,
  hover,
  padding = 'md',
}: Props) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-paper border border-line rounded-2xl
        ${PADDING[padding]}
        ${hover ? 'hover:border-ink-3 transition-colors cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}