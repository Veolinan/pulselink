import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

type Centre = {
  id: string
  name: string
  county: string
}

type Stats = {
  todayCount: number
  todayVolume: number
  weekCount: number
  totalCount: number
  deferrals: number
}

type RecentDonation = {
  id: string
  donated_at: string
  volume_ml: number
  status: string
  profiles: { full_name: string; blood_type: string }
}

export default function PartnerDashboard() {
  const router = useRouter()
  const [centre, setCentre] = useState<Centre | null>(null)
  const [stats, setStats] = useState<Stats>({
    todayCount: 0,
    todayVolume: 0,
    weekCount: 0,
    totalCount: 0,
    deferrals: 0,
  })
  const [recent, setRecent] = useState<RecentDonation[]>([])
  const [loading, setLoading] = useState(true)
  const [partnerName, setPartnerName] = useState('')

  useEffect(() => {
    checkRoleAndFetch()
  }, [])

  const checkRoleAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, centre_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'partner') {
      router.push('/donor/homepage')
      return
    }

    if (!profile.centre_id) {
      router.push('/auth/login')
      return
    }

    setPartnerName(profile.full_name?.split(' ')[0] ?? 'Staff')

    const { data: centreData } = await supabase
      .from('donation_centres')
      .select('id, name, county')
      .eq('id', profile.centre_id)
      .single()

    if (centreData) {
      setCentre(centreData)
      await fetchStats(centreData.id)
    }

    setLoading(false)
  }

  const fetchStats = async (centreId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

    const [
      { data: todayData },
      { data: weekData },
      { data: totalData },
      { data: deferralData },
      { data: recentData },
    ] = await Promise.all([
      supabase
        .from('donations')
        .select('volume_ml')
        .eq('centre_id', centreId)
        .eq('status', 'completed')
        .gte('donated_at', today),

      supabase
        .from('donations')
        .select('id')
        .eq('centre_id', centreId)
        .eq('status', 'completed')
        .gte('donated_at', weekAgo),

      supabase
        .from('donations')
        .select('id')
        .eq('centre_id', centreId)
        .eq('status', 'completed'),

      supabase
        .from('deferrals')
        .select('id')
        .eq('centre_id', centreId),

      supabase
        .from('donations')
        .select(`
          id,
          donated_at,
          volume_ml,
          status,
          profiles ( full_name, blood_type )
        `)
        .eq('centre_id', centreId)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    setStats({
      todayCount: todayData?.length ?? 0,
      todayVolume: todayData?.reduce((s, d) => s + (d.volume_ml || 0), 0) ?? 0,
      weekCount: weekData?.length ?? 0,
      totalCount: totalData?.length ?? 0,
      deferrals: deferralData?.length ?? 0,
    })

    setRecent((recentData as any) ?? [])
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">
          Partner dashboard
        </p>
        <h1 className="text-2xl font-medium text-gray-900 mt-0.5">
          {centre?.name}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {centre?.county} County · Welcome, {partnerName}
        </p>
      </div>

      {/* Today's stats */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
          Today
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-2xl font-medium text-blue-700">
              {stats.todayCount}
            </p>
            <p className="text-xs text-blue-500 mt-1">Donations today</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-2xl font-medium text-blue-700">
              {(stats.todayVolume / 1000).toFixed(2)}L
            </p>
            <p className="text-xs text-blue-500 mt-1">Volume collected</p>
          </div>
        </div>
      </div>

      {/* All time stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-medium text-gray-900">{stats.weekCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">This week</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-medium text-gray-900">{stats.totalCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">All time</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xl font-medium text-gray-900">{stats.deferrals}</p>
          <p className="text-xs text-gray-400 mt-0.5">Deferrals</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push('/partner/donor')}
          className="flex flex-col items-center gap-2 p-4 bg-blue-600 text-white rounded-2xl active:scale-95 transition-transform"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5C12 5 6 10 6 14a6 6 0 0012 0C18 10 12 5 12 5z"
              stroke="white" strokeWidth="1.5" fill="none"/>
            <path d="M12 11v5M9.5 13.5h5"
              stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm font-medium">Log donation</span>
        </button>
        <button
          onClick={() => router.push('/partner/deferral')}
          className="flex flex-col items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-2xl active:scale-95 transition-transform"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9"
              stroke="#BA7517" strokeWidth="1.5" fill="none"/>
            <path d="M12 8v4l2.5 2"
              stroke="#BA7517" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm font-medium text-amber-800">Log deferral</span>
        </button>
      </div>

      {/* Recent donations */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Recent donations
        </p>
        {recent.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400">No donations logged yet today</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-50">
            {recent.map((d) => (
              <div key={d.id}
                className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {d.profiles?.full_name ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(d.donated_at).toLocaleDateString('en-KE', {
                      day: 'numeric', month: 'short'
                    })} · {d.volume_ml} ml
                  </p>
                </div>
                <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  {d.profiles?.blood_type ?? '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}