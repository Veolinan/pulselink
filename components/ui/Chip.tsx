type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'

type Props = {
  label: string
  variant?: Variant
  dot?: boolean
  pulse?: boolean
}

const VARIANTS: Record<Variant, string> = {
  default: 'bg-paper-2 text-ink-2 border-line',
  success: 'bg-green-50 text-green-800 border-green-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-brand-red-light text-brand-red border-brand-red/20',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  muted: 'bg-paper-2 text-ink-3 border-line',
}

const DOT_COLORS: Record<Variant, string> = {
  default: 'bg-ink-3',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-brand-red',
  info: 'bg-blue-500',
  muted: 'bg-ink-3',
}

export default function Chip({ label, variant = 'default', dot, pulse }: Props) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-label font-medium ${VARIANTS[variant]}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_COLORS[variant]} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {label}
    </span>
  )
}