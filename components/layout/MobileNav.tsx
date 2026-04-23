import { useRouter } from 'next/router'

type NavItem = {
  label: string
  route: string
  icon: React.ReactNode
}

type Props = {
  items: NavItem[]
  activeColor: string
}

export default function MobileNav({ items, activeColor }: Props) {
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 flex z-40 md:hidden">
      {items.map((item) => {
        const active = router.pathname === item.route
        return (
          <button
            key={item.route}
            onClick={() => router.push(item.route)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              active ? activeColor : 'text-gray-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px]">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}