import '@rainbow-me/rainbowkit/styles.css'
import type { Metadata } from 'next'
import { useState, useEffect } from 'react'
import useDynamicRouteParams from '~/hooks/useDynamicRouteParams'

import Header from '~/components/Header'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'sidescan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [headerText, setHeaderText] = useState('')
  const { chain, address } = useDynamicRouteParams()

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!chain && !address) {
      setHeaderText('Know your contracts')
      return
    }
    setHeaderText(`${chain} / ${address}`)
  }, [chain, address])

  if (!mounted) {
    return null
  }
  return (
    <main className="min-h-screen flex flex-col gap-2">
      <Header pageDescription={headerText} />
      <div className="px-2 flex-1">{children}</div>
      <div className="h-5 mb-2 text-center text-sm text-gray-500">
        Built for the{' '}
        <Link
          href="https://ethglobal.com/events/superhack"
          target="_blank"
          className="text-primary underline"
        >
          Superhack 2023
        </Link>
      </div>
    </main>
  )
}
