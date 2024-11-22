import Button from "../atoms/Button"
import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import NavBar from "./NavBar"
import { FaAngleRight, FaRegTimesCircle } from "react-icons/fa"
import Link from "next/link"

const Roles = {
  Admin: [
    {
      title: "Inicio",
      href: "/dashboard",
      icon: "home"
    },
    {
      title: "Usuarios",
      href: "/users",
      icon: "user"
    },
    {
      title: "Clientes",
      href: "/clients",
      icon: "client"
    },
    {
      title: "Órdenes",
      href: "/orders",
      icon: "order"
    },
    {
      title: "Visitas",
      href: "/visits",
      icon: "visit"
    },
    {
      title: "Servicios",
      href: "/services",
      icon: "service"
    },
  ],

  Moderador: [
    {
      title: "Inicio",
      href: "/dashboard",
      icon: "home"
    },
    {
      title: "Clientes",
      href: "/clients",
      icon: "client"
    },
    {
      title: "Órdenes",
      href: "/orders",
      icon: "order"
    },
    {
      title: "Visitas",
      href: "/visits",
      icon: "visit"
    },
  ],

  Worker: [
    {
      title: "Inicio",
      href: "/dashboard",
      icon: "home"
    },
    {
      title: "Órdenes",
      href: "/orders",
      icon: "order"
    },
    {
      title: "Visitas",
      href: "/visits",
      icon: "visit"
    },
  ]
}

const Sidebar = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  const itemNav = Roles[user.role]

  // Función que detecta el scroll y cambia el estado
  const handleScroll = () => {
    if (window.scrollY > 100) { // Cambiar 100 por el valor en pixeles que desees
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  useEffect(() => {
    // Escuchar el evento scroll al cargar el componente
    window.addEventListener("scroll", handleScroll);

    // Limpiar el event listener al desmontar el componente
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleAside = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <div className={`flex text-text-dark dark:text-text-light fixed transform transition-all duration-700 ${isSticky ? "top-1/2" : "top-24"} ${isOpen ? "translate-x-64" : "-translate-x-4"} z-30`}>
        <button onClick={toggleAside} type="button" title="toggleMenu" className={`bg-primary-dark rounded-full p-2 ${isOpen ? "" : "pl-4"}  sm:hidden`}>{isOpen ? <FaRegTimesCircle /> : <FaAngleRight />}</button>
      </div>

      <div className="relative">
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 sm:hidden"
            onClick={toggleAside}
          ></div>
        )}

        <aside className={`w-64 h-full sm:h-auto fixed sm:left-0 ${isOpen ? "top-0 left-0 bg-border-light dark:bg-background-dark" : "-left-[300px]"} sm:top-[5.5rem] p-4 transition-all duration-300 ease-in-out z-30`}>
          <div className="flex items-center justify-center pb-2">
            <Link href="/">
              <img className="w-28 backdrop-blur-0" src="/logo.svg" alt="" />
            </Link>
          </div>

          <h2 className="text-xl font-bold text-text-light dark:text-primary-dark mb-4">Navegación</h2>
          <NavBar itemNav={itemNav} />

          {user.role === 'Admin' && (
            <div className="flex flex-col gap-3 bg-primary dark:bg-primary-dark rounded-lg p-4 mt-5">
              <h3 className="text-base font-semibold dark:text-darkSecondary">CREAR NUEVA ORDEN</h3>
              <p className="text-sm dark:text-darkSecondary">Acceso rápido</p>
              <Link href="/orders" className="bg-primary-light dark:bg-background-dark hover:bg-background-light dark:hover:bg-border-dark text-text-light dark:text-text-dark hover:dark:text-text-dark text-center text-sm font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 transition">
                CREAR
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}

export default Sidebar