import { usePathname } from "next/navigation"
import Icon from "../atoms/Icon"
import LinkBar from "../atoms/LinkBar"

const NavBar = ({ itemNav, onClick }) => {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {
        itemNav.map((item, index) => (
          <LinkBar key={index} href={item.href} pathname={pathname} onClick={onClick}>
            <Icon name={item.icon} active={pathname === item.href} />
            {item.title}
          </LinkBar>
        ))
      }
    </nav>
  )
}

export default NavBar