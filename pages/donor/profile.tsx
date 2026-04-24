import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'

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

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']

const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega',
  'Nyeri', 'Meru', 'Embu', 'Machakos', 'Kilifi',
  'Kwale', 'Lamu', 'Taita Taveta', 'Tana River', 'Marsabit',
  'Isiolo', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet',
  'Nandi', 'Baringo', 'Laikipia', 'Narok', 'Kajiado',
  'Kericho', 'Bomet', 'Vihiga', 'Bungoma', 'Busia',
  'Siaya', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira',
  'Muranga', 'Kiambu', 'Turkana', 'West Pokot', 'Kirinyaga',
  'Nyandarua', 'Tharaka Nithi', 'Mandera', 'Wajir',
]

type Section = 'personal' | 'health' | 'emergency' | 'account'

const SECTIONS: { id: Section; label: string; description: string }[] = [
  { id: 'personal', label: 'Personal details', description: 'Your name, ID, and date of birth' },
  { id: 'health', label: 'Health & eligibility', description: 'Blood type and location' },
  { id: 'emergency', label: 'Emergency contact', description: 'Who to call in an emergency' },
  { id: 'account', label: 'Account & alerts', description: 'Hero alerts and account settings' },
]

export default function DonorProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('personal')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Form state
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [county, setCounty] = useState('')
  const [ecName, setEcName] = useState('')
  const [ecPhone, setEcPhone] = useState('')
  const [emergencyOptIn, setEmergencyOptIn] = useState(false)

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setFullName(data.full_name ?? '')
      setDob(data.date_of_birth ?? '')
      setNationalId(data.national_id ?? '')
      setBloodType(data.blood_type ?? '')
      setCounty(data.county ?? '')
      setEcName(data.emergency_contact_name ?? '')
      setEcPhone(data.emergency_contact_phone ?? '')
      setEmergencyOptIn(data.emergency_opt_in ?? false)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        date_of_birth: dob || null,
        national_id: nationalId || null,
        blood_type: bloodType,
        county,
        emergency_contact_name: ecName || null,
        emergency_contact_phone: ecPhone || null,
        emergency_opt_in: emergencyOptIn,
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Profile updated')
    setTimeout(() => setSuccess(''), 3000)
    fetchProfile()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="w-6 h-6 border border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const completionFields = [fullName, dob, nationalId, bloodType, county, ecName, ecPhone]
  const completed = completionFields.filter(Boolean).length
  const completionPct = Math.round((completed / completionFields.length) * 100)

  return (
    <div
      className="min-h-screen bg-paper pb-24"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >

      {/* Profile hero */}
      <div className="bg-paper-2 border-b border-line px-5 py-8">

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
            <span
              className="text-heading-2 font-medium text-paper"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {initials || '?'}
            </span>
          </div>
          <div>
            <h1
              className="text-heading-2 font-light text-ink"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {fullName || 'Your name'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {bloodType && (
                <span className="inline-flex items-center px-2 py-0.5 bg-brand-red text-paper rounded text-label font-medium">
                  {bloodType}
                </span>
              )}
              {county && (
                <span className="text-body-sm text-ink-3">{county} County</span>
              )}
            </div>
            {profile?.passport_id && (
              <p className="label-caps text-ink-3 mt-1">{profile.passport_id}</p>
            )}
          </div>
        </div>

        {/* Completion bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="label-caps text-ink-3">Passport completion</p>
            <p className="label-caps text-ink-2">{completionPct}%</p>
          </div>
          <div className="w-full h-1 bg-line rounded-full">
            <div
              className="h-1 bg-brand-red rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          {completionPct < 100 && (
            <p className="text-body-sm text-ink-3 mt-1.5">
              Complete your profile to unlock your full donor passport
            </p>
          )}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-line overflow-x-auto bg-paper sticky top-0 z-10">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex-shrink-0 px-5 py-3 text-body-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeSection === s.id
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-ink-3 hover:text-ink'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto">

        {/* Success / error */}
        {success && (
          <div className="mb-5 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7l3 3 6-6" stroke="#3B6D11" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-body-sm text-green-800">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-5 px-4 py-3 bg-brand-red-light border border-brand-red/20 rounded-xl">
            <p className="text-body-sm text-brand-red">{error}</p>
          </div>
        )}

        {/* Personal details */}
        {activeSection === 'personal' && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="label-caps text-ink-3 mb-1">Personal details</p>
              <p className="text-body-sm text-ink-2">
                Used on your donor passport and for verification at blood banks.
              </p>
            </div>

            <Input
              label="Full name"
              placeholder="Amina Odhiambo"
              value={fullName}
              onChange={setFullName}
            />

            <div className="flex flex-col gap-1.5">
              <label className="label-caps text-ink-3">Date of birth</label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-0 py-2.5 bg-transparent border-b border-line text-body text-ink focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            <Input
              label="National ID / Passport number"
              placeholder="12345678"
              value={nationalId}
              onChange={setNationalId}
              hint="Used for verification at partner blood banks"
            />

            {/* Passport preview card */}
            {profile?.passport_id && (
              <div className="bg-paper-2 border border-line rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="label-caps text-ink-3">Passport ID</p>
                  <button
                    onClick={() => router.push('/donor/passport')}
                    className="text-body-sm text-brand-red font-medium hover:text-red-800 transition-colors"
                  >
                    View passport →
                  </button>
                </div>
                <p
                  className="text-heading-2 font-light text-ink"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {profile.passport_id}
                </p>
                <p className="text-body-sm text-ink-3 mt-1">
                  Member since{' '}
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-KE', {
                        month: 'long', year: 'numeric',
                      })
                    : '—'
                  }
                </p>
              </div>
            )}

            <Button onClick={handleSave} loading={saving} fullWidth>
              Save changes
            </Button>
          </div>
        )}

        {/* Health */}
        {activeSection === 'health' && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="label-caps text-ink-3 mb-1">Health & eligibility</p>
              <p className="text-body-sm text-ink-2">
                Your blood type determines which patients you can help.
              </p>
            </div>

            <div>
              <p className="label-caps text-ink-3 mb-3">Blood type</p>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_TYPES.filter(t => t !== 'Unknown').map(type => (
                  <button
                    key={type}
                    onClick={() => setBloodType(type)}
                    className={`py-3 rounded-xl border text-body-sm font-medium transition-all ${
                      bloodType === type
                        ? 'bg-brand-red text-paper border-brand-red'
                        : 'bg-paper border-line text-ink hover:border-ink-3'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setBloodType('Unknown')}
                className={`w-full mt-2 py-3 rounded-xl border text-body-sm text-left px-4 transition-all ${
                  bloodType === 'Unknown'
                    ? 'bg-brand-red text-paper border-brand-red'
                    : 'bg-paper border-line text-ink-2 hover:border-ink-3'
                }`}
              >
                Unknown — confirm at next donation
              </button>
            </div>

            <div>
              <p className="label-caps text-ink-3 mb-2">County</p>
              <select
                value={county}
                onChange={e => setCounty(e.target.value)}
                className="w-full px-0 py-2.5 bg-transparent border-b border-line text-body text-ink focus:outline-none focus:border-ink transition-colors"
              >
                <option value="">Select county</option>
                {COUNTIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <Button onClick={handleSave} loading={saving} fullWidth>
              Save changes
            </Button>
          </div>
        )}

        {/* Emergency contact */}
        {activeSection === 'emergency' && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="label-caps text-ink-3 mb-1">Emergency contact</p>
              <p className="text-body-sm text-ink-2">
                Printed on your donor passport. Only contacted in a medical emergency.
              </p>
            </div>

            <Input
              label="Contact full name"
              placeholder="John Odhiambo"
              value={ecName}
              onChange={setEcName}
            />

            <Input
              label="Contact phone number"
              placeholder="+254 7XX XXX XXX"
              value={ecPhone}
              onChange={setEcPhone}
              type="tel"
            />

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-body-sm text-amber-800">
                This contact will appear on your printed donor passport
                and can be accessed by medical staff at partner centres.
              </p>
            </div>

            <Button onClick={handleSave} loading={saving} fullWidth>
              Save changes
            </Button>
          </div>
        )}

        {/* Account */}
        {activeSection === 'account' && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="label-caps text-ink-3 mb-1">Account & alerts</p>
              <p className="text-body-sm text-ink-2">
                Manage your hero alert preferences and account settings.
              </p>
            </div>

            {/* Hero alerts toggle */}
            <div
              onClick={() => setEmergencyOptIn(!emergencyOptIn)}
              className={`flex gap-4 items-start p-4 rounded-xl border cursor-pointer transition-all ${
                emergencyOptIn
                  ? 'bg-brand-red-light border-brand-red/30'
                  : 'bg-paper-2 border-line hover:border-ink-3'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                emergencyOptIn ? 'bg-brand-red border-brand-red' : 'border-line'
              }`}>
                {emergencyOptIn && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div>
                <p className="text-body-sm font-medium text-ink">Hero alerts</p>
                <p className="text-body-sm text-ink-2 mt-0.5">
                  Receive emergency notifications when your blood type is critically
                  needed within your county. You can always decline.
                </p>
              </div>
            </div>

            <Button onClick={handleSave} loading={saving} fullWidth>
              Save preferences
            </Button>

            {/* Danger zone */}
            <div className="mt-4 pt-6 border-t border-line flex flex-col gap-3">
              <p className="label-caps text-ink-3">Account</p>

              <button
                onClick={() => router.push('/donor/passport')}
                className="flex items-center justify-between w-full py-3 border-b border-line text-left"
              >
                <span className="text-body-sm text-ink">View & download donor passport</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="#8E8A83"
                    strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center justify-between w-full py-3 border-b border-line text-left"
              >
                <span className="text-body-sm text-brand-red">Sign out</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2H2v10h3M9 10l3-3-3-3M12 7H5"
                    stroke="#B8241A" strokeWidth="1.2"
                    strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}