import z from 'zod'

// mainnet, goerli, sepolia, optimism
export const supportedChainIds = z.enum(['1', '5', '11155111', '10'])
