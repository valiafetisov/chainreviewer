import { z } from 'zod'
import { supportedChain } from '~/schemas'

export type SupportedChain = z.infer<typeof supportedChain>
