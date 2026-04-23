import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

type DonorProfile = {
  id: string
  full_name: string
  blood_type: string
  county: string
}

const DEFERRAL_REASONS = [
  { value: 'low_hemoglobin', label: 'Low haemoglobin', days: 28 },
  { value: 'recent_illness', label: 'Recent illness', days: 14 },
  { value: 'recent_tattoo', label: 'Recent tattoo / piercing', days: 120 },
  { value: 'recent_travel', label: 'Recent travel to risk area', days: 28 },
  { value: 'medication', label: 'Current medication', days: 28 },
  { value: 'low_weight', label: 'Below minimum weight', days: 30 },
  { value: 'recent_donation', label: 'Recent donation elsewhere', days: 90 },
  { value: 'other', label: 'Other reason', days: 28 },
]

export default function LogDeferral() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [donor, setDonor] = useState<DonorProfile | null>(null)
  const [searchError, setSearchError] = useState('')

  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [deferDays, setDeferDays] = useState(28)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [step, setStep] = useState<'search' | 'form' | 'success'>('search')

  const handleSearch = async () => {
    setSearchError('')
    setDonor(null)
    if (!search.trim()) return

    setSearching(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, centre_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'partner' || !profile.centre_id) {
      router.push('/auth/login')
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, blood_type, county')
      .eq('role', 'donor')
      .ilike('full_name', `%${search.trim()}%`)
      .limit(1)
      .single()

    setSearching(false)

    if (error || !data) {
      setSearchError('No donor found with that name.')
      return
    }

    setDonor(data)
    setStep('form')
  }

  const handleLogDeferral = async () => {
    if (!donor || !reason) return
    setSaveError('')
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('centre_id')
      .eq('id', user.id)
      .single()

    if (!profile?.centre_id) {
      setSaveError('Your account is not assigned to a centre.')
      setSaving(false)
      return
    }

    const today = new Date()
    const eligibleFrom = new Date(today.getTime() + deferDays * 86400000)
      .toISOString().split('T')[0]

    const finalReason = reason === 'other'
      ? customReason || 'Other'
      : DEFERRAL_REASONS.find(r => r.value === reason)?.label ?? reason

    const { error: deferError } = await supabase
      .from('deferrals')
      .insert({
        donor_id: donor.id,
        centre_id: profile.centre_id,
        reason: finalReason,
        deferred_at: today.toISOString().split('T')[0],
        eligible_from: eligibleFrom,
        rehab_step: 'nutrition',
        resolved: false,
      })

    if (deferError) {
      setSaveError(deferError.message)
      setSaving(false)
      return
    }

    // Update donor's eligible_from in profiles
    await supabase
      .from('profiles')
      .update({ eligible_from: eligibleFrom })
      .eq('id', donor.id)

    // Also log as a rejected donation
    await supabase
      .from('donations')
      .insert({
        donor_id: donor.id,
        centre_id: profile.centre_id,
        donated_at: today.toISOString().split('T')[0],
        volume_ml: 0,
        status: 'rejected',
      })

    setSaving(false)
    setStep('success')
  }

  const selectedReason = DEFERRAL_REASONS.find(r => r.value === reason)

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="13"
              stroke="#BA7517" strokeWidth="2" fill="none"/>
            <path d="M18 12v6l3 3"
              stroke="#BA7517" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="text-xl font-medium text-gray-900">Deferral recorded</p>
          <p className="text-sm text-gray-400 mt-1">
            {donor?.full_name} has been deferred for {deferDays} days.
            Their recovery plan has been activated in PulseLink.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => {
              setStep('search')
              setDonor(null)
              setSearch('')
              setReason('')
              setCustomReason('')
              setDeferDays(28)
            }}
            className="w-full py-3 bg-amber-500 text-white rounded-xl text-sm font-medium"
          >
            Log another deferral
          </button>
          <button
            onClick={() => router.push('/partner')}
            className="w-full py-3 border border-gray-200 text-gray-500 rounded-xl text-sm"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">Partner</p>
        <h1 className="text-2xl font-medium text-gray-900 mt-0.5">Log deferral</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Record a donor who could not donate today
        </p>
      </div>

      {/* Search */}
      {step === 'search' && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Search donor by name</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Donor full name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !search.trim()}
              className="px-4 py-3 bg-amber-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>
          {searchError && (
            <p className="text-xs text-red-500 mt-2">{searchError}</p>
          )}
        </div>
      )}

      {/* Deferral form */}
      {step === 'form' && donor && (
        <div className="flex flex-col gap-4">

          {/* Donor card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-amber-700">
                {donor.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{donor.full_name}</p>
              <p className="text-xs text-gray-400">{donor.county} County · {donor.blood_type}</p>
            </div>
            <button
              onClick={() => { setStep('search'); setDonor(null); setSearch('') }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Change
            </button>
          </div>

          {/* Reason */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Reason for deferral</p>
            <div className="flex flex-col gap-2">
              {DEFERRAL_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => {
                    setReason(r.value)
                    setDeferDays(r.days)
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
                    reason === r.value
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <span className={`text-sm ${reason === r.value ? 'text-amber-800 font-medium' : 'text-gray-700'}`}>
                    {r.label}
                  </span>
                  <span className={`text-xs flex-shrink-0 ml-2 ${reason === r.value ? 'text-amber-600' : 'text-gray-400'}`}>
                    {r.days}d
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom reason */}
          {reason === 'other' && (
            <input
              type="text"
              placeholder="Describe the reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
            />
          )}

          {/* Deferral period */}
          {reason && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-xs text-gray-500">Deferral period</p>
                <p className="text-xs font-medium text-gray-700">{deferDays} days</p>
              </div>
              <input
                type="range"
                min={7}
                max={365}
                step={7}
                value={deferDays}
                onChange={(e) => setDeferDays(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-300 mt-0.5">
                <span>7 days</span>
                <span>365 days</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Eligible from:{' '}
                <span className="font-medium text-gray-700">
                  {new Date(Date.now() + deferDays * 86400000)
                    .toLocaleDateString('en-KE', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                </span>
              </p>
            </div>
          )}

          {saveError && (
            <p className="text-xs text-red-500">{saveError}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setStep('search'); setDonor(null); setSearch('') }}
              className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleLogDeferral}
              disabled={saving || !reason || (reason === 'other' && !customReason.trim())}
              className="flex-1 py-3 bg-amber-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Record deferral'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}