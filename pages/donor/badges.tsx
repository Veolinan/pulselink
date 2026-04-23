type Badge = {
  id: string
  slug: string
  name: string
  description: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  trigger_type: string
  trigger_value: number
  earned: boolean
  earned_at?: string
}

const ALL_BADGES: Badge[] = [
  {
    id: '1',
    slug: 'first_drop',
    name: 'First drop',
    description: 'Your very first donation',
    tier: 'bronze',
    trigger_type: 'donation_count',
    trigger_value: 1,
    earned: true,
    earned_at: '2023-08-15',
  },
  {
    id: '2',
    slug: 'triple',
    name: 'Triple save',
    description: '3 donations completed',
    tier: 'bronze',
    trigger_type: 'donation_count',
    trigger_value: 3,
    earned: true,
    earned_at: '2024-03-20',
  },
  {
    id: '3',
    slug: 'silver_savior',
    name: 'Silver savior',
    description: '5 donations completed',
    tier: 'silver',
    trigger_type: 'donation_count',
    trigger_value: 5,
    earned: true,
    earned_at: '2024-12-12',
  },
  {
    id: '4',
    slug: 'litre_hero',
    name: 'Litre hero',
    description: 'Donated over 1 litre total',
    tier: 'silver',
    trigger_type: 'volume_ml',
    trigger_value: 1000,
    earned: true,
    earned_at: '2024-03-20',
  },
  {
    id: '5',
    slug: 'gold_guard',
    name: 'Gold guard',
    description: '10 donations completed',
    tier: 'gold',
    trigger_type: 'donation_count',
    trigger_value: 10,
    earned: false,
  },
  {
    id: '6',
    slug: 'century_club',
    name: 'Century club',
    description: '25 donations — elite status',
    tier: 'platinum',
    trigger_type: 'donation_count',
    trigger_value: 25,
    earned: false,
  },
]

const TIER_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  bronze: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    label: 'bg-orange-100 text-orange-800',
  },
  silver: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    label: 'bg-gray-100 text-gray-700',
  },
  gold: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    label: 'bg-amber-100 text-amber-800',
  },
  platinum: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    label: 'bg-purple-100 text-purple-800',
  },
}

function BadgeIcon({ tier, earned }: { tier: string; earned: boolean }) {
  if (!earned) {
    return (
      <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="7" y="10" width="6" height="6" rx="1" fill="#D3D1C7" />
          <path d="M8 10V8a2 2 0 014 0v2" stroke="#B4B2A9" strokeWidth="1.2" fill="none" />
        </svg>
      </div>
    )
  }

  const colors: Record<string, string> = {
    bronze: '#F0997B',
    silver: '#B4B2A9',
    gold: '#EF9F27',
    platinum: '#AFA9EC',
  }

  const strokes: Record<string, string> = {
    bronze: '#D85A30',
    silver: '#888780',
    gold: '#BA7517',
    platinum: '#534AB7',
  }

  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${TIER_STYLES[tier].border} ${TIER_STYLES[tier].bg}`}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3l2.2 4.4L19 8.5l-3.5 3.4.8 4.8L12 14.4l-4.3 2.3.8-4.8L5 8.5l4.8-.1L12 3z"
          fill={colors[tier]}
          stroke={strokes[tier]}
          strokeWidth="0.5"
        />
      </svg>
    </div>
  )
}

export default function Badges() {
  const earned = ALL_BADGES.filter(b => b.earned)
  const locked = ALL_BADGES.filter(b => !b.earned)

  return (
    <div className="px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900">Donor passport</h1>
        <p className="text-sm text-gray-400 mt-0.5">Felix · O+ · 7 donations · 2.70L</p>
      </div>

      {/* Progress bar toward next badge */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-gray-500">Progress to Gold guard</p>
          <p className="text-xs font-medium text-gray-700">7 / 10 donations</p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-amber-400 rounded-full transition-all"
            style={{ width: '70%' }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">3 more donations to unlock</p>
      </div>

      {/* Earned badges */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Earned · {earned.length}
        </p>
        <div className="flex flex-col gap-3">
          {earned.map((badge) => {
            const style = TIER_STYLES[badge.tier]
            return (
              <div
                key={badge.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${style.bg} ${style.border}`}
              >
                <BadgeIcon tier={badge.tier} earned={true} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${style.text}`}>{badge.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${style.label}`}>
                      {badge.tier}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{badge.description}</p>
                  {badge.earned_at && (
                    <p className="text-xs text-gray-300 mt-0.5">
                      Earned {new Date(badge.earned_at).toLocaleDateString('en-KE', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Locked badges */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Locked · {locked.length}
        </p>
        <div className="flex flex-col gap-3">
          {locked.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 opacity-60"
            >
              <BadgeIcon tier={badge.tier} earned={false} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{badge.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{badge.description}</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {badge.trigger_type === 'donation_count'
                    ? `${badge.trigger_value} donations needed`
                    : `${badge.trigger_value / 1000}L total needed`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}