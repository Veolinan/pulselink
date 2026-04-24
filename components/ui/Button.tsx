import { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type Props = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  type?: 'button' | 'submit'
  className?: string
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-2 active:scale-[0.98]',
  secondary: 'bg-paper border border-line text-ink hover:bg-paper-2 active:scale-[0.98]',
  ghost: 'bg-transparent text-ink-2 hover:text-ink active:scale-[0.98]',
  danger: 'bg-brand-red text-paper hover:bg-red-800 active:scale-[0.98]',
}

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs rounded-lg',
  md: 'px-6 py-2.5 text-sm rounded-xl',
  lg: 'px-8 py-3.5 text-sm rounded-full',
}

export default function Button({
  children,
  onClick,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  fullWidth,
  type = 'button',
  className = '',
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        font-medium transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : children}
    </button>
  )
}