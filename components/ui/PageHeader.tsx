type Props = {
  eyebrow?: string
  title: string
  titleItalic?: string
  subtitle?: string
}

export default function PageHeader({
  eyebrow,
  title,
  titleItalic,
  subtitle,
}: Props) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="label-caps text-ink-3 mb-3">{eyebrow}</p>
      )}
      <h1 className="text-heading-1 font-medium text-ink" style={{ fontFamily: "'Fraunces', serif", fontWeight: 300 }}>
        {title}
        {titleItalic && (
          <em className="text-brand-red italic"> {titleItalic}</em>
        )}
      </h1>
      {subtitle && (
        <p className="text-body text-ink-2 mt-2">{subtitle}</p>
      )}
    </div>
  )
}