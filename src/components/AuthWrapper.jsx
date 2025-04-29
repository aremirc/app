"use client"

import { Suspense } from 'react'
import LoadingSpinner from './atoms/LoadingSpinner'

const AuthWrapper = ({ children }) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  )
}

export default AuthWrapper
