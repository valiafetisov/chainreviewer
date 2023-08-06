import { z } from 'zod'
import { supportedChain } from '~/schemas'

export type supportedChain = z.infer<typeof supportedChain>
