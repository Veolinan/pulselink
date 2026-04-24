import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { AuthShell } from './login'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

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
      if (!user) { router.push('/auth/login'); return }
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: fullName,
        blood_type: bloodType,
        county,
        emergency_opt_in: emergencyOptIn,
      })
      if (error) throw error
      router.push('/donor/homepage')
    } catch (err: any) {
      setError(err.message ?? 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const TOTAL = 3
  const progress = (step / TOTAL) * 100

  return (
    <AuthShell>
      {/* Progress */}
      <div className="flex gap-1.5 mb-10">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
            i < step ? 'bg-brand-red' : 'bg-line'
          }`} />
        ))}
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-8">
          <div>
            <p className="label-caps text-ink-3 mb-2">Step 1 of {TOTAL} · Your details</p>
            <h1 className="text-display-3 font-light text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
              Become a<br />
              <em className="text-brand-red">donor.</em>
            </h1>
            <p className="text-body text-ink-2 mt-2">
              Takes about two minutes. We'll never share your details.
            </p>
          </div>
          <Input
            label="Full name"
            placeholder="Amina Odhiambo"
            value={fullName}
            onChange={setFullName}
            autoFocus
          />
          <Button
            onClick={() => setStep(2)}
            disabled={!fullName.trim()}
            fullWidth
          >
            Continue to eligibility →
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-8">
          <div>
            <p className="label-caps text-ink-3 mb-2">Step 2 of {TOTAL} · Health & eligibility</p>
            <h1 className="text-display-3 font-light text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
              Tell us about<br />
              <em className="text-brand-red">your health.</em>
            </h1>
            <p className="text-body text-ink-2 mt-2">
              We ask what the Kenya Blood Transfusion Service asks. You can change any answer later.
            </p>
          </div>

          <div>
            <p className="label-caps text-ink-3 mb-3">Blood type</p>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_TYPES.map((type) => (
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
              className={`w-full mt-2 py-3 rounded-xl border text-body-sm transition-all text-left px-4 ${
                bloodType === 'Unknown'
                  ? 'bg-brand-red text-paper border-brand-red'
                  : 'bg-paper border-line text-ink-2 hover:border-ink-3'
              }`}
            >
              I don't know — we'll test at your first donation
            </button>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)} fullWidth>
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!bloodType} fullWidth>
              Continue →
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-8">
          <div>
            <p className="label-caps text-ink-3 mb-2">Step 3 of {TOTAL} · Location & alerts</p>
            <h1 className="text-display-3 font-light text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
              Where are<br />
              <em className="text-brand-red">you based?</em>
            </h1>
            <p className="text-body text-ink-2 mt-2">
              Used to match you with nearby blood banks and hero alerts.
            </p>
          </div>

          <div>
            <p className="label-caps text-ink-3 mb-2">County</p>
            <select
              value={county}
              onChange={e => setCounty(e.target.value)}
              className="w-full px-0 py-2.5 bg-transparent border-b border-line text-body text-ink focus:outline-none focus:border-ink transition-colors"
            >
              <option value="">Select your county</option>
              {COUNTIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

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
                  <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div>
              <p className="text-body-sm font-medium text-ink">Hero alerts</p>
              <p className="text-body-sm text-ink-2 mt-0.5">
                Opt in to be contacted when your blood type is critically needed nearby. You can always say no.
              </p>
            </div>
          </div>

          {error && <p className="text-xs text-brand-red">{error}</p>}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(2)} fullWidth>
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={!county}
              fullWidth
            >
              Get started →
            </Button>
          </div>
        </div>
      )}
    </AuthShell>
  )
}