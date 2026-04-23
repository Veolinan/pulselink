import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function Verify() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'redirecting' | 'error'>('checking')
  const [error, setError] = useState('')

  useEffect(() => {
    handleSession()
  }, [])

  const redirectByRole = async (userId: string) => {
    setStatus('redirecting')

    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, blood_type, role')
      .eq('id', userId)
      .single()

    // Pre-fill name from Google/OAuth metadata if not set
    if (!profile?.full_name) {
      const googleName =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        null

      if (googleName) {
        await supabase
          .from('profiles')
          .upsert({ id: userId, full_name: googleName })
      }
    }

    // Route by role
    if (!profile?.full_name || !profile?.blood_type) {
      router.push('/auth/onboard')
      return
    }

    switch (profile.role) {
      case 'admin':
        router.push('/admin')
        break
      case 'partner':
        router.push('/partner')
        break
      case 'coordinator':
        router.push('/coordinator')
        break
      default:
        router.push('/donor/homepage')
    }
  }

  const handleSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      setStatus('error')
      setError(error.message)
      return
    }

    if (session) {
      await redirectByRole(session.user.id)
      return
    }

    // Listen for auth state change (magic link / OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe()
          await redirectByRole(session.user.id)
        }
        if (event === 'SIGNED_OUT') {
          router.push('/auth/login')
        }
      }
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-5 text-center">

      <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
        </svg>
      </div>

      {status === 'checking' && (
        <>
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Verifying your session...</p>
        </>
      )}

      {status === 'redirecting' && (
        <>
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Signing you in...</p>
        </>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-gray-800">
            Link expired or invalid
          </p>
          <p className="text-xs text-gray-400">{error}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="mt-2 px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium"
          >
            Back to login
          </button>
        </div>
      )}

    </div>
  )
}