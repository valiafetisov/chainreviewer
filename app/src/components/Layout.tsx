import '@rainbow-me/rainbowkit/styles.css'
import type { Metadata } from 'next'
import { useState, useEffect } from 'react'
import useDynamicRouteParams from '~/hooks/useDynamicRouteParams'
import { firstLetterUppercase } from '~/helpers'
import { Select } from 'antd'
import { chainConfigs } from '~/helpers'
import type { SupportedChain } from '~/types'

import Header from '~/components/Header'
import Link from 'next/link'
import { useRouter } from 'next/router'

export const metadata: Metadata = {
  title: 'sidescan',
}

type HeaderDescriptionProps = {
  pathname: string
  chain?: SupportedChain
  address?: string
}
const HeaderDescription = ({
  pathname,
  chain,
  address,
}: HeaderDescriptionProps) => {
  const router = useRouter()

  if (pathname.includes('contract') && chain && address) {
    return (
      <>
        <Select
          value={chain}
          onChange={(newChain) =>
            router.push(`/contract/${newChain}/${address}`)
          }
          options={Object.keys(chainConfigs).map((chain) => ({
            label: firstLetterUppercase(chain),
            value: chain,
          }))}
          className="chainSelect mr-1"
        >
          {firstLetterUppercase(chain as string)}{' '}
        </Select>
        / {address}
      </>
    )
  }
  if (pathname.includes('user') && address) {
    return <>{address}</>
  }

  return <>Know your contracts</>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const { pathname, chain, address } = useDynamicRouteParams()

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return null
  }
  return (
    <main className="min-h-screen flex flex-col gap-3">
      <Header
        pageDescription={HeaderDescription({
          pathname,
          chain: chain as string,
          address: address as string,
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
