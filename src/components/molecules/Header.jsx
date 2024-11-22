import { useAuth } from "@/context/AuthContext"
import Title from "../atoms/Title"
import Navbar from "../organisms/NavBar"
import UserList from "../organisms/UserList"
import useDarkMode from "@/hooks/useDarkMode"

const Header = () => {
  const { user } = useAuth()
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <header className="sticky top-0 bg-gradient-to-r from-background-light dark:from-primary-dark via-primary to-background-dark dark:to-background-dark p-6 shadow-md z-10">
      <div className="container lg:max-w-full mx-auto flex justify-between items-center">
        <Title text="Dashboard" />
        {/* <Navbar /> */}
        {
          user && <UserList />
        }
      </div>
      <button onClick={toggleDarkMode} type="button" title="toggleTheme" className="fixed bottom-0 right-0 m-2 backdrop-brightness-90 w-7 h-7 dark:bg-background-dark rounded-full">
        {isDark ? '🌙' : '🌞'}
      </button>
    </header>
  )
}

export default Header