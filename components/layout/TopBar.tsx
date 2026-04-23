import { useState } from 'react'
import { useRouter } from 'next/router'
import Avatar from '@/components/ui/Avatar'
import RoleBadge from '@/components/ui/RoleBadge'
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

const ROLE_COLORS: Record<Role, string> = {
  admin: 'bg-gray-900',
  partner: 'bg-blue-600',
  coordinator: 'bg-purple-600',
  donor: 'bg-red-600',
}

const VIEWING_AS_BG: Record<Role, string> = {
  admin: 'bg-gray-900',
  partner: 'bg-blue-600',
  coordinator: 'bg-purple-600',
  donor: 'bg-red-600',
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
        <div className={`${VIEWING_AS_BG[effectiveRole]} px-4 py-1.5 flex items-center justify-between`}>
          <p className="text-xs text-white font-medium">
            Previewing as {effectiveRole}
          </p>
          <button
            onClick={onReturnToAdmin}
            className="text-xs text-white underline opacity-80 hover:opacity-100"
          >
            Return to admin
          </button>
        </div>
      )}

      {/* Main top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
              <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900 hidden sm:block">
            PulseLink
          </span>
          <RoleBadge role={effectiveRole} />
        </div>

        <div className="relative">
          <button
            onClick={() => { setShowMenu(!showMenu); setShowSwitcher(false) }}
            className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Avatar name={name} size="sm" color={avatarColor} />
            <span className="text-sm text-gray-700 hidden sm:block">{name}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              className={`transition-transform ${showMenu ? 'rotate-180' : ''}`}>
              <path d="M3 5l4 4 4-4" stroke="#9ca3af"
                strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-medium text-gray-900">{name}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">
                  {actualRole} account
                </p>
              </div>

              {actualRole === 'admin' && (
                <div className="border-b border-gray-50">
                  <button
                    onClick={() => setShowSwitcher(!showSwitcher)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700">View as role</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                      className={`transition-transform ${showSwitcher ? 'rotate-180' : ''}`}>
                      <path d="M3 5l4 4 4-4" stroke="#9ca3af"
                        strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {showSwitcher && (
                    <div className="bg-gray-50 border-t border-gray-100">
                      {(['admin', 'partner', 'coordinator', 'donor'] as Role[]).map((role) => (
                        <button
                          key={role}
                          onClick={() => { onRoleSwitch(role); setShowMenu(false) }}
                          className={`w-full flex items-center justify-between px-5 py-2.5 hover:bg-gray-100 transition-colors ${
                            effectiveRole === role ? 'bg-gray-100' : ''
                          }`}
                        >
                          <span className="text-sm text-gray-700 capitalize">{role}</span>
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

              <button
                onClick={() => { setShowMenu(false); router.push('/auth/onboard') }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="5" r="2.5"
                    stroke="#6b7280" strokeWidth="1.2" fill="none"/>
                  <path d="M2 12c0-2.5 2.2-4 5-4s5 1.5 5 4"
                    stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
                </svg>
                <span className="text-sm text-gray-700">Edit profile</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2H2v10h3M9 10l3-3-3-3M12 7H5"
                    stroke="#ef4444" strokeWidth="1.2"
                    strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <span className="text-sm text-red-500">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showMenu && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowSwitcher(false) }} />
      )}
    </>
  )
}