import { useRouter } from 'next/router'

type NavItem = {
  label: string
  route: string
  icon: React.ReactNode
}

type Props = {
  items: NavItem[]
  activeColor: string
  activeBg: string
  role: string
}

export default function DesktopNav({ items, activeColor, activeBg, role }: Props) {
  const router = useRouter()

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-gray-100 bg-white min-h-screen pt-4 pb-8 fixed left-1/2 -translate-x-[calc(50%+280px)] z-30">
      <div className="px-4 mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
          {role} menu
        </p>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {items.map((item) => {
          const active = router.pathname === item.route
          return (
            <button
              key={item.route}
              onClick={() => router.push(item.route)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left w-full ${
                active
                  ? `${activeBg} ${activeColor} font-medium`
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}