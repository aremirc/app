import Link from 'next/link'
import LinkPreviewCard from './LinkPreviewCard'

const isValidDomain = (href) => {
  // Acepta: google.com, www.ejemplo.org, sub.dominio.com
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/i
  return domainRegex.test(href)
}

const ReusableCard = ({ card, children, link, bgColor }) => {
  if (!card) return null

  let rawHref = card.href?.trim() || ''
  let href = rawHref
  let isExternal = false

  if (/^https?:\/\//i.test(rawHref)) {
    try {
      const url = new URL(rawHref)
      isExternal = typeof window !== 'undefined' && url.origin !== window.location.origin
    } catch {
      isExternal = false
    }
  }
  else if (isValidDomain(rawHref)) {
    href = `https://${rawHref}`
    isExternal = true
  }

  const baseClasses = `p-6 rounded-lg cursor-pointer transition text-white ${card.bgColor || bgColor} dark:text-black`

  if (isExternal) {
    // Pasamos el href normalizado (https://...)
    return <LinkPreviewCard card={{ ...card, href }} />
  }

  return (
    <Link href={link || rawHref}>
      <div className={baseClasses}>
        {children ? (children) : (
          <>
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="text-sm">{card.description}</p>
          </>
        )}
      </div>
    </Link>
  )
}

export default ReusableCard
