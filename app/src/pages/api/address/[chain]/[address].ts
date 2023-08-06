import { z } from 'zod'
import axios from 'axios'
import { chainConfig } from '~/helpers'
import { NextApiRequest, NextApiResponse } from 'next'
import getPrisma from '~/helpers/getPrisma'
import { supportedChain } from '~/schemas'

const addressSchema = z.object({
  address: z.string(),
  chain: supportedChain,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address, chain } = addressSchema.parse(req.query)
  const prisma = getPrisma()

  const addressExists = await prisma.contract.findMany({
    where: {
      address: address as string,
      chain: chain,
    },
  })

  if (addressExists.length) {
    return res.status(200).json({ contracts: addressExists })
  }

  const { endpoint, apiKey } = chainConfig[chain]
  if (!apiKey) {
    return new Error('No API key')
  }

  const { data } = await axios.get(
    `${endpoint}/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
  )
  const source = data.result[0].SourceCode
  const slicedSource = source.substring(1, source.length - 1)

  const contractBase = {
    address: address,
    chain: chain,
    contractName: data.result[0].ContractName,
    abi: data.result[0].ABI,
    compilerVersion: data.result[0].CompilerVersion,
    optimizationUsed: Number(data.result[0].OptimizationUsed),
    runs: data.result[0].Runs,
    constructorArguments: data.result[0].ConstructorArguments,
    evmVersion: data.result[0].EVMVersion,
    library: data.result[0].Library,
    licenseType: data.result[0].LicenseType,
    proxy: data.result[0].Proxy,
    implementation: data.result[0].Implementation,
    swarmSource: data.result[0].SwarmSource,
  }
  const contracts = []

  try {
    // When there are more than one contract
    const parsedSource = JSON.parse(slicedSource)
    const contractPaths = Object.keys(parsedSource.sources)
    for (const contractPath of contractPaths) {
      const eachSource = parsedSource.sources[contractPath].content
      contracts.push({
        ...contractBase,
        contractPath,
        sourceCode: eachSource,
      })
    }
  } catch (error) {
    // When there are only one contract
    contracts.push({
      ...contractBase,
      contractPath: '/',
      sourceCode: data.result[0].SourceCode,
    })
  }

  for (const contract of contracts) {
    await prisma.contract.create({ data: contract })
  }

  res.status(200).json({ contracts })
}
