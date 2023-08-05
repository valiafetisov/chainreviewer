import '@rainbow-me/rainbowkit/styles.css'
import type { Metadata } from 'next'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'

export const metadata: Metadata = {
  title: 'sidescan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return null
  }
  return (
    <main>
      <ConnectButton />
      {children}
    </main>
  )
}
