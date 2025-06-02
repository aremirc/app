import { useEffect, useState } from 'react'
import { motion } from 'framer-motion' // Usaremos framer-motion para animaciones
import Icon from '../atoms/Icon'
import Link from 'next/link'

export default function WelcomePage() {
  const [isMounted, setIsMounted] = useState(false)

  const socialLinks = {
    facebook: "https://facebook.com/usuario",
    twitter: "https://twitter.com/usuario",
    linkedin: "https://linkedin.com/in/usuario",
    instagram: "https://instagram.com/usuario"
  }

  useEffect(() => {
    // Este efecto garantiza que las animaciones no se ejecuten en el servidor
    setIsMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-800 text-white px-6 py-12">
      <div className="text-center max-w-2xl mx-auto">
        {/* Animación del encabezado */}
        <motion.h1
          className="text-5xl font-extrabold mb-4 leading-tight"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Redes Sociales */}
          <div className="mb-2 flex justify-center gap-4">
            {socialLinks?.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                <Icon name="facebook" size={32} color="bg-transparent dark:hover:bg-shadow-light" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition" />
              </a>
            )}
            {socialLinks?.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                <Icon name="twitter" size={32} color="bg-transparent dark:hover:bg-shadow-light" className="text-blue-400 dark:text-blue-300 hover:text-blue-500 transition" />
              </a>
            )}
            {socialLinks?.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                <Icon name="linkedin" size={32} color="bg-transparent dark:hover:bg-shadow-light" className="text-blue-700 dark:text-blue-500 hover:text-blue-800 transition" />
              </a>
            )}
            {socialLinks?.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                <Icon name="instagram" size={32} color="bg-transparent dark:hover:bg-shadow-light" className="text-pink-500 dark:text-pink-400 hover:text-pink-600 transition" />
              </a>
            )}
          </div>
          ¡Bienvenido a <span className="text-primary">TECNIPAC</span>!
        </motion.h1>

        {/* Animación del texto de introducción */}
        <motion.p
          className="text-lg mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Estamos emocionados de que te unas a nosotros. Descubre todas las herramientas poderosas que tenemos preparadas para ti.
        </motion.p>

        {/* Animación de imagen/ilustración */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <img
            src="/next.svg"
            alt="Bienvenida"
            className="mx-auto mb-8 max-w-md"
          />
        </motion.div>

        {/* Botón de acción */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <Link href="/dashboard" className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-full text-xl font-semibold hover:bg-primary transition duration-300">
            Empezar ahora
          </Link>
        </motion.div>
      </div>
    </div>
  )
}