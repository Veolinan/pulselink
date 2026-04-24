import { useRouter } from 'next/router'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  dark?: boolean
  onClick?: () => void
}

export default function Logo({ size = 'md', dark = false, onClick }: Props) {
  const router = useRouter()

  const sizes = {
    sm: { mark: 24, text: 'text-sm' },
    md: { mark: 30, text: 'text-base' },
    lg: { mark: 40, text: 'text-xl' },
  }

  const s = sizes[size]

  return (
    <button
      onClick={onClick ?? (() => router.push('/'))}
      className="flex items-center gap-2 group"
    >
      {/* Mark — red square with paper drop */}
      <div
        style={{ width: s.mark, height: s.mark }}
        className="rounded-lg bg-brand-red flex items-center justify-center flex-shrink-0"
      >
        <svg
          width={s.mark * 0.55}
          height={s.mark * 0.55}
          viewBox="0 0 18 22"
          fill="none"
        >
          <path
            d="M9 1C9 1 1 8 1 13.5a8 8 0 0016 0C17 8 9 1 9 1z"
            fill="white"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <span className={`${s.text} font-medium tracking-tight ${dark ? 'text-paper' : 'text-ink'}`}>
        Pulse
        <span
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          className="italic font-light"
        >
          link
        </span>
      </span>
    </button>
  )
}