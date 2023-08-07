import { z } from 'zod'
import { NextApiRequest, NextApiResponse } from 'next'
import getContractInfo from '~/helpers/getContractInfo'

const addressSchema = z.object({
  address: z.string(),
  chain: z.string(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address, chain } = addressSchema.parse(req.query)
  const contracts = await getContractInfo(address, chain)
  res.status(200).json({ contracts })
}
