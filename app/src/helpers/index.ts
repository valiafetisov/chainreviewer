import type { SupportedChainId } from '~/types'

export const getEtherscanApiUrl = (chainId: SupportedChainId) => {
  switch (chainId) {
    case '1':
      return 'https://api.etherscan.io'
    case '5':
      return 'https://api-goerli.etherscan.io'
    case '11155111':
      return 'https://api-sepolia.etherscan.io'
    case '10':
      return 'https://api-optimistic.etherscan.io'
    default:
      throw new Error('Not supported chainID')
  }
}

export const getEtherscanApiKey = (chainId: SupportedChainId) => {
  switch (chainId) {
    case '1':
    case '5':
    case '11155111':
      if (!process.env.ETHERSCAN_API_KEY) {
        throw new Error('Missing ETHERSCAN_API_KEY')
      }
      return process.env.ETHERSCAN_API_KEY
    case '10':
      if (!process.env.ETHERSCAN_API_KEY_OPTIMISM) {
        throw new Error('Missing ETHERSCAN_API_KEY')
      }
      return process.env.ETHERSCAN_API_KEY_OPTIMISM
    default:
      throw new Error('Not supported chainID')
  }
}
