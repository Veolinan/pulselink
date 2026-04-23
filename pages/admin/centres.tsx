import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

type Centre = {
  id: string
  name: string
  county: string
  contact_email: string | null
  contact_phone: string | null
  is_active: boolean
  created_at: string
}

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

const EMPTY_FORM = {
  name: '',
  county: '',
  contact_email: '',
  contact_phone: '',
}

export default function Centres() {
  const router = useRouter()
  const [centres, setCentres] = useState<Centre[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
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

    fetchCentres()
  }

  const fetchCentres = async () => {
    const { data } = await supabase
      .from('donation_centres')
      .select('*')
      .order('created_at', { ascending: false })

    setCentres(data ?? [])
    setLoading(false)
  }

  const handleSave = async () => {
    setError('')
    if (!form.name.trim() || !form.county) {
      setError('Name and county are required')
      return
    }

    setSaving(true)
    const { error } = await supabase
      .from('donation_centres')
      .insert({
        name: form.name.trim(),
        county: form.county,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
      })
    setSaving(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Centre added successfully')
    setForm(EMPTY_FORM)
    setShowForm(false)
    fetchCentres()
    setTimeout(() => setSuccess(''), 3000)
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase
      .from('donation_centres')
      .update({ is_active: !current })
      .eq('id', id)
    fetchCentres()
  }

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
          <h1 className="text-2xl font-medium text-gray-900 mt-0.5">
            Donation centres
          </h1>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError('') }}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-xl text-xs font-medium"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="white"
              strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Add centre
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Add centre form */}
      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-800">New donation centre</p>

          <input
            type="text"
            placeholder="Centre name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
          />

          <select
            value={form.county}
            onChange={(e) => setForm({ ...form, county: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
          >
            <option value="">Select county</option>
            {COUNTIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="email"
            placeholder="Contact email (optional)"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
          />

          <input
            type="tel"
            placeholder="Contact phone (optional)"
            value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
          />

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
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save centre'}
            </button>
          </div>
        </div>
      )}

      {/* Centres list */}
      {centres.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-sm font-medium text-gray-600">No centres yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Add your first donation centre to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {centres.map((centre) => (
            <div
              key={centre.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{centre.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{centre.county} County</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                  centre.is_active
                    ? 'bg-green-50 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {centre.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {(centre.contact_email || centre.contact_phone) && (
                <div className="flex flex-col gap-0.5">
                  {centre.contact_email && (
                    <p className="text-xs text-gray-400">{centre.contact_email}</p>
                  )}
                  {centre.contact_phone && (
                    <p className="text-xs text-gray-400">{centre.contact_phone}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => toggleActive(centre.id, centre.is_active)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                >
                  {centre.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}