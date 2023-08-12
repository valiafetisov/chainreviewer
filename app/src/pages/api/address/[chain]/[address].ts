import { z } from 'zod'
import getContractInfo from '~/helpers/getContractInfo'
import { NextApiRequest, NextApiResponse } from 'next'
import { SupportedChain } from '~/types'

const addressSchema = z.object({
  address: z.string(),
  chain: z.string(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address, chain } = addressSchema.parse(req.query)
  const contracts = await getContractInfo(address, chain as SupportedChain)
  res.status(200).json({ contracts })
}
