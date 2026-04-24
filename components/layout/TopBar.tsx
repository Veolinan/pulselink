import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

type Role = 'donor' | 'partner' | 'coordinator' | 'admin'

type Props = {
  name: string
  actualRole: Role
  effectiveRole: Role
  onRoleSwitch: (role: Role) => void
  onReturnToAdmin: () => void
  isViewingAs: boolean
  avatarColor: string
}

const VIEWING_BG: Record<Role, string> = {
  admin: 'bg-ink',
  partner: 'bg-blue-600',
  coordinator: 'bg-purple-600',
  donor: 'bg-brand-red',
}

export default function TopBar({
  name,
  actualRole,
  effectiveRole,
  onRoleSwitch,
  onReturnToAdmin,
  isViewingAs,
  avatarColor,
}: Props) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [showSwitcher, setShowSwitcher] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      {/* Viewing-as banner */}
      {isViewingAs && (
        <div className={`${VIEWING_BG[effectiveRole]} px-4 py-1.5 flex items-center justify-between`}>
          <p className="label-caps text-paper">
            Previewing as {effectiveRole}
          </p>
          <button
            onClick={onReturnToAdmin}
            className="label-caps text-paper underline opacity-70 hover:opacity-100"
          >
            Return to admin
          </button>
        </div>
      )}

      {/* Main bar */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6">

        {/* Mobile logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-6 h-6 rounded-md bg-brand-red flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
            </svg>
          </div>
          <span className="text-body-sm font-medium text-ink">
            Pulse<em style={{ fontFamily: "'Fraunces', serif" }} className="italic font-light">link</em>
          </span>
        </div>

        {/* Page title on desktop */}
        <div className="hidden md:block">
          <p className="label-caps text-ink-3 capitalize">{effectiveRole} · PulseLink</p>
        </div>

        {/* Right — user menu */}
        <div className="relative">
          <button
            onClick={() => { setShowMenu(!showMenu); setShowSwitcher(false) }}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-paper-2 transition-colors"
          >
            <div className={`w-7 h-7 rounded-full ${avatarColor} flex items-center justify-center`}>
              <span className="label-caps font-medium text-paper">
                {name?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <span className="text-body-sm text-ink hidden sm:block">{name}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform text-ink-3 ${showMenu ? 'rotate-180' : ''}`}>
              <path d="M2 4l4 4 4-4" stroke="currentColor"
                strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-paper border border-line rounded-2xl overflow-hidden z-50 shadow-elevated">

              {/* User info */}
              <div className="px-4 py-3 border-b border-line">
                <p className="text-body-sm font-medium text-ink">{name}</p>
                <p className="label-caps text-ink-3 mt-0.5 capitalize">{actualRole} account</p>
              </div>

              {/* Role switcher — admin only */}
              {actualRole === 'admin' && (
                <div className="border-b border-line">
                  <button
                    onClick={() => setShowSwitcher(!showSwitcher)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-paper-2 transition-colors"
                  >
                    <span className="text-body-sm text-ink">View as role</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                      className={`transition-transform text-ink-3 ${showSwitcher ? 'rotate-180' : ''}`}>
                      <path d="M2 4l4 4 4-4" stroke="currentColor"
                        strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {showSwitcher && (
                    <div className="bg-paper-2 border-t border-line">
                      {(['admin', 'partner', 'coordinator', 'donor'] as Role[]).map(role => (
                        <button
                          key={role}
                          onClick={() => { onRoleSwitch(role); setShowMenu(false) }}
                          className={`w-full flex items-center justify-between px-5 py-2.5 hover:bg-line transition-colors ${
                            effectiveRole === role ? 'bg-line' : ''
                          }`}
                        >
                          <span className="text-body-sm text-ink capitalize">{role}</span>
                          {effectiveRole === role && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6l3 3 5-5" stroke="#3B6D11"
                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile */}
              <button
                onClick={() => { setShowMenu(false); router.push('/donor/profile') }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-paper-2 transition-colors border-b border-line"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="5" r="2.5"
                    stroke="#8E8A83" strokeWidth="1.2" fill="none"/>
                  <path d="M2 12c0-2.5 2.2-4 5-4s5 1.5 5 4"
                    stroke="#8E8A83" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                </svg>
                <span className="text-body-sm text-ink">Edit profile</span>
              </button>

              {/* Passport — donors only */}
              {(actualRole === 'donor' || effectiveRole === 'donor') && (
                <button
                  onClick={() => { setShowMenu(false); router.push('/donor/passport') }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-paper-2 transition-colors border-b border-line"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="1" width="10" height="12" rx="2"
                      stroke="#8E8A83" strokeWidth="1.2" fill="none"/>
                    <path d="M4 5h6M4 7.5h4M4 10h3"
                      stroke="#8E8A83" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  <span className="text-body-sm text-ink">Donor passport</span>
                </button>
              )}

              {/* Sign out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-red-light transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2H2v10h3M9 10l3-3-3-3M12 7H5"
                    stroke="#B8241A" strokeWidth="1.2"
                    strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <span className="text-body-sm text-brand-red">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside */}
      {showMenu && (
        <div className="fixed inset-0 z-40"
          onClick={() => { setShowMenu(false); setShowSwitcher(false) }}/>
      )}
    </>
  )
}