import '@rainbow-me/rainbowkit/styles.css'
import type { Metadata } from 'next'
import { useState, useEffect } from 'react'
import useDynamicRouteParams from '~/hooks/useDynamicRouteParams'
import type { SupportedChain } from '~/types'
import Header from '~/components/Header'
import Link from 'next/link'
import HeaderDescription from '~/components/HeaderDescription'
import { useRouter } from 'next/router'

export const metadata: Metadata = {
  title: 'Chain Reviewer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const { pathname, chain, address } = useDynamicRouteParams()
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return null
  }
  return (
    <main className="min-h-screen flex flex-col gap-3">
      <Header
        pageDescription={HeaderDescription({
          pathname,
          chain: chain as SupportedChain,
          address: address as string,
          router,
        })}
      />
      <div className="px-2 flex-1 flex flex-col">{children}</div>
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
