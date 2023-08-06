import { z } from 'zod'
import { supportedChainIds } from '~/schemas'

export type SupportedChainId = z.infer<typeof supportedChainIds>
