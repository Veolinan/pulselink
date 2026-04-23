type Props = {
  name: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const SIZES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

export default function Avatar({ name, size = 'md', color = 'bg-gray-900' }: Props) {
  return (
    <div className={`${SIZES[size]} ${color} rounded-full flex items-center justify-center flex-shrink-0`}>
      <span className="font-medium text-white">
        {name?.charAt(0)?.toUpperCase() ?? 'U'}
      </span>
    </div>
  )
}