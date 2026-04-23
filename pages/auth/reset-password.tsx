import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase sets the session from the URL hash automatically
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  const handleReset = async () => {
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/auth/verify')
  }

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-12">
      <div className="flex flex-col items-center gap-3 mt-12">
        <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
          </svg>
        </div>
        <h1 className="text-2xl font-medium text-gray-900">PulseLink</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-1">
            Set new password
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Choose a strong password for your account.
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReset()}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        </div>
        <button
          onClick={handleReset}
          disabled={loading || !password || !confirm}
          className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
        >
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </div>

      <p className="text-xs text-gray-300 text-center">
        PulseLink · Saving lives across Kenya
      </p>
    </div>
  )
}