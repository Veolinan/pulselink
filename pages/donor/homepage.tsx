import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Chip from '@/components/ui/Chip'

type Profile = {
  full_name: string
  blood_type: string
  county: string
  eligible_from: string | null
  created_at?: string
}

type Alert = {
  id: string
  blood_type: string
  county: string
  message: string
}

type BadgeDef = {
  name: string
  tier: string
}

type Badge = {
  earned_at: string
  badge_definitions: BadgeDef | BadgeDef[]
}

type Stats = { count: number; volume: number }

function getEligibility(eligibleFrom: string | null) {
  if (!eligibleFrom) return { ready: true, daysLeft: 0 }
  const diff = new Date(eligibleFrom).getTime() - Date.now()
  if (diff <= 0) return { ready: true, daysLeft: 0 }
  return { ready: false, daysLeft: Math.ceil(diff / 86400000) }
}

function getBadgeDef(badge: Badge): BadgeDef {
  const def = badge.badge_definitions
  if (Array.isArray(def)) return def[0] ?? { name: '—', tier: 'bronze' }
  return def ?? { name: '—', tier: 'bronze' }
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Habari asubuhi'
  if (h < 17) return 'Habari mchana'
  return 'Habari jioni'
}

export default function Homepage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [alert, setAlert] = useState<Alert | null>(null)
  const [badge, setBadge] = useState<Badge | null>(null)
  const [stats, setStats] = useState<Stats>({ count: 0, volume: 0 })
  const [loading, setLoading] = useState(true)
  const [alertResponded, setAlertResponded] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const [{ data: p }, { data: d }, { data: b }, { data: a }] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, blood_type, county, eligible_from, created_at')
        .eq('id', user.id)
        .single(),
      supabase
        .from('donations')
        .select('volume_ml')
        .eq('donor_id', user.id)
        .eq('status', 'completed'),
      supabase
        .from('donor_badges')
        .select('earned_at, badge_definitions(name, tier)')
        .eq('donor_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('alerts')
        .select('id, blood_type, county, message')
        .eq('status', 'active')
        .limit(1)
        .maybeSingle(),
    ])

    if (p) {
      setProfile(p)
      if (a && a.blood_type === p.blood_type) setAlert(a)
    }
    if (d) {
      setStats({
        count: d.length,
        volume: d.reduce((s, x) => s + (x.volume_ml || 0), 0),
      })
    }
    if (b) setBadge(b as Badge)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-6 h-6 border border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-heading-2 font-medium text-ink"
          style={{ fontFamily: "'Fraunces', serif" }}>
          Profile not found
        </p>
        <p className="text-body text-ink-2">Please complete your onboarding.</p>
        <button
          onClick={() => router.push('/auth/onboard')}
          className="px-6 py-2.5 bg-ink text-paper rounded-xl text-body-sm font-medium"
        >
          Set up profile
        </button>
      </div>
    )
  }

  const elig = getEligibility(profile.eligible_from)
  const firstName = profile.full_name.split(' ')[0]
  const volumeL = (stats.volume / 1000).toFixed(2)
  const livesTouched = stats.count * 3
  const badgeDef = badge ? getBadgeDef(badge) : null

  return (
    <div
      className="min-h-screen bg-paper px-5 py-6 flex flex-col gap-6 pb-24"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >

      {/* Header */}
      <div>
        <p className="label-caps text-ink-3">
          {new Date().toLocaleDateString('en-KE', {
            weekday: 'long', day: 'numeric', month: 'long',
          }).toUpperCase()}
        </p>
        <h1
          className="text-heading-1 font-light text-ink mt-1"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {greeting()},{' '}
          <em className="text-brand-red italic">{firstName}.</em>
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="inline-flex items-center px-2 py-0.5 bg-brand-red text-paper rounded text-label font-medium">
            {profile.blood_type}
          </span>
          <span className="text-body-sm text-ink-3">{profile.county} County</span>
        </div>
      </div>

      {/* Eligibility card */}
      <div className="bg-paper-2 border border-line rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="label-caps text-ink-3">Eligibility</p>
          <Chip
            label={elig.ready ? 'READY' : `${elig.daysLeft} DAYS`}
            variant={elig.ready ? 'success' : 'muted'}
            dot
          />
        </div>

        <p
          className="text-display-3 font-light text-ink"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {elig.daysLeft}{' '}
          <span className="text-heading-1 text-ink-3">days</span>
        </p>

        <p className="text-body-sm text-ink-2 mt-1">
          {elig.ready
            ? "You're eligible to donate today. Find a centre near you."
            : `Eligible again on ${new Date(profile.eligible_from!).toLocaleDateString('en-KE', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}`
          }
        </p>

        {elig.ready && (
          <button className="mt-4 w-full py-2.5 bg-brand-red text-paper rounded-xl text-body-sm font-medium active:scale-[0.98] transition-transform">
            Book a donation →
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: stats.count, label: 'Donations' },
          { value: `${volumeL}L`, label: 'Litres' },
          { value: livesTouched, label: 'Lives touched' },
        ].map(s => (
          <div
            key={s.label}
            className="bg-paper-2 border border-line rounded-xl p-3 text-center"
          >
            <p
              className="text-heading-2 font-medium text-ink"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {s.value}
            </p>
            <p className="label-caps text-ink-3 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Hero alert */}
      {alert && !alertResponded && (
        <div className="border border-brand-red/30 bg-brand-red-light rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-red mt-1.5 animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <p className="label-caps text-brand-red mb-1">
                Hero alert · {alert.county}
              </p>
              <p className="text-body-sm font-medium text-ink">
                {alert.blood_type} needed —{' '}
                <em style={{ fontFamily: "'Fraunces', serif" }}>
                  {alert.county} County.
                </em>
              </p>
              <p className="text-body-sm text-ink-2 mt-0.5">{alert.message}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setAlertResponded(true)}
                  className="flex-1 py-2 bg-ink text-paper rounded-lg text-label font-medium"
                >
                  I can help
                </button>
                <button
                  onClick={() => setAlertResponded(true)}
                  className="flex-1 py-2 border border-line text-ink-2 rounded-lg text-label"
                >
                  Not today
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent badge */}
      {badgeDef && (
        <div>
          <p className="label-caps text-ink-3 mb-2">Recent badge</p>
          <div className="bg-paper-2 border border-line rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-paper border border-line flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 3l1.8 3.6L15.5 7l-2.75 2.7.65 3.8L10 11.7l-3.4 1.8.65-3.8L4.5 7l3.7-.4L10 3z"
                  stroke="#8E8A83" strokeWidth="1" fill="none"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-body-sm font-medium text-ink">{badgeDef.name}</p>
              <p className="label-caps text-ink-3 mt-0.5">
                Earned {new Date(badge!.earned_at).toLocaleDateString('en-KE', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
            <span className="label-caps text-ink-3 capitalize">{badgeDef.tier}</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.count === 0 && (
        <div className="border border-dashed border-line rounded-2xl p-6 text-center">
          <p className="text-body-sm font-medium text-ink">Ready for your first donation?</p>
          <p className="text-body-sm text-ink-3 mt-1">
            Walk into any PulseLink partner centre. Your record updates instantly.
          </p>
        </div>
      )}

      {/* Passport CTA */}
      <button
        onClick={() => router.push('/donor/badges')}
        className="flex items-center justify-between w-full p-4 bg-ink text-paper rounded-2xl active:scale-[0.98] transition-transform"
      >
        <div className="text-left">
          <p className="text-body-sm font-medium">View donor passport</p>
          <p className="text-label text-ink-3 mt-0.5">
            {stats.count} donations · {badgeDef?.name ?? 'No badges yet'}
          </p>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

    </div>
  )
}