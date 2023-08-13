import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig } from 'wagmi'
// import { optimism, optimismGoerli } from 'wagmi/chains'
import { optimismGoerli } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'

const walletConnectProjectId = '42c79d6a79e58f85e7631a32d57ef073'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    optimismGoerli,
    // optimism,
    // ...(process.env.NODE_ENV === 'development' ? [optimismGoerli] : []),
  ],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'Chain Reviewer',
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
