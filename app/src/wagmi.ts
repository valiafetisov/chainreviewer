import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
import { optimism, optimismGoerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'

const walletConnectProjectId = '42c79d6a79e58f85e7631a32d57ef073'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [optimism, ...(process.env.NODE_ENV === 'development' ? [optimismGoerli] : [])],
  [
    publicProvider(),
  ],
)

const { connectors } = getDefaultWallets({
  // TODO: update with our app name
  appName: 'App Name',
  chains,
  projectId: walletConnectProjectId,
})

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export { chains }
