import Link from "next/link"

const LinkBar = ({ href, children, pathname, onClick }) => {
  return <Link
    onClick={onClick}
    href={href}
    className={`flex items-center gap-3 font-semibold ${pathname === href ? 'text-primary dark:text-background-dark bg-background-light dark:bg-primary-dark' : 'text-text-light dark:text-text-dark hover:text-primary dark:hover:text-text-light'} rounded-md p-2 transition-all duration-300 ease-in-out`}
  >
    {children}
  </Link>
}

export default LinkBar
