import '~/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import '~/prism/prism.css'

import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiConfig } from 'wagmi'
import type { AppProps } from 'next/app'

import Layout from '~/components/Layout'
import { chains, config } from '../wagmi'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
