import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    setError('')
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
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

      {!sent ? (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              Reset your password
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Enter your email and we'll send you a reset link.
            </p>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReset()}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
            />
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>
          <button
            onClick={handleReset}
            disabled={loading || !email}
            className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-sm text-gray-400 text-center hover:text-red-500 transition-colors"
          >
            Back to login
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l5 5 11-11" stroke="#3B6D11"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">Check your email</p>
            <p className="text-sm text-gray-400 mt-1">
              We sent a password reset link to
            </p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{email}</p>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Back to login
          </button>
        </div>
      )}

      <p className="text-xs text-gray-300 text-center">
        PulseLink · Saving lives across Kenya
      </p>
    </div>
  )
}