import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { FaAngleRight, FaRegTimesCircle } from "react-icons/fa"
import ErrorBanner from "@/components/atoms/ErrorBanner"
import SkeletonNav from "@/components/atoms/SkeletonNav"
import useNavigationItems from "@/hooks/useNavigationItems"
import useSticky from "@/hooks/useSticky"
import Link from "next/link"
import NavBar from "./NavBar"
import Button from "../atoms/Button"
import OrderCard from "../molecules/OrderCard"
import VisitCard from "../molecules/VisitCard"

const Sidebar = () => {
  const { user } = useAuth()
  const isSticky = useSticky()
  const { itemNav, isLoading, error, refetch } = useNavigationItems()

  const [isOpen, setIsOpen] = useState(false)
  const [isModalOrderOpen, setIsModalOrderOpen] = useState(false)
  const [isModalVisitOpen, setIsModalVisitOpen] = useState(false)

  const toggleAside = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Botón flotante para abrir/cerrar sidebar */}
      <div className={`fixed transform transition-all duration-700 z-40 flex text-text-dark dark:text-text-light ${isSticky ? "top-1/2" : "top-24"} ${isOpen ? "translate-x-64" : "-translate-x-4"}`}>
        <button
          onClick={toggleAside}
          type="button"
          title="toggleMenu"
          className={`bg-primary-dark rounded-full p-2 sm:hidden ${!isOpen && "pl-4"}`}
        >
          {isOpen ? <FaRegTimesCircle /> : <FaAngleRight />}
        </button>
      </div>

      <div className="relative">
        {/* Overlay para móviles */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 sm:hidden"
            onClick={toggleAside}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`w-64 h-full fixed sm:h-auto sm:left-0 p-4 transition-all duration-300 ease-in-out z-40 ${isOpen ? "top-0 left-0 bg-border-light dark:bg-background-dark" : "-left-[300px]"} sm:top-22`}>
          {/* Logo */}
          <div className="flex items-center justify-center mb-5 sm:mb-4">
            <Link href="/">
              <img className="w-40 backdrop-blur-0" src="/logo.svg" alt="" />
            </Link>
          </div>

          {/* Navegación */}
          {user?.role?.name && (
            <div className="px-3">
              {/* <h2 className="text-xl font-bold text-text-light dark:text-primary-dark mb-4">Navegación</h2> */}
              {isLoading && <SkeletonNav />}
              {!isLoading && !error && (
                <NavBar
                  itemNav={itemNav.filter(route => route.showInMenu !== false)}
                  onClick={() => setIsOpen(false)}
                />
              )}
              {error && <ErrorBanner message="No se pudo cargar la navegación" retry={refetch} />}
            </div>
          )}

          {/* Sección rápida para Admin */}
          {user?.role?.name === 'ADMIN' && (
            <div className="flex flex-col gap-3 bg-primary dark:bg-primary-dark rounded-lg p-4 mt-5">
              <h3 className="text-base font-semibold text-text-light dark:text-text-dark">CREAR NUEVA ORDEN</h3>
              <p className="text-sm text-text-light dark:text-text-dark">Acceso rápido</p>
              <Button
                onClick={() => {
                  setIsModalOrderOpen(true)
                  toggleAside()
                }}
                className="bg-primary-light dark:bg-background-dark hover:bg-background-light dark:hover:bg-border-dark text-text-light dark:text-text-dark dark:hover:text-text-dark text-center text-sm font-bold py-2 px-4 rounded-lg focus:outline-hidden focus:ring-3 focus:ring-blue-300 transition"
              >
                CREAR
              </Button>
            </div>
          )}

          {/* Sección rápida para Técnico */}
          {user?.role?.name === 'TECHNICIAN' && (
            <div className="flex flex-col gap-3 bg-primary dark:bg-primary-dark rounded-lg p-4 mt-5">
              <h3 className="text-base font-semibold text-text-light dark:text-text-dark">CREAR NUEVA VISITA</h3>
              <p className="text-sm text-text-light dark:text-text-dark">Acceso rápido</p>
              <Button
                onClick={() => {
                  setIsModalVisitOpen(true)
                  toggleAside()
                }}
                className="bg-primary-light dark:bg-background-dark hover:bg-background-light dark:hover:bg-border-dark text-text-light dark:text-text-dark dark:hover:text-text-dark text-center text-sm font-bold py-2 px-4 rounded-lg focus:outline-hidden focus:ring-3 focus:ring-blue-300 transition"
              >
                CREAR
              </Button>
            </div>
          )}
        </aside>
      </div>

      {isModalOrderOpen && (
        <OrderCard
          handleCancel={() => setIsModalOrderOpen(false)}
        />
      )}

      {isModalVisitOpen && (
        <VisitCard
          handleCancel={() => setIsModalVisitOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar
