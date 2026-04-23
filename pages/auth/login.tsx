import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

type LoginMethod = 'options' | 'magic' | 'password'

export default function Login() {
  const router = useRouter()
  const [method, setMethod] = useState<LoginMethod>('options')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/verify`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    setError('')
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  const handlePasswordLogin = async () => {
    setError('')
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/auth/verify')
  }

  const handleSignUp = async () => {
    setError('')
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  const Logo = () => (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
        </svg>
      </div>
      <h1 className="text-2xl font-medium text-gray-900">PulseLink</h1>
      <p className="text-sm text-gray-500 text-center">
        Kenya's blood donor community
      </p>
    </div>
  )

  const Divider = () => (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-xs text-gray-300">or</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )

  // Magic link sent confirmation
  if (sent && method === 'magic') {
    return (
      <div className="min-h-screen flex flex-col justify-between px-6 py-12">
        <Logo />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l5 5 11-11" stroke="#3B6D11"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">Check your email</p>
            <p className="text-sm text-gray-400 mt-1">We sent a sign-in link to</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{email}</p>
          </div>
          <button
            onClick={() => { setSent(false); setMethod('options') }}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Use a different method
          </button>
        </div>
        <p className="text-xs text-gray-300 text-center">
          PulseLink · Saving lives across Kenya
        </p>
      </div>
    )
  }

  // Sign up confirmation
  if (sent && method === 'password') {
    return (
      <div className="min-h-screen flex flex-col justify-between px-6 py-12">
        <Logo />
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M6 14l5 5 11-11" stroke="#3B6D11"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">Confirm your email</p>
            <p className="text-sm text-gray-400 mt-1">
              We sent a confirmation link to
            </p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{email}</p>
            <p className="text-sm text-gray-400 mt-2">
              Click the link then come back to sign in.
            </p>
          </div>
          <button
            onClick={() => { setSent(false); setMethod('options') }}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Back to login
          </button>
        </div>
        <p className="text-xs text-gray-300 text-center">
          PulseLink · Saving lives across Kenya
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-12">

      <div className="mt-8">
        <Logo />
      </div>

      <div className="flex flex-col gap-4">

        {/* Options screen */}
        {method === 'options' && (
          <>
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-95 transition-transform disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <Divider />

            {/* Magic link */}
            <button
              onClick={() => setMethod('magic')}
              className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-transform"
            >
              Sign in with magic link
            </button>

            {/* Email + password */}
            <button
              onClick={() => setMethod('password')}
              className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
            >
              Sign in with email & password
            </button>

            <div className="flex items-center justify-between">
                {error
                 ? <p className="text-xs text-red-500">{error}</p>
                    : <span />
                }
                        <button
                onClick={() => router.push('/auth/forgot-password')}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
                Forgot password?
            </button>
            </div>

           
          </>
        )}

        {/* Magic link screen */}
        {method === 'magic' && (
          <>
            <div>
              <button
                onClick={() => { setMethod('options'); setError('') }}
                className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 hover:text-gray-600"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 3L5 7l4 4" stroke="currentColor"
                    strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <h2 className="text-lg font-medium text-gray-900 mb-1">
                Magic link
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                We'll email you a sign-in link. No password needed.
              </p>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMagicLink()}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
              />
              {error && (
                <p className="text-xs text-red-500 mt-2">{error}</p>
              )}
            </div>
            <button
              onClick={handleMagicLink}
              disabled={loading || !email}
              className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </>
        )}

        {/* Email + password screen */}
        {method === 'password' && (
          <>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setMethod('options'); setError('') }}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 self-start"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 3L5 7l4 4" stroke="currentColor"
                    strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <h2 className="text-lg font-medium text-gray-900">
                Email & password
              </h2>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
              />
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </div>
            <button
              onClick={handlePasswordLogin}
              disabled={loading || !email || !password}
              className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
            <Divider />
            <button
              onClick={handleSignUp}
              disabled={loading || !email || !password}
              className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? 'Creating account...' : 'Create new account'}
            </button>
          </>
        )}

      </div>

      <p className="text-xs text-gray-300 text-center">
        PulseLink · Saving lives across Kenya
      </p>

    </div>
  )
}