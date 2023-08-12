import type { SupportedChain } from '~/types'

export const chainConfigs: Readonly<
  Record<SupportedChain, { endpoint: string; apiKey: string | undefined }>
> = {
  optimism: {
    endpoint: 'https://api-optimistic.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY_OPTIMISM,
  },
  'optimism-goerli': {
    endpoint: 'https://api-goerli-optimistic.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY_OPTIMISM,
  },
  base: {
    endpoint: 'https://api.basescan.org',
    apiKey: process.env.ETHERSCAN_API_KEY_BASE,
  },
  mode: {
    endpoint: 'https://sepolia.explorer.mode.network/api/v2/smart-contracts',
    apiKey: undefined,
  },
  ethereum: {
    endpoint: 'https://api.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  'goerli-ethereum': {
    endpoint: 'https://api-goerli.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  'sepolia-ethereum': {
    endpoint: 'https://api-sepolia.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
}

export const getChainLabel: Record<SupportedChain, string> = {
  mode: 'Mode',
  base: 'Base',
  optimism: 'Optimism',
  'optimism-goerli': 'Optimism(Goerli)',
  ethereum: 'Ethereum',
  'goerli-ethereum': 'Ethereum(Goerli)',
  'sepolia-ethereum': 'Ethereum(Sepolia)',
}

export const getChainConfigs = (chain: SupportedChain) => {
  const config = chainConfigs[chain]
  if (!config) {
    throw new Error('Invalid chain')
  }
  return config
}

export const firstLetterUppercase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

export const shortendAddress = (address: string) =>
  `${address.slice(0, 4)}...${address.slice(-4)}`
