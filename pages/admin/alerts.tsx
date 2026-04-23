import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

type Alert = {
  id: string
  blood_type: string
  county: string
  message: string
  status: string
  sent_at: string | null
  created_at: string
}

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

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-amber-50 text-amber-700',
  resolved: 'bg-green-50 text-green-700',
  expired: 'bg-gray-100 text-gray-500',
}

const EMPTY_FORM = {
  blood_type: '',
  county: '',
  message: '',
  radius_km: 5,
}

export default function Alerts() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [resolving, setResolving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    checkRoleAndFetch()
  }, [])

  const checkRoleAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      router.push('/donor/homepage')
      return
    }

    fetchAlerts()
  }

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })

    setAlerts(data ?? [])
    setLoading(false)
  }

  const handleCreate = async () => {
    setError('')
    if (!form.blood_type || !form.county || !form.message.trim()) {
      setError('Blood type, county and message are required')
      return
    }

    setSaving(true)
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        blood_type: form.blood_type,
        county: form.county,
        message: form.message.trim(),
        radius_km: form.radius_km,
        status: 'active',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Alert created and activated')
    setForm(EMPTY_FORM)
    setShowForm(false)
    fetchAlerts()
    setTimeout(() => setSuccess(''), 4000)
  }

  const resolveAlert = async (id: string) => {
    setResolving(id)
    await supabase
      .from('alerts')
      .update({ status: 'resolved' })
      .eq('id', id)
    setResolving(null)
    fetchAlerts()
  }

  const activeAlerts = alerts.filter(a => a.status === 'active')
  const pastAlerts = alerts.filter(a => a.status !== 'active')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Admin</p>
          <h1 className="text-2xl font-medium text-gray-900 mt-0.5">Hero alerts</h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError('') }}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-medium"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="white"
              strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New alert
        </button>
      </div>

      {/* Active count banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            {activeAlerts.length} active alert{activeAlerts.length > 1 ? 's' : ''} broadcasting now
          </p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Create alert form */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-800">New hero alert</p>
          <p className="text-xs text-gray-400 -mt-1">
            This will notify all opted-in donors matching the blood type in the selected county.
          </p>

          {/* Blood type */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Blood type needed</p>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, blood_type: type })}
                  className={`py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                    form.blood_type === type
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* County */}
          <select
            value={form.county}
            onChange={(e) => setForm({ ...form, county: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
          >
            <option value="">Select county</option>
            {COUNTIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Radius */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-xs text-gray-500">Alert radius</p>
              <p className="text-xs font-medium text-gray-700">
                {form.radius_km} km
              </p>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={form.radius_km}
              onChange={(e) => setForm({ ...form, radius_km: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-300 mt-0.5">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Alert message</p>
            <textarea
              rows={3}
              placeholder="Describe the urgency and location clearly. Keep it calm and specific."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 resize-none"
            />
            <p className="text-xs text-gray-300 mt-1">
              {form.message.length} / 280 characters
            </p>
          </div>

          {/* Preview */}
          {form.blood_type && form.county && form.message && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-600 font-medium mb-1">Preview</p>
              <p className="text-xs font-medium text-amber-800">
                {form.blood_type} needed · {form.county}
              </p>
              <p className="text-xs text-amber-700 mt-0.5 opacity-85">
                {form.message}
              </p>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError('') }}
              className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Sending...' : 'Broadcast alert'}
            </button>
          </div>
        </div>
      )}

      {/* Active alerts */}
      {activeAlerts.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Active · {activeAlerts.length}
          </p>
          <div className="flex flex-col gap-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white border border-amber-200 rounded-2xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-gray-900">
                      {alert.blood_type} · {alert.county}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium flex-shrink-0">
                    Active
                  </span>
                </div>
                <p className="text-xs text-gray-600">{alert.message}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-300">
                    {alert.sent_at
                      ? `Sent ${new Date(alert.sent_at).toLocaleDateString('en-KE', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}`
                      : 'Not yet sent'}
                  </p>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    disabled={resolving === alert.id}
                    className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
                  >
                    {resolving === alert.id ? 'Resolving...' : 'Mark resolved'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past alerts */}
      {pastAlerts.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            Past alerts · {pastAlerts.length}
          </p>
          <div className="flex flex-col gap-2">
            {pastAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start justify-between gap-3"
              >
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-gray-700">
                    {alert.blood_type} · {alert.county}
                  </p>
                  <p className="text-xs text-gray-400">{alert.message}</p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {new Date(alert.created_at).toLocaleDateString('en-KE', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[alert.status]}`}>
                  {alert.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {alerts.length === 0 && !showForm && (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-sm font-medium text-gray-600">No alerts yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Create a hero alert to notify donors in a specific area.
          </p>
        </div>
      )}

    </div>
  )
}