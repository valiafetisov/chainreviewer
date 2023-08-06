import { z } from 'zod'

export const supportedChain = z.enum([
  'mainnet',
  'goerli',
  'sepolia',
  'optimism',
])
