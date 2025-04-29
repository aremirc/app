import Link from 'next/link'

const ReusableCard = ({ href, bgColor, children }) => {
  const isExternal = href.startsWith('http')
  const baseClasses = `p-6 rounded-lg cursor-pointer transition text-white ${bgColor} dark:text-black`

  return isExternal ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={baseClasses}>
      {children}
    </a>
  ) : (
    <Link href={href}>
      <div className={baseClasses}>
        {children}
      </div>
    </Link>
  )
}

export default ReusableCard
