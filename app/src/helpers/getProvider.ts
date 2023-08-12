import { getDefaultProvider } from 'ethers'
import type { SupportedChain } from '~/types'

const CHAIN_IDS: Record<SupportedChain, string> = {
  ethereum: 'homestead',
  'goerli-ethereum': 'goerli',
  'sepolia-ethereum': 'sepolia',
  optimism: 'optimism',
  mode: 'https://sepolia.mode.network/',
  'optimism-goerli': 'optimism-goerli',
}

export default (chain: SupportedChain) => {
  return getDefaultProvider(CHAIN_IDS[chain])
}
