import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import TopBar from './TopBar'
import MobileNav from './MobileNav'
import DesktopNav from './DesktopNav'

type Role = 'donor' | 'partner' | 'coordinator' | 'admin'

type UserContext = {
  name: string
  actualRole: Role
}

const ROLE_CONFIG: Record<Role, {
  label: string
  activeColor: string
  activeBg: string
  avatarColor: string
  home: string
  nav: { label: string; route: string; icon: React.ReactNode }[]
}> = {
  admin: {
    label: 'Admin',
    activeColor: 'text-gray-900',
    activeBg: 'bg-gray-100',
    avatarColor: 'bg-gray-900',
    home: '/admin',
    nav: [
      {
        label: 'Dashboard', route: '/admin',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
      },
      {
        label: 'Centres', route: '/admin/centres',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 17V8l7-5 7 5v9" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/><rect x="7" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1" fill="none"/></svg>,
      },
      {
        label: 'Users', route: '/admin/users',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M3 17c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/></svg>,
      },
      {
        label: 'Alerts', route: '/admin/alerts',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 3C7 3 5 5.5 5 8v4l-1.5 2h13L15 12V8c0-2.5-2-5-5-5z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M8 15a2 2 0 004 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none"/></svg>,
      },
    ],
  },
  partner: {
    label: 'Partner',
    activeColor: 'text-blue-700',
    activeBg: 'bg-blue-50',
    avatarColor: 'bg-blue-600',
    home: '/partner',
    nav: [
      {
        label: 'Dashboard', route: '/partner',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
      },
      {
        label: 'Log donation', route: '/partner/donor',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 3C10 3 5 7.5 5 11a5 5 0 0010 0C15 7.5 10 3 10 3z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M10 9v4M8 11h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
      },
      {
        label: 'Log deferral', route: '/partner/deferral',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M10 7v3l2 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
      },
    ],
  },
  coordinator: {
    label: 'Coordinator',
    activeColor: 'text-purple-700',
    activeBg: 'bg-purple-50',
    avatarColor: 'bg-purple-600',
    home: '/coordinator',
    nav: [
      {
        label: 'My drives', route: '/coordinator',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M3 8h14M7 2v4M13 2v4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
      },
      {
        label: 'Create drive', route: '/coordinator/create',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
      },
    ],
  },
  donor: {
    label: 'Donor',
    activeColor: 'text-red-600',
    activeBg: 'bg-red-50',
    avatarColor: 'bg-red-600',
    home: '/donor/homepage',
    nav: [
      {
        label: 'Home', route: '/donor/homepage',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
      },
      {
        label: 'History', route: '/donor/history',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
      },
      {
        label: 'Badges', route: '/donor/badges',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 3l1.8 3.6L15.5 7l-2.75 2.7.65 3.8L10 11.7l-3.4 1.8.65-3.8L4.5 7l3.7-.4L10 3z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>,
      },
      {
        label: 'Recovery', route: '/donor/recovery',
        icon: <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M10 7v3l2 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
      },
    ],
  },
}

type Props = {
  children: React.ReactNode
}

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/verify',
  '/auth/onboard',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/',
]

export default function AppLayout({ children }: Props) {
  const router = useRouter()
  const [user, setUser] = useState<UserContext | null>(null)
  const [viewingAs, setViewingAs] = useState<Role | null>(null)

  const isAuthRoute = PUBLIC_ROUTES.some(r => router.pathname === r || router.pathname.startsWith('/auth'))

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', authUser.id)
      .single()

    if (profile) {
      setUser({
        name: profile.full_name?.split(' ')[0] ?? 'User',
        actualRole: profile.role as Role,
      })
    }
  }

  if (router.pathname === '/') {
  return <>{children}</>
}

if (isAuthRoute) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto min-h-screen bg-white">
        {children}
      </div>
    </div>
  )
}

  const effectiveRole = viewingAs ?? user?.actualRole ?? 'donor'
  const config = ROLE_CONFIG[effectiveRole]
  const isViewingAs = viewingAs !== null && user?.actualRole === 'admin'

  const handleRoleSwitch = (role: Role) => {
    setViewingAs(role === user?.actualRole ? null : role)
    router.push(ROLE_CONFIG[role].home)
  }

  const handleReturnToAdmin = () => {
    setViewingAs(null)
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm md:max-w-5xl mx-auto min-h-screen bg-white flex flex-col md:flex-row relative">

        {/* Desktop sidebar */}
        <div className="hidden md:flex flex-col w-56 flex-shrink-0 border-r border-gray-100 min-h-screen sticky top-0">
          {/* Logo */}
          <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-50">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path d="M16 4C16 4 6 13 6 19a10 10 0 0020 0C26 13 16 4 16 4z" fill="white"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">PulseLink</p>
              <p className="text-xs text-gray-400 capitalize">{effectiveRole}</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-1 p-3 flex-1">
            {config.nav.map((item) => {
              const active = router.pathname === item.route
              return (
                <button
                  key={item.route}
                  onClick={() => router.push(item.route)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left w-full ${
                    active
                      ? `${config.activeBg} ${config.activeColor} font-medium`
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Bottom user section */}
          <div className="p-3 border-t border-gray-50">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50">
              <div className={`w-7 h-7 rounded-full ${config.avatarColor} flex items-center justify-center flex-shrink-0`}>
                <span className="text-xs font-medium text-white">
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.actualRole}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen">

          {/* Top bar */}
          <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
            <TopBar
              name={user?.name ?? ''}
              actualRole={user?.actualRole ?? 'donor'}
              effectiveRole={effectiveRole}
              onRoleSwitch={handleRoleSwitch}
              onReturnToAdmin={handleReturnToAdmin}
              isViewingAs={isViewingAs}
              avatarColor={config.avatarColor}
            />
          </header>

          {/* Page content */}
          <main className="flex-1 pb-20 md:pb-6">
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav
          items={config.nav}
          activeColor={config.activeColor}
        />

      </div>
    </div>
  )
}