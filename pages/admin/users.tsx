import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  full_name: string | null
  blood_type: string | null
  county: string | null
  role: string
  created_at: string
  centre_id: string | null
  donation_centres: { name: string } | null
}

type Centre = {
  id: string
  name: string
}

const ROLE_STYLES: Record<string, string> = {
  donor: 'bg-red-50 text-red-700',
  partner: 'bg-blue-50 text-blue-700',
  coordinator: 'bg-purple-50 text-purple-700',
  admin: 'bg-gray-100 text-gray-700',
}

export default function Users() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
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

    fetchUsers()
    fetchCentres()
  }

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        blood_type,
        county,
        role,
        created_at,
        centre_id,
        donation_centres ( name )
      `)
      .order('created_at', { ascending: false })

    setUsers((data as any) ?? [])
    setLoading(false)
  }

  const fetchCentres = async () => {
    const { data } = await supabase
      .from('donation_centres')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    setCentres(data ?? [])
  }

  const updateRole = async (userId: string, newRole: string) => {
    setUpdating(userId)
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    setUpdating(null)
    setSuccess('Role updated')
    setTimeout(() => setSuccess(''), 3000)
    fetchUsers()
  }

  const updateCentre = async (userId: string, centreId: string) => {
    setUpdating(userId)
    await supabase
      .from('profiles')
      .update({ centre_id: centreId || null })
      .eq('id', userId)
    setUpdating(null)
    fetchUsers()
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.county?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = filterRole === 'all' || u.role === filterRole
    return matchesSearch && matchesRole
  })

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
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">Admin</p>
        <h1 className="text-2xl font-medium text-gray-900 mt-0.5">Users</h1>
      </div>

      {/* Success */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Search by name or county..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'donor', 'partner', 'coordinator', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                filterRole === role
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              {role === 'all' ? 'All users' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {['donor', 'partner', 'coordinator', 'admin'].map((role) => (
          <div key={role} className="bg-gray-50 rounded-xl p-2 text-center">
            <p className="text-lg font-medium text-gray-900">
              {users.filter(u => u.role === role).length}
            </p>
            <p className="text-xs text-gray-400 capitalize">{role}s</p>
          </div>
        ))}
      </div>

      {/* User list */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400">No users found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
            >
              {/* User row */}
              <div
                className="p-4 flex items-start justify-between gap-3 cursor-pointer"
                onClick={() => setExpanded(expanded === user.id ? null : user.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600">
                      {user.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.full_name ?? 'Unnamed user'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {user.county ?? '—'} County
                      {user.blood_type ? ` · ${user.blood_type}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_STYLES[user.role]}`}>
                    {user.role}
                  </span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className={`transition-transform ${expanded === user.id ? 'rotate-180' : ''}`}
                  >
                    <path d="M3 5l4 4 4-4" stroke="#9ca3af"
                      strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Expanded edit panel */}
              {expanded === user.id && (
                <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-50 pt-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Change role</p>
                    <div className="flex flex-wrap gap-2">
                      {['donor', 'partner', 'coordinator', 'admin'].map((role) => (
                        <button
                          key={role}
                          onClick={() => updateRole(user.id, role)}
                          disabled={user.role === role || updating === user.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 ${
                            user.role === role
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {updating === user.id ? '...' : role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(user.role === 'partner') && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">Assign to centre</p>
                      <select
                        value={user.centre_id ?? ''}
                        onChange={(e) => updateCentre(user.id, e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400"
                      >
                        <option value="">No centre assigned</option>
                        {centres.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      {user.donation_centres && (
                        <p className="text-xs text-gray-400 mt-1">
                          Currently: {user.donation_centres.name}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-300">
                    Joined {new Date(user.created_at).toLocaleDateString('en-KE', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}