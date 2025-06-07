import Link from 'next/link'
import LinkPreviewCard from './LinkPreviewCard'

const isValidDomain = (href) => {
  // Acepta: google.com, www.ejemplo.org, sub.dominio.com
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/i
  return domainRegex.test(href)
}

const ReusableCard = ({ card }) => {
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

  const baseClasses = `block h-full rounded-lg overflow-hidden cursor-pointer transition text-white ${card.bgColor} dark:text-black`

  if (isExternal) {
    // Pasamos el href normalizado (https://...)
    return <LinkPreviewCard card={{ ...card, href }} />
  }

  return (
    <Link href={rawHref}>
      <div className={baseClasses}>
        <img src="/next.svg" alt="" className="w-full h-32 object-cover" />
        <div className="p-4">
          <h3 className="text-lg font-semibold">{card.title}</h3>
          <p className="text-sm">{card.description}</p>
        </div>
      </div>
    </Link>
  )
}

export default ReusableCard
