import { useState, useEffect } from "react"

const useSticky = (threshold = 100) => {
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > threshold)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [threshold])

  return isSticky
}

export default useSticky
