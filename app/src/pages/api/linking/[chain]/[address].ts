import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { AddressInfo } from '~/types'
import { getAddresses } from '~/helpers/getContractAddresses'
import getContractInfo from '~/helpers/getContractInfo'
import { Contract } from '@prisma/client'

const addressSchema = z.object({
  address: z.string(),
  chain: z.string(),
})

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { address, chain } = addressSchema.parse(req.query)
  const contracts: Contract[] | Error = await getContractInfo(address, chain)
  if (contracts instanceof Error) {
    res.status(500).json({ error: contracts.message })
    return
  }
  const ret: Record<string, AddressInfo[]> = {}
  for (const contractInfo of contracts) {
    const addresses = getAddresses(contractInfo)
    addresses.forEach((addressInfo) => {
      delete addressInfo.parent
    })
    ret[contractInfo.contractPath] = addresses
  }

  res.status(200).json({ addresses: ret })
}
