import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

type UserType = 'donor' | 'partner' | 'coordinator' | null

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

const FACILITY_TYPES = [
  'Public hospital',
  'Private hospital',
  'Blood bank',
  'Clinic',
  'University health centre',
  'Other',
]

const ORG_TYPES = [
  'University / College',
  'Corporate company',
  'Community group',
  'NGO / Non-profit',
  'Religious organisation',
  'Government institution',
  'Other',
]

export default function Signup() {
  const router = useRouter()
  const [userType, setUserType] = useState<UserType>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  // Common fields
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [county, setCounty] = useState('')

  // Partner fields
  const [facilityName, setFacilityName] = useState('')
  const [facilityType, setFacilityType] = useState('')
  const [facilityPhone, setFacilityPhone] = useState('')
  const [facilityAddress, setFacilityAddress] = useState('')
  const [licenceNumber, setLicenceNumber] = useState('')

  // Coordinator fields
  const [orgName, setOrgName] = useState('')
  const [orgType, setOrgType] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [expectedDonors, setExpectedDonors] = useState('')

  const handleDonorSignup = async () => {
    setError('')
    if (!email.includes('@') || password.length < 6) {
      setError('Please enter a valid email and password (min 6 characters)')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
        data: { full_name: fullName },
      },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  const handlePartnerSignup = async () => {
    setError('')
    if (!email.includes('@') || password.length < 6) {
      setError('Please check your email and password')
      return
    }
    if (!facilityName || !facilityType || !county) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)

    // Sign up the user
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
        data: { full_name: fullName },
      },
    })

    if (signupError || !data.user) {
      setError(signupError?.message ?? 'Signup failed')
      setLoading(false)
      return
    }

    // Insert partner application
    await supabase.from('partner_applications').insert({
      user_id: data.user.id,
      full_name: fullName,
      email,
      county,
      facility_name: facilityName,
      facility_type: facilityType,
      facility_phone: facilityPhone,
      facility_address: facilityAddress,
      licence_number: licenceNumber,
      status: 'pending',
    })

    setLoading(false)
    setSent(true)
  }

  const handleCoordinatorSignup = async () => {
    setError('')
    if (!email.includes('@') || password.length < 6) {
      setError('Please check your email and password')
      return
    }
    if (!orgName || !orgType || !county) {
      setError('Please fill in all required fields')
      return
    }
    setLoading(true)

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
        data: { full_name: fullName },
      },
    })

    if (signupError || !data.user) {
      setError(signupError?.message ?? 'Signup failed')
      setLoading(false)
      return
    }

    await supabase.from('coordinator_applications').insert({
      user_id: data.user.id,
      full_name: fullName,
      email,
      county,
      org_name: orgName,
      org_type: orgType,
      org_phone: orgPhone,
      expected_donors: expectedDonors ? parseInt(expectedDonors) : null,
      status: 'pending',
    })

    setLoading(false)
    setSent(true)
  }

  const Logo = () => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
          <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
        </svg>
      </div>
      <span className="text-base font-medium text-gray-900">PulseLink</span>
    </div>
  )

  // Success screen
  if (sent) {
    return (
      <div className="min-h-screen flex flex-col justify-between px-6 py-12">
        <div className="flex flex-col items-center gap-3 mt-8">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-medium text-gray-900">PulseLink</h1>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l5 5 11-11" stroke="#3B6D11"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            {userType === 'donor' ? (
              <>
                <p className="text-lg font-medium text-gray-900">Check your email</p>
                <p className="text-sm text-gray-400 mt-1">
                  Confirm your email to activate your donor account.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-900">Application submitted</p>
                <p className="text-sm text-gray-400 mt-1">
                  We'll review your application and get back to you within 2 business days.
                  Check your email for confirmation.
                </p>
              </>
            )}
            <p className="text-sm font-medium text-gray-700 mt-2">{email}</p>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-2 px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium"
          >
            Go to login
          </button>
        </div>

        <p className="text-xs text-gray-300 text-center">
          PulseLink · Saving lives across Kenya
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Logo />
        <button
          onClick={() => router.push('/auth/login')}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          Sign in
        </button>
      </div>

      {/* Step 1 — pick user type */}
      {step === 1 && (
        <div className="flex flex-col gap-6 flex-1">
          <div>
            <h2 className="text-xl font-medium text-gray-900">Join PulseLink</h2>
            <p className="text-sm text-gray-400 mt-1">Who are you signing up as?</p>
          </div>

          <div className="flex flex-col gap-3">
            {/* Donor */}
            <button
              onClick={() => { setUserType('donor'); setStep(2) }}
              className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-colors ${
                userType === 'donor'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-gray-200 hover:border-red-200'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 3C10 3 5 7.5 5 11a5 5 0 0010 0C15 7.5 10 3 10 3z"
                    stroke="#A32D2D" strokeWidth="1.2" fill="none"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Blood donor</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Track your donations, get hero alerts, earn badges
                </p>
              </div>
            </button>

            {/* Partner */}
            <button
              onClick={() => { setUserType('partner'); setStep(2) }}
              className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-colors ${
                userType === 'partner'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 17V8l7-5 7 5v9"
                    stroke="#185FA5" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
                  <rect x="7" y="11" width="6" height="6"
                    stroke="#185FA5" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Hospital / Blood bank</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Log donations and deferrals for walk-in donors
                </p>
              </div>
            </button>

            {/* Coordinator */}
            <button
              onClick={() => { setUserType('coordinator'); setStep(2) }}
              className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-colors ${
                userType === 'coordinator'
                  ? 'bg-purple-50 border-purple-200'
                  : 'bg-white border-gray-200 hover:border-purple-200'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="4" width="14" height="13" rx="2"
                    stroke="#534AB7" strokeWidth="1.2" fill="none"/>
                  <path d="M3 8h14M7 2v4M13 2v4"
                    stroke="#534AB7" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Drive coordinator</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Organise blood drives for your company, university or community
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — account credentials (all types) */}
      {step === 2 && (
        <div className="flex flex-col gap-4 flex-1">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 self-start"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7l4 4" stroke="currentColor"
                strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          <div>
            <h2 className="text-xl font-medium text-gray-900">Your account</h2>
            <p className="text-sm text-gray-400 mt-1">Basic information</p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors"
            >
              <option value="">Select your county</option>
              {COUNTIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={() => {
              if (!fullName.trim() || !email.includes('@') || password.length < 6 || !county) {
                setError('Please fill in all fields correctly')
                return
              }
              setError('')
              userType === 'donor' ? handleDonorSignup() : setStep(3)
            }}
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform mt-auto"
          >
            {loading ? 'Creating account...' : userType === 'donor' ? 'Create donor account' : 'Continue'}
          </button>
        </div>
      )}

      {/* Step 3 — Partner details */}
      {step === 3 && userType === 'partner' && (
        <div className="flex flex-col gap-4 flex-1">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 self-start"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7l4 4" stroke="currentColor"
                strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          <div>
            <h2 className="text-xl font-medium text-gray-900">Facility details</h2>
            <p className="text-sm text-gray-400 mt-1">
              Tell us about your hospital or blood bank
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Facility name"
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />

            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors"
            >
              <option value="">Facility type</option>
              {FACILITY_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <input
              type="tel"
              placeholder="Facility phone number"
              value={facilityPhone}
              onChange={(e) => setFacilityPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />

            <input
              type="text"
              placeholder="Facility address"
              value={facilityAddress}
              onChange={(e) => setFacilityAddress(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />

            <input
              type="text"
              placeholder="Medical licence / registration number"
              value={licenceNumber}
              onChange={(e) => setLicenceNumber(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-700">
                Your application will be reviewed by our team within 2 business days.
                You'll receive an email once approved.
              </p>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handlePartnerSignup}
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform mt-auto"
          >
            {loading ? 'Submitting...' : 'Submit application'}
          </button>
        </div>
      )}

      {/* Step 3 — Coordinator details */}
      {step === 3 && userType === 'coordinator' && (
        <div className="flex flex-col gap-4 flex-1">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 self-start"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7l4 4" stroke="currentColor"
                strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>

          <div>
            <h2 className="text-xl font-medium text-gray-900">Organisation details</h2>
            <p className="text-sm text-gray-400 mt-1">
              Tell us about your organisation
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Organisation name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />

            <select
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors"
            >
              <option value="">Organisation type</option>
              {ORG_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <input
              type="tel"
              placeholder="Contact phone number"
              value={orgPhone}
              onChange={(e) => setOrgPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />

            <input
              type="number"
              placeholder="Expected number of donors per drive"
              value={expectedDonors}
              onChange={(e) => setExpectedDonors(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
              <p className="text-xs text-purple-700">
                Your application will be reviewed by our team within 2 business days.
                You'll receive an email once approved.
              </p>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleCoordinatorSignup}
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform mt-auto"
          >
            {loading ? 'Submitting...' : 'Submit application'}
          </button>
        </div>
      )}

    </div>
  )
}