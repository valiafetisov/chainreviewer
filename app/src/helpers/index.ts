import type { SupportedChain } from '~/types'

export const chainConfig: Readonly<
  Record<SupportedChain, { endpoint: string; apiKey: string | undefined }>
> = {
  mainnet: {
    endpoint: 'https://api.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  goerli: {
    endpoint: 'https://api-goerli.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  sepolia: {
    endpoint: 'https://api-sepolia.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  optimism: {
    endpoint: 'https://api-optimistic.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY_OPTIMISM,
  },
}

export const firstLetterUppercase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

export const shortendAddress = (address: string) =>
  `${address.slice(0, 5)}...${address.slice(-3)}`
