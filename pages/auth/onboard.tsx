import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega',
  'Nyeri', 'Meru', 'Embu', 'Machakos', 'Kilifi',
  'Kwale', 'Lamu', 'Taita Taveta', 'Tana River', 'Marsabit',
  'Isiolo', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet',
  'Nandi', 'Baringo', 'Laikipia', 'Narok', 'Kajiado',
  'Kericho', 'Bomet', 'Vihiga', 'Bungoma',
  'Busia', 'Siaya', 'Homa Bay', 'Migori',
  'Kisii', 'Nyamira', 'Muranga', 'Kiambu', 'Turkana',
  'West Pokot', 'Kirinyaga', 'Nyandarua', 'Tharaka Nithi', 'Mandera', 'Wajir'
]

export default function Onboard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [fullName, setFullName] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [county, setCounty] = useState('')
  const [emergencyOptIn, setEmergencyOptIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          blood_type: bloodType,
          county: county,
          emergency_opt_in: emergencyOptIn,
        })

      if (error) throw error

      router.push('/donor/homepage')
    } catch (err: any) {
      setError(err.message ?? 'Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-12">

      <div className="flex flex-col items-center gap-2 mt-8 mb-10">
        <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
          </svg>
        </div>
        <h1 className="text-xl font-medium text-gray-900">Set up your profile</h1>
        <p className="text-sm text-gray-400">Step {step} of 3</p>
        <div className="w-full h-1 bg-gray-100 rounded-full mt-2">
          <div
            className="h-1 bg-red-500 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-4 flex-1">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">What's your name?</h2>
            <p className="text-sm text-gray-400 mb-4">This is how you'll appear to blood banks.</p>
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!fullName.trim()}
            className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 mt-auto active:scale-95 transition-transform"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4 flex-1">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">Your blood type</h2>
            <p className="text-sm text-gray-400 mb-4">
              Not sure? Select "Donate & Discover" — we'll update it after your first donation.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setBloodType(type)}
                  className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                    bloodType === type
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-red-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button
              onClick={() => setBloodType('Unknown')}
              className={`w-full mt-2 py-3 rounded-xl text-sm border transition-colors ${
                bloodType === 'Unknown'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              Donate & Discover my blood type
            </button>
          </div>
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm active:scale-95 transition-transform"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!bloodType}
              className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4 flex-1">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">Where are you based?</h2>
            <p className="text-sm text-gray-400 mb-4">Used to match you with nearby blood banks.</p>
            <select
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 transition-colors"
            >
              <option value="">Select your county</option>
              {COUNTIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div
            onClick={() => setEmergencyOptIn(!emergencyOptIn)}
            className={`flex gap-3 items-start p-4 rounded-xl border cursor-pointer transition-colors ${
              emergencyOptIn ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
              emergencyOptIn ? 'bg-red-600 border-red-600' : 'border-gray-300'
            }`}>
              {emergencyOptIn && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Hero alerts</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Opt in to be contacted for emergency donations when your blood type is critically needed nearby. You can always say no.
              </p>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm active:scale-95 transition-transform"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!county || loading}
              className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? 'Saving...' : 'Get started'}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}