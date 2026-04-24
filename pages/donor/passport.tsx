import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

type Profile = {
  id: string
  full_name: string
  blood_type: string
  county: string
  date_of_birth: string | null
  national_id: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  passport_id: string | null
  created_at: string | null
  emergency_opt_in: boolean
}

type Donation = {
  id: string
  donated_at: string
  volume_ml: number
  status: string
  donation_centres: { name: string } | null
}

type Badge = {
  earned_at: string
  badge_definitions: { name: string; tier: string }
}

type Stats = {
  count: number
  volume: number
  deferrals: number
}

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  bronze: { bg: '#F5C4B3', text: '#712B13', border: '#D85A30' },
  silver: { bg: '#D3D1C7', text: '#444441', border: '#888780' },
  gold: { bg: '#FAC775', text: '#633806', border: '#BA7517' },
  platinum: { bg: '#CECBF6', text: '#26215C', border: '#534AB7' },
}

function calculateAge(dob: string | null): string {
  if (!dob) return '—'
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / 31557600000).toString()
}

function formatDate(dateStr: string | null, format: 'short' | 'long' = 'short'): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: format === 'long' ? 'long' : 'short',
    year: 'numeric',
  })
}

export default function DonorPassport() {
  const router = useRouter()
  const passportRef = useRef<HTMLDivElement>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState<Stats>({ count: 0, volume: 0, deferrals: 0 })
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [view, setView] = useState<'outside' | 'inside'>('outside')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const [
      { data: p },
      { data: d },
      { data: b },
      { data: def },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('donations')
        .select('id, donated_at, volume_ml, status, donation_centres(name)')
        .eq('donor_id', user.id)
        .order('donated_at', { ascending: false })
        .limit(8),
      supabase.from('donor_badges')
        .select('earned_at, badge_definitions(name, tier)')
        .eq('donor_id', user.id)
        .order('earned_at', { ascending: false }),
      supabase.from('deferrals')
        .select('id')
        .eq('donor_id', user.id),
    ])

    if (p) setProfile(p)
    if (d) {
      setDonations(d as any)
      const completed = d.filter(x => x.status === 'completed')
      setStats({
        count: completed.length,
        volume: completed.reduce((s, x) => s + (x.volume_ml || 0), 0),
        deferrals: def?.length ?? 0,
      })
    }
    if (b) setBadges(b as any)
    setLoading(false)
  }

  const handleDownload = async () => {
    if (!passportRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      // A4 landscape for bi-fold
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const W = 297
      const H = 210

      // Outside view
      setView('outside')
      await new Promise(r => setTimeout(r, 300))
      const outsideCanvas = await html2canvas(passportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FAF7F2',
      })
      pdf.addImage(outsideCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, W, H)

      // Add fold line
      pdf.setDrawColor(180, 180, 180)
      pdf.setLineDashPattern([3, 3], 0)
      pdf.line(W / 2, 0, W / 2, H)
      pdf.setLineDashPattern([], 0)

      // Inside view
      pdf.addPage()
      setView('inside')
      await new Promise(r => setTimeout(r, 300))
      const insideCanvas = await html2canvas(passportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FAF7F2',
      })
      pdf.addImage(insideCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, W, H)

      // Add fold line
      pdf.setDrawColor(180, 180, 180)
      pdf.setLineDashPattern([3, 3], 0)
      pdf.line(W / 2, 0, W / 2, H)
      pdf.setLineDashPattern([], 0)

      pdf.save(`PulseLink-Passport-${profile?.passport_id ?? 'donor'}.pdf`)
      setView('outside')
    } catch (err) {
      console.error('PDF error:', err)
    } finally {
      setDownloading(false)
    }
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
      <div className="min-h-screen bg-paper flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-heading-2 text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
            No profile found
          </p>
          <button onClick={() => router.push('/auth/onboard')}
            className="mt-4 px-6 py-2.5 bg-ink text-paper rounded-xl text-body-sm">
            Complete onboarding
          </button>
        </div>
      </div>
    )
  }

  const initials = profile.full_name
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const age = calculateAge(profile.date_of_birth)
  const memberSince = formatDate(profile.created_at, 'long')
  const livesTouched = stats.count * 3
  const volumeL = (stats.volume / 1000).toFixed(2)
  const completedDonations = donations.filter(d => d.status === 'completed')

  return (
    <div
      className="min-h-screen bg-paper-2 pb-16"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >

      {/* Controls */}
      <div className="sticky top-0 z-10 bg-paper border-b border-line px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('outside')}
            className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all ${
              view === 'outside'
                ? 'bg-ink text-paper'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            Outside
          </button>
          <button
            onClick={() => setView('inside')}
            className={`px-3 py-1.5 rounded-lg text-body-sm font-medium transition-all ${
              view === 'inside'
                ? 'bg-ink text-paper'
                : 'text-ink-3 hover:text-ink'
            }`}
          >
            Inside
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/donor/profile')}
            className="px-4 py-2 border border-line text-ink-2 rounded-xl text-body-sm hover:bg-paper-2 transition-colors"
          >
            Edit profile
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 bg-ink text-paper rounded-xl text-body-sm font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {downloading ? (
              <>
                <span className="w-3.5 h-3.5 border border-paper border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v7M4 6l3 3 3-3M2 10v1a1 1 0 001 1h8a1 1 0 001-1v-1"
                    stroke="currentColor" strokeWidth="1.2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Passport preview */}
      <div className="p-4 md:p-8 flex justify-center">
        <div
          ref={passportRef}
          className="w-full max-w-4xl bg-paper rounded-2xl overflow-hidden"
          style={{ aspectRatio: '297/210', border: '1px solid #E7E1D6' }}
        >

          {/* OUTSIDE VIEW — Front cover (right) + Back cover (left) */}
          {view === 'outside' && (
            <div className="flex h-full">

              {/* Panel 4 — Back cover (printed left, becomes back when folded) */}
<div
  className="flex-1 flex flex-col items-center justify-between p-8 border-r-2 border-dashed"
  style={{ borderColor: '#B4B2A9' }}
>
  {/* QR + scan label */}
  <div className="flex flex-col items-center gap-3 flex-1 justify-center">
    <div className="w-28 h-28 border border-line rounded-xl flex items-center justify-center bg-white p-2">
      <QRCodeSVG
        value={`https://pulselink.co.ke/verify/${profile.passport_id ?? 'unknown'}`}
        size={96}
        fgColor="#1A1612"
        bgColor="#FFFFFF"
        level="M"
      />
    </div>
    <p className="label-caps text-ink-3 text-center">
      Scan to verify
    </p>
    <p
      className="text-body-sm text-ink-2 font-medium"
      style={{ fontFamily: "'Fraunces', serif" }}
    >
      {profile.passport_id ?? '—'}
    </p>
  </div>



                {/* Footer */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-md bg-brand-red flex items-center justify-center">
                      <svg width="9" height="9" viewBox="0 0 32 32" fill="none">
                        <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
                      </svg>
                    </div>
                    <span className="text-body-sm font-medium text-ink">
                      Pulse<em style={{ fontFamily: "'Fraunces', serif" }} className="italic font-light">link</em>
                    </span>
                  </div>
                  <p className="label-caps text-ink-3">Unganisha maisha · Connecting life</p>
                  <p className="label-caps text-ink-3 mt-1">pulselink.co.ke</p>
                  <p className="label-caps text-ink-3 mt-3">
                    Every drop saves a life.
                  </p>
                </div>
              </div>

              {/* Panel 1 — Front cover (printed right, becomes front when folded) */}
              <div className="flex-1 flex flex-col justify-between p-8 bg-ink">

                {/* Top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-red flex items-center justify-center">
                      <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
                        <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
                      </svg>
                    </div>
                    <span className="text-body-sm font-medium text-paper">
                      Pulse<em style={{ fontFamily: "'Fraunces', serif" }} className="italic font-light">link</em>
                    </span>
                  </div>
                  <span className="label-caps text-ink-3">Kenya · {new Date().getFullYear()}</span>
                </div>

                {/* Center */}
                <div>
                  <p className="label-caps text-ink-3 mb-3">Donor passport</p>
                  <h1
                    className="text-4xl font-light text-paper leading-tight mb-2"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {profile.full_name.split(' ')[0]}<br />
                    <em className="text-brand-red italic">
                      {profile.full_name.split(' ').slice(1).join(' ')}.
                    </em>
                  </h1>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="inline-flex items-center px-3 py-1 bg-brand-red text-paper rounded text-heading-2 font-medium"
                      style={{ fontFamily: "'Fraunces', serif" }}>
                      {profile.blood_type}
                    </span>
                    <span className="label-caps text-ink-3">{profile.county} County</span>
                  </div>
                </div>

                {/* Avatar + bottom */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="label-caps text-ink-3 mb-1">Passport ID</p>
                    <p className="text-body-sm font-medium text-paper" style={{ fontFamily: "'Fraunces', serif" }}>
                      {profile.passport_id ?? '—'}
                    </p>
                    <p className="label-caps text-ink-3 mt-2">Member since</p>
                    <p className="text-body-sm text-paper-2">{memberSince}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center">
                    <span className="text-heading-1 font-medium text-paper"
                      style={{ fontFamily: "'Fraunces', serif" }}>
                      {initials}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INSIDE VIEW — Left panel (history) + Right panel (details & badges) */}
          {view === 'inside' && (
            <div className="flex h-full">

              {/* Panel 2 — Donation history */}
              <div
                className="flex-1 flex flex-col p-6 border-r-2 border-dashed overflow-hidden"
                style={{ borderColor: '#B4B2A9' }}
              >
                <div className="mb-4">
                  <p className="label-caps text-ink-3 mb-1">Donation ledger</p>
                  <div className="flex items-baseline gap-4">
                    <div>
                      <p className="text-3xl font-light text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
                        {volumeL}<span className="text-xl text-ink-3">L</span>
                      </p>
                      <p className="label-caps text-ink-3">Total volume</p>
                    </div>
                    <div>
                      <p className="text-3xl font-light text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
                        {stats.count}
                      </p>
                      <p className="label-caps text-ink-3">Donations</p>
                    </div>
                    <div>
                      <p className="text-3xl font-light text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
                        ≈{livesTouched}
                      </p>
                      <p className="label-caps text-ink-3">Lives touched</p>
                    </div>
                  </div>
                </div>

                {/* Donation list */}
                <div className="flex-1 flex flex-col gap-0 overflow-hidden">
                  <div className="grid grid-cols-3 gap-2 pb-1 border-b border-line mb-1">
                    <p className="label-caps text-ink-3">Date</p>
                    <p className="label-caps text-ink-3">Centre</p>
                    <p className="label-caps text-ink-3 text-right">Volume</p>
                  </div>
                  {completedDonations.slice(0, 7).map(d => (
                    <div key={d.id} className="grid grid-cols-3 gap-2 py-1.5 border-b border-line items-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-brand-red flex-shrink-0" />
                        <p className="text-body-sm text-ink-2">
                          {formatDate(d.donated_at)}
                        </p>
                      </div>
                      <p className="text-body-sm text-ink truncate">
                        {(d.donation_centres as any)?.name ?? '—'}
                      </p>
                      <p className="text-body-sm text-ink-2 text-right font-medium"
                        style={{ fontFamily: "'Fraunces', serif" }}>
                        {d.volume_ml} ml
                      </p>
                    </div>
                  ))}
                  {completedDonations.length === 0 && (
                    <p className="text-body-sm text-ink-3 py-4 text-center">
                      No donations recorded yet
                    </p>
                  )}
                  {completedDonations.length > 7 && (
                    <p className="label-caps text-ink-3 pt-2">
                      + {completedDonations.length - 7} more donations
                    </p>
                  )}
                </div>

                {/* First donation */}
                <div className="mt-auto pt-3 border-t border-line">
                  <div className="flex justify-between">
                    <div>
                      <p className="label-caps text-ink-3">First donation</p>
                      <p className="text-body-sm font-medium text-ink">
                        {completedDonations.length > 0
                          ? formatDate(completedDonations[completedDonations.length - 1].donated_at, 'long')
                          : '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="label-caps text-ink-3">Deferrals</p>
                      <p className="text-body-sm font-medium text-ink">{stats.deferrals}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 3 — Donor details + badges */}
              <div className="flex-1 flex flex-col p-6 overflow-hidden">

                {/* Donor details */}
                <div className="mb-4">
                  <p className="label-caps text-ink-3 mb-3">Donor details</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Full name', value: profile.full_name },
                      { label: 'Blood type', value: profile.blood_type },
                      { label: 'Date of birth', value: profile.date_of_birth ? `${formatDate(profile.date_of_birth, 'long')} (age ${age})` : '—' },
                      { label: 'National ID', value: profile.national_id ?? '—' },
                      { label: 'County', value: profile.county ? `${profile.county} County` : '—' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-baseline gap-4 py-1.5 border-b border-line">
                        <p className="label-caps text-ink-3 flex-shrink-0">{row.label}</p>
                        <p className="text-body-sm text-ink text-right truncate">{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency contact */}
                <div className="mb-4 bg-paper-2 border border-line rounded-xl p-3">
                  <p className="label-caps text-ink-3 mb-2">Emergency contact</p>
                  <p className="text-body-sm font-medium text-ink">
                    {profile.emergency_contact_name ?? '—'}
                  </p>
                  <p className="text-body-sm text-ink-2">
                    {profile.emergency_contact_phone ?? '—'}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex-1">
                  <p className="label-caps text-ink-3 mb-2">
                    Badges earned · {badges.length}
                  </p>
                  {badges.length === 0 ? (
                    <p className="text-body-sm text-ink-3">No badges yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {badges.map((b, i) => {
                        const def = Array.isArray(b.badge_definitions)
                          ? b.badge_definitions[0]
                          : b.badge_definitions
                        const colors = TIER_COLORS[def?.tier ?? 'bronze']
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-label font-medium"
                            style={{
                              background: colors.bg,
                              color: colors.text,
                              borderColor: colors.border,
                            }}
                          >
                            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                              <path d="M5 1l1.2 2.4L9 4l-2 1.95.45 2.6L5 7.4l-2.45 1.15.45-2.6L1 4l2.8-.6L5 1z"
                                fill={colors.text}/>
                            </svg>
                            {def?.name}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Passport footer */}
                <div className="mt-auto pt-3 border-t border-line flex items-center justify-between">
                  <div>
                    <p className="label-caps text-ink-3">{profile.passport_id ?? '—'}</p>
                    <p className="label-caps text-ink-3">Issued {new Date().getFullYear()}</p>
                  </div>
                  <div className="text-right">
                    <p className="label-caps text-ink-3">Hero alerts</p>
                    <p className="text-body-sm font-medium text-ink">
                      {profile.emergency_opt_in ? 'Opted in' : 'Opted out'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info note */}
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="bg-paper border border-line rounded-xl p-4 flex items-start gap-3">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
            <circle cx="7" cy="7" r="6" stroke="#8E8A83" strokeWidth="1.2" fill="none"/>
            <path d="M7 6v4M7 4.5v.5" stroke="#8E8A83"
              strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <p className="text-body-sm text-ink-2">
            The PDF downloads as an A4 landscape document with a dotted fold line in the center.
            Print on both sides, fold once to create a four-panel bi-fold passport.
            Complete your{' '}
            <button
              onClick={() => router.push('/donor/profile')}
              className="text-brand-red font-medium hover:underline"
            >
              profile settings
            </button>
            {' '}to fill in any missing fields.
          </p>
        </div>
      </div>

    </div>
  )
}