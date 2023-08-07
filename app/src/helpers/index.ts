export const getChainConfig = (chain: string) => {
  switch (chain) {
    case 'mainnet':
      return {
        endpoint: 'https://api.etherscan.io',
        apiKey: process.env.ETHERSCAN_API_KEY,
      }
    case 'goerli':
      return {
        endpoint: 'https://api-goerli.etherscan.io',
        apiKey: process.env.ETHERSCAN_API_KEY,
      }
    case 'sepolia':
      return {
        endpoint: 'https://api-sepolia.etherscan.io',
        apiKey: process.env.ETHERSCAN_API_KEY,
      }
    case 'optimism':
      return {
        endpoint: 'https://api-optimistic.etherscan.io',
        apiKey: process.env.ETHERSCAN_API_KEY_OPTIMISM,
      }
    default:
      throw new Error('Not supported chainID')
  }
}
