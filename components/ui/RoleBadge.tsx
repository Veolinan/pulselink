type Props = {
  role: string
}

const STYLES: Record<string, string> = {
  admin: 'bg-gray-100 text-gray-700',
  partner: 'bg-blue-50 text-blue-700',
  coordinator: 'bg-purple-50 text-purple-700',
  donor: 'bg-red-50 text-red-700',
}

export default function RoleBadge({ role }: Props) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STYLES[role] ?? STYLES.donor}`}>
      {role}
    </span>
  )
}