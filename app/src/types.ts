import { z } from 'zod'
import { supportedChainIds } from '~/schema'

type SupportedChainId = z.infer<typeof supportedChainIds>
