import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

type DonorProfile = {
  id: string
  full_name: string
  blood_type: string
  county: string
  eligible_from: string | null
  emergency_opt_in: boolean
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function getEligibilityStatus(eligibleFrom: string | null) {
  if (!eligibleFrom) return { ready: true, daysLeft: 0 }
  const diff = new Date(eligibleFrom).getTime() - Date.now()
  if (diff <= 0) return { ready: true, daysLeft: 0 }
  return { ready: false, daysLeft: Math.ceil(diff / 86400000) }
}

export default function LogDonation() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [donor, setDonor] = useState<DonorProfile | null>(null)
  const [searchError, setSearchError] = useState('')
  const [step, setStep] = useState<'search' | 'confirm' | 'success'>('search')

  const [volume, setVolume] = useState(450)
  const [bloodType, setBloodType] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

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

    // Search by email via auth.users joined to profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, blood_type, county, eligible_from, emergency_opt_in')
      .eq('role', 'donor')
      .ilike('full_name', `%${search.trim()}%`)
      .limit(1)
      .single()

    setSearching(false)

    if (error || !data) {
      setSearchError('No donor found with that name. Ask them to register on PulseLink first.')
      return
    }

    setDonor(data)
    setBloodType(data.blood_type ?? '')
  }

  const handleLogDonation = async () => {
    if (!donor) return
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
      setSaveError('Your account is not assigned to a centre. Contact your admin.')
      setSaving(false)
      return
    }

    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('donations')
      .insert({
        donor_id: donor.id,
        centre_id: profile.centre_id,
        donated_at: today,
        volume_ml: volume,
        status: 'completed',
      })

    if (error) {
      setSaveError(error.message)
      setSaving(false)
      return
    }

    // Update blood type if it was Unknown
    if (donor.blood_type === 'Unknown' && bloodType) {
      await supabase
        .from('profiles')
        .update({ blood_type: bloodType })
        .eq('id', donor.id)
    }

    setSaving(false)
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M8 18l6 6 14-14"
              stroke="#185FA5" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-xl font-medium text-gray-900">Donation logged</p>
          <p className="text-sm text-gray-400 mt-1">
            {donor?.full_name}'s donation has been recorded.
            Their eligibility timer has been reset.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => {
              setStep('search')
              setDonor(null)
              setSearch('')
              setNotes('')
              setVolume(450)
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-medium"
          >
            Log another donation
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
        <h1 className="text-2xl font-medium text-gray-900 mt-0.5">Log donation</h1>
      </div>

      {/* Search */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Search donor by name</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Donor full name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={searching || !search.trim()}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {searching ? '...' : 'Search'}
          </button>
        </div>
        {searchError && (
          <p className="text-xs text-red-500 mt-2">{searchError}</p>
        )}
      </div>

      {/* Donor card */}
      {donor && (
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-700">
                    {donor.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{donor.full_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {donor.county} County
                  </p>
                </div>
              </div>
              <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                {donor.blood_type}
              </span>
            </div>

            {/* Eligibility */}
            {(() => {
              const elig = getEligibilityStatus(donor.eligible_from)
              return elig.ready ? (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <p className="text-xs font-medium text-green-700">
                    Eligible to donate today
                  </p>
                </div>
              ) : (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  <p className="text-xs font-medium text-red-600">
                    Not yet eligible — {elig.daysLeft} days remaining
                  </p>
                  <p className="text-xs text-red-500 mt-0.5">
                    Proceed only if overriding for medical reasons
                  </p>
                </div>
              )
            })()}
          </div>

          {/* Blood type update for Unknown donors */}
          {donor.blood_type === 'Unknown' && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5">
                Donor's blood type is unknown — confirm after testing
              </p>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setBloodType(type)}
                    className={`py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                      bloodType === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Volume */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-xs text-gray-500">Volume collected</p>
              <p className="text-xs font-medium text-gray-700">{volume} ml</p>
            </div>
            <input
              type="range"
              min={200}
              max={550}
              step={10}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-0.5">
              <span>200 ml</span>
              <span>550 ml</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Notes (optional)</p>
            <textarea
              rows={2}
              placeholder="Any observations or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-medium text-blue-800 mb-1">Donation summary</p>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <p className="text-xs text-blue-600">Donor</p>
                <p className="text-xs font-medium text-blue-800">{donor.full_name}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-blue-600">Blood type</p>
                <p className="text-xs font-medium text-blue-800">
                  {donor.blood_type === 'Unknown' ? bloodType || '—' : donor.blood_type}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-blue-600">Volume</p>
                <p className="text-xs font-medium text-blue-800">{volume} ml</p>
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-blue-600">Date</p>
                <p className="text-xs font-medium text-blue-800">
                  {new Date().toLocaleDateString('en-KE', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {saveError && (
            <p className="text-xs text-red-500">{saveError}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setDonor(null); setSearch('') }}
              className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleLogDonation}
              disabled={saving || (donor.blood_type === 'Unknown' && !bloodType)}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Confirm donation'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
