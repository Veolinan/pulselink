import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type Method = 'options' | 'magic' | 'password'

export default function Login() {
  const router = useRouter()
  const [method, setMethod] = useState<Method>('options')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/verify` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const handleMagicLink = async () => {
    setError('')
    if (!email.includes('@')) { setError('Valid email required'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/verify` },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  const handlePassword = async () => {
    setError('')
    if (!email.includes('@') || password.length < 6) {
      setError('Check your email and password')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/auth/verify')
  }

  if (sent) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center text-center gap-4 py-8">
          <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10l4 4 8-8" stroke="#3B6D11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-heading-2 font-medium text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
              Check your email
            </p>
            <p className="text-body text-ink-2 mt-2">
              We sent a sign-in link to<br />
              <span className="font-medium text-ink">{email}</span>
            </p>
          </div>
          <button
            onClick={() => { setSent(false); setMethod('options') }}
            className="text-body-sm text-ink-3 hover:text-ink transition-colors"
          >
            Use a different method
          </button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <div className="mb-8">
        <p className="label-caps text-ink-3 mb-2">Welcome back</p>
        <h1 className="text-display-3 font-light text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
          Sign in to<br />
          <em className="text-brand-red">Pulselink.</em>
        </h1>
        {method === 'options' && (
          <p className="text-body text-ink-2 mt-2">
            Your story and your streak are waiting.
          </p>
        )}
      </div>

      {method === 'options' && (
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-paper border border-line rounded-xl text-body-sm text-ink hover:bg-paper-2 transition-colors disabled:opacity-40"
          >
            <span className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </span>
            <span className="label-caps text-brand-red">Fastest</span>
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-line" />
            <span className="label-caps text-ink-3">or</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <button
            onClick={() => setMethod('magic')}
            className="w-full px-5 py-3.5 bg-paper border border-line rounded-xl text-body-sm text-ink hover:bg-paper-2 transition-colors text-left"
          >
            Continue with magic link
          </button>

          <button
            onClick={() => setMethod('password')}
            className="w-full px-5 py-3.5 bg-ink text-paper rounded-xl text-body-sm font-medium hover:bg-ink-2 transition-colors"
          >
            Sign in with email & password
          </button>

          {error && <p className="text-xs text-brand-red">{error}</p>}

          <p className="text-body-sm text-ink-3 text-center mt-2">
            No account?{' '}
            <button onClick={() => router.push('/auth/signup')}
              className="text-ink font-medium hover:text-brand-red transition-colors">
              Sign up
            </button>
          </p>
        </div>
      )}

      {method === 'magic' && (
        <div className="flex flex-col gap-5">
          <button onClick={() => { setMethod('options'); setError('') }}
            className="flex items-center gap-1.5 text-body-sm text-ink-3 hover:text-ink transition-colors self-start">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <Input
            label="Phone or email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            type="email"
            error={error}
            onKeyDown={e => e.key === 'Enter' && handleMagicLink()}
            autoFocus
          />
          <Button onClick={handleMagicLink} loading={loading} disabled={!email} fullWidth>
            Send magic link
          </Button>
        </div>
      )}

      {method === 'password' && (
        <div className="flex flex-col gap-5">
          <button onClick={() => { setMethod('options'); setError('') }}
            className="flex items-center gap-1.5 text-body-sm text-ink-3 hover:text-ink transition-colors self-start">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <Input
            label="Phone or email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            type="email"
            autoFocus
          />
          <Input
            label="Password"
            placeholder="••••••••••"
            value={password}
            onChange={setPassword}
            type="password"
            error={error}
            onKeyDown={e => e.key === 'Enter' && handlePassword()}
            rightLabel={{
              text: 'FORGOT?',
              onClick: () => router.push('/auth/forgot-password'),
            }}
          />
          <Button onClick={handlePassword} loading={loading} disabled={!email || !password} fullWidth>
            Sign in →
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-line" />
            <span className="label-caps text-ink-3">or</span>
            <div className="flex-1 h-px bg-line" />
          </div>
          <Button
            variant="secondary"
            onClick={() => router.push('/auth/signup')}
            fullWidth
          >
            Create new account
          </Button>
        </div>
      )}
    </AuthShell>
  )
}

function AuthShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-paper flex flex-col px-6 py-8"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div className="flex items-center justify-between mb-12">
        <Logo />
        <span className="label-caps text-ink-3">Kenya · 2026</span>
      </div>
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {children}
      </div>
      <p className="label-caps text-ink-3 text-center mt-8">
        Unganisha maisha · Connecting life
      </p>
    </div>
  )
}

export { AuthShell }