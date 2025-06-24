"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"
import useDarkMode from "@/hooks/useDarkMode"

export default function ThemeToggleIcon() {
  const { isDark, toggleDarkMode } = useDarkMode()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <button
      onClick={toggleDarkMode}
      type="button"
      title="Cambiar tema"
      aria-label="Toggle Theme"
      className="fixed bottom-2 right-2 m-1.5 backdrop-blur-md border border-gray-300 dark:border-gray-600 w-9 h-9 flex items-center justify-center rounded-full bg-white/70 dark:bg-black/30 transition-colors duration-300 shadow-md"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <Moon className="w-5 h-5 text-yellow-300" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <Sun className="w-5 h-5 text-orange-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
