import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

type Stats = {
  totalDonors: number
  totalDonations: number
  totalCentres: number
  totalDrives: number
  recentDonations: RecentDonation[]
}

type RecentDonation = {
  id: string
  donated_at: string
  volume_ml: number
  status: string
  profiles: { full_name: string; blood_type: string }
  donation_centres: { name: string } | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalDonors: 0,
    totalDonations: 0,
    totalCentres: 0,
    totalDrives: 0,
    recentDonations: [],
  })
  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('')

  useEffect(() => {
    checkRoleAndFetch()
  }, [])

  const checkRoleAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      router.push('/donor/homepage')
      return
    }

    setAdminName(profile.full_name?.split(' ')[0] ?? 'Admin')
    await fetchStats()
  }

  const fetchStats = async () => {
    const [
      { count: donorCount },
      { count: donationCount },
      { count: centreCount },
      { count: driveCount },
      { data: recentData },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'donor'),

      supabase
        .from('donations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),

      supabase
        .from('donation_centres')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),

      supabase
        .from('drives')
        .select('*', { count: 'exact', head: true }),

      supabase
        .from('donations')
        .select(`
          id,
          donated_at,
          volume_ml,
          status,
          profiles ( full_name, blood_type ),
          donation_centres ( name )
        `)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    setStats({
      totalDonors: donorCount ?? 0,
      totalDonations: donationCount ?? 0,
      totalCentres: centreCount ?? 0,
      totalDrives: driveCount ?? 0,
      recentDonations: (recentData as any) ?? [],
    })

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const STAT_CARDS = [
    {
      label: 'Total donors',
      value: stats.totalDonors,
      bg: 'bg-red-50',
      text: 'text-red-700',
    },
    {
      label: 'Completed donations',
      value: stats.totalDonations,
      bg: 'bg-green-50',
      text: 'text-green-700',
    },
    {
      label: 'Active centres',
      value: stats.totalCentres,
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    },
    {
      label: 'Total drives',
      value: stats.totalDrives,
      bg: 'bg-purple-50',
      text: 'text-purple-700',
    },
  ]

  return (
    <div className="px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            PulseLink Management
          </p>
          <h1 className="text-2xl font-medium text-gray-900 mt-0.5">
            Welcome, {adminName}
          </h1>
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-900 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3" fill="white"/>
            <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"
              stroke="white" strokeWidth="1.2"
              strokeLinecap="round" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4`}>
            <p className={`text-2xl font-medium ${card.text}`}>
              {card.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Quick actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => router.push('/admin/centres')}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M3 17V8l7-5 7 5v9"
                  stroke="#185FA5" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <rect x="7" y="11" width="6" height="6"
                  stroke="#185FA5" strokeWidth="1.2" fill="none"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-800">Manage centres</p>
              <p className="text-xs text-gray-400">Add or edit partners</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/alerts')}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M10 3C7 3 5 5.5 5 8v4l-1.5 2h13L15 12V8c0-2.5-2-5-5-5z"
                  stroke="#BA7517" strokeWidth="1.5" fill="none"/>
                <path d="M8 15a2 2 0 004 0"
                  stroke="#BA7517" strokeWidth="1" strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-800">Send alert</p>
              <p className="text-xs text-gray-400">Hero alert broadcast</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/users')}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3.5"
                  stroke="#3B6D11" strokeWidth="1.5" fill="none"/>
                <path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6"
                  stroke="#3B6D11" strokeWidth="1.2"
                  strokeLinecap="round" fill="none"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-800">Manage users</p>
              <p className="text-xs text-gray-400">Roles & access</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/admin/centres')}
            className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-left hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="4" width="14" height="13" rx="2"
                  stroke="#534AB7" strokeWidth="1.5" fill="none"/>
                <path d="M3 8h14M7 2v4M13 2v4"
                  stroke="#534AB7" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-800">View drives</p>
              <p className="text-xs text-gray-400">All drive events</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent donations */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Recent donations
        </p>
        {stats.recentDonations.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-400">No donations logged yet</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-50">
            {stats.recentDonations.map((donation) => (
              <div key={donation.id}
                className="py-3 flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {donation.profiles?.full_name ?? 'Unknown donor'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {donation.donation_centres?.name ?? 'Unknown centre'} ·{' '}
                    {new Date(donation.donated_at).toLocaleDateString('en-KE', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {donation.profiles?.blood_type ?? '—'}
                  </span>
                  <p className="text-xs text-gray-400">
                    {donation.volume_ml} ml
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}