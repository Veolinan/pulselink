type Props = {
  label?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  type?: string
  error?: string
  hint?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
  autoFocus?: boolean
  disabled?: boolean
  rightLabel?: { text: string; onClick: () => void }
}

export default function Input({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  hint,
  onKeyDown,
  autoFocus,
  disabled,
  rightLabel,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {(label || rightLabel) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="label-caps text-ink-3">{label}</label>
          )}
          {rightLabel && (
            <button
              type="button"
              onClick={rightLabel.onClick}
              className="text-xs text-brand-red font-medium hover:text-red-800 transition-colors"
            >
              {rightLabel.text}
            </button>
          )}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className={`
          w-full px-0 py-2.5 bg-transparent border-b text-body text-ink
          placeholder:text-ink-3 focus:outline-none transition-colors
          disabled:opacity-40
          ${error
            ? 'border-brand-red focus:border-brand-red'
            : 'border-line focus:border-ink'
          }
        `}
      />
      {error && <p className="text-xs text-brand-red">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-3">{hint}</p>}
    </div>
  )
}