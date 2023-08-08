import { z } from 'zod'
import getContractInfo from '~/helpers/getContractInfo'
import { supportedChain } from '~/schemas'
import { NextApiRequest, NextApiResponse } from 'next'

const addressSchema = z.object({
  address: z.string(),
  chain: supportedChain,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address, chain } = addressSchema.parse(req.query)
  const contracts = await getContractInfo(address, chain)
  res.status(200).json({ contracts })
}
