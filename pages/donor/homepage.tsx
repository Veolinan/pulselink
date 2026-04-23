import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

type Profile = {
  full_name: string
  blood_type: string
  county: string
  eligible_from: string | null
}

type Alert = {
  id: string
  blood_type: string
  county: string
  message: string
}

type Badge = {
  earned_at: string
  badge_definitions: {
    name: string
    tier: string
  }
}

type Stats = {
  count: number
  volume: number
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getEligibilityStatus(eligibleFrom: string | null) {
  if (!eligibleFrom) return { ready: true, daysLeft: 0, timeLeft: '' }
  const diff = new Date(eligibleFrom).getTime() - Date.now()
  if (diff <= 0) return { ready: true, daysLeft: 0, timeLeft: '' }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  return { ready: false, daysLeft: days, timeLeft: `${days}d ${hours}h ${mins}m` }
}

const TIER_COLORS: Record<string, string> = {
  bronze: 'bg-orange-100 text-orange-800',
  silver: 'bg-gray-100 text-gray-700',
  gold: 'bg-amber-100 text-amber-800',
  platinum: 'bg-purple-100 text-purple-800',
}

export default function Homepage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [alert, setAlert] = useState<Alert | null>(null)
  const [badge, setBadge] = useState<Badge | null>(null)
  const [stats, setStats] = useState<Stats>({ count: 0, volume: 0 })
  const [loading, setLoading] = useState(true)
  const [alertResponded, setAlertResponded] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!profile?.eligible_from) return
    const tick = () => {
      const status = getEligibilityStatus(profile.eligible_from)
      setTimeLeft(status.timeLeft)
    }
    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [profile])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const [
      { data: profileData },
      { data: donationData },
      { data: badgeData },
      { data: alertData },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, blood_type, county, eligible_from')
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

    if (profileData) {
      setProfile(profileData)
      if (alertData && alertData.blood_type === profileData.blood_type) {
        setAlert(alertData)
      }
    }

    if (donationData) {
      setStats({
        count: donationData.length,
        volume: donationData.reduce((sum, d) => sum + (d.volume_ml || 0), 0),
      })
    }

   if (badgeData) {
  const b = badgeData as any
  setBadge({
    earned_at: b.earned_at,
    badge_definitions: Array.isArray(b.badge_definitions)
      ? b.badge_definitions[0]
      : b.badge_definitions,
  })
}
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-sm font-medium text-gray-700">Profile not found</p>
          <p className="text-xs text-gray-400 mt-1">Please complete your onboarding.</p>
          <button
            onClick={() => router.push('/auth/onboard')}
            className="mt-4 px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium"
          >
            Set up profile
          </button>
        </div>
      </div>
    )
  }

  const eligibility = getEligibilityStatus(profile.eligible_from)
  const firstName = profile.full_name.split(' ')[0]
  const volumeInLitres = (stats.volume / 1000).toFixed(2)

  return (
    <div className="px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{getGreeting()}</p>
        <h1 className="text-2xl font-medium text-gray-900 mt-0.5">{firstName}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {profile.blood_type}
          </span>
          <span className="text-sm text-gray-400">{profile.county} County</span>
        </div>
      </div>

      {/* Eligibility timer */}
      {eligibility.ready ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
            Eligible to donate
          </p>
          <p className="text-3xl font-medium text-green-700">Ready now</p>
          <p className="text-xs text-green-600 mt-1 opacity-80">
            Book at any blood bank near you
          </p>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">
            Next eligible in
          </p>
          <p className="text-3xl font-medium text-red-700 tabular-nums">
            {timeLeft}
          </p>
          <p className="text-xs text-red-500 mt-1 opacity-80">
            {eligibility.daysLeft} days remaining · stay hydrated
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-2xl font-medium text-gray-900">{stats.count}</p>
          <p className="text-xs text-gray-400 mt-1">Donations</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-2xl font-medium text-gray-900">{volumeInLitres}L</p>
          <p className="text-xs text-gray-400 mt-1">Total volume</p>
        </div>
      </div>

      {/* Hero alert */}
      {alert && !alertResponded && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">
                {alert.blood_type} needed · {alert.county}
              </p>
              <p className="text-xs text-amber-700 mt-1 opacity-85">
                {alert.message}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setAlertResponded(true)}
                  className="flex-1 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium active:scale-95 transition-transform"
                >
                  I can help
                </button>
                <button
                  onClick={() => setAlertResponded(true)}
                  className="flex-1 py-2 border border-amber-300 text-amber-700 rounded-lg text-xs active:scale-95 transition-transform"
                >
                  Not right now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent badge */}
      {badge && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Recent badge</p>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${TIER_COLORS[badge.badge_definitions?.tier ?? 'bronze']}`}>
              {badge.badge_definitions?.tier}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {badge.badge_definitions?.name}
              </p>
              <p className="text-xs text-gray-400">
                Earned {new Date(badge.earned_at).toLocaleDateString('en-KE', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No donations yet */}
      {stats.count === 0 && (
        <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center">
          <p className="text-sm font-medium text-gray-600">Ready to make your first donation?</p>
          <p className="text-xs text-gray-400 mt-1">
            Find a blood bank near you and log your donation here.
          </p>
        </div>
      )}

    </div>
  )
}