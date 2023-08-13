import type { SupportedChain } from '~/types'
import { format } from 'date-fns'
import { isAddress } from 'viem'

export const chainsWithoutApiKey: SupportedChain[] = ['mode', 'zora']

export const chainConfigs: Readonly<
  Record<
    SupportedChain,
    {
      endpoint: string
      apiKey: string | undefined
      name: string
      chainId: number
    }
  >
> = {
  optimism: {
    chainId: 10,
    name: 'Optimism',
    endpoint: 'https://api-optimistic.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY_OPTIMISM,
  },
  'optimism-goerli': {
    chainId: 420,
    name: 'Optimism(Goerli)',
    endpoint: 'https://api-goerli-optimistic.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY_OPTIMISM,
  },
  base: {
    chainId: 8453,
    name: 'Base',
    endpoint: 'https://api.basescan.org',
    apiKey: process.env.ETHERSCAN_API_KEY_BASE,
  },
  zora: {
    chainId: 7777777,
    name: 'Zora',
    endpoint: 'https://explorer.zora.energy/api/v2/smart-contracts',
    apiKey: undefined,
  },
  mode: {
    chainId: 919,
    name: 'Mode',
    endpoint: 'https://sepolia.explorer.mode.network/api/v2/smart-contracts',
    apiKey: undefined,
  },
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    endpoint: 'https://api.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  'goerli-ethereum': {
    chainId: 5,
    name: 'Ethereum(Goerli)',
    endpoint: 'https://api-goerli.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  'sepolia-ethereum': {
    chainId: 11155111,
    name: 'Ethereum(Sepolia)',
    endpoint: 'https://api-sepolia.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
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
  isAddress(address) ? `${address.slice(0, 4)}...${address.slice(-4)}` : address

export const timeFormatString = 'MM/dd/yyyy h:mm:ss a'

export const formatDate = (date?: Date) =>
  date ? format(date, timeFormatString) : ''

export const getChainNameById = (chainId: number) => {
  const chain = Object.entries(chainConfigs).find(
    ([_, chainConfigs]) => chainConfigs.chainId === chainId
  )
  return chain ? chain[0] : undefined
}
