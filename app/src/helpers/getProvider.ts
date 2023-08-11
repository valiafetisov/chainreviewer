import {getDefaultProvider} from 'ethers'
const CHAIN_IDS: Record<string, string> = {
  mainnet: 'homestead',
  goerli: 'goerli',
  sepolia: 'sepolia',
  optimism: 'optimism',
}
export default (chain: string) => {
  return getDefaultProvider(CHAIN_IDS[chain])
}
