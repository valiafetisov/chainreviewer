import getContractInfo from './getContractInfo'
import getPrisma from './getPrisma'
import type { SupportedChain } from '~/types'

export default async function loadContractLibraries(
  address: string,
  chain: SupportedChain
) {
  await getContractInfo(address, chain)
  const contract = await getPrisma().contract.findFirst({
    where: {
      address,
      chain,
    },
  })

  if (!contract) throw new Error('Contract not found')
  if (contract.library === '') return {}
  const libraries = contract.library.split(';')
  const ret = Object.fromEntries(
    libraries.map((l) => {
      const [key, val] = l.split(':')
      return [key, `0x${val}`]
    })
  )
  await Promise.all(
    Object.values(ret).map(async (v) => {
      return loadContractLibraries(v, chain)
    })
  )
  return ret
}
