'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Splash from '@/components/Splash'

export default function HomePage() {
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return (
      <Splash onDone={() => {
        setShowSplash(false)
        router.replace('/login')
      }} />
    )
  }

  return null
}
