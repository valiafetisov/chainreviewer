import '~/styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { ConfigProvider } from 'antd'

import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import { WagmiConfig } from 'wagmi'
import type { AppProps } from 'next/app'

import Layout from '~/components/Layout'
import { chains, config } from '../wagmi'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#897A5F',
          },
        }}
      >
        <RainbowKitProvider
          theme={lightTheme({
            borderRadius: 'small',
            accentColor: '#897A5F',
            accentColorForeground: '#FFF',
          })}
          chains={chains}
        >
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </RainbowKitProvider>
      </ConfigProvider>
    </WagmiConfig>
  )
}
