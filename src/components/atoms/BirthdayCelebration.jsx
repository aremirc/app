'use client'

import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'

const BirthdayCelebration = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const hasShown = sessionStorage.getItem('birthdayShown')
    if (!hasShown) {
      setIsVisible(true)
      sessionStorage.setItem('birthdayShown', 'true')
      playSound()
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const playSound = () => {
    const audio = new Audio('/celebration.mp3')
    audio.play().catch(() => {
      // Algunos navegadores bloquean la reproducción automática
    })
  }

  if (!isVisible) return null

  return (
    <div
      onClick={() => setIsVisible(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 text-white cursor-pointer"
    >
      <Confetti width={windowSize.width} height={windowSize.height} />
      <div className="text-center px-6">
        <h1 className="text-5xl sm:text-6xl font-bold mb-4 animate-bounce">
          <span className='block sm:inline'>🎂</span> ¡Feliz cumpleaños!
        </h1>
        <p className="text-xl">Te deseamos un día lleno de alegría y confeti 🎉</p>
      </div>
    </div>
  )
}

export default BirthdayCelebration