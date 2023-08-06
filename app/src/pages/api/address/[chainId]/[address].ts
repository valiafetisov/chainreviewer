import axios from 'axios'
import { getEtherscanApiUrl, getEtherscanApiKey } from '~/helpers'
import { supportedChainIds } from '~/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import getPrisma from '~/helpers/getPrisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address, chainId } = req.query
  const prisma = getPrisma()

  const parsedChainId = supportedChainIds.parse(chainId)
  if (!address) {
    return res.status(400).json({ error: 'No chainId or address' })
  }

  // const addressExists = await prisma.contract.findMany({
  //   where: {
  //     address: address as string,
  //     chainId: parsedChainId,
  //   },
  // })

  // if (addressExists.length) {
  //   return res.status(200).json({ ...addressExists })
  // }

  const { data } = await axios.get(
    `${getEtherscanApiUrl(
      parsedChainId
    )}/api?module=contract&action=getsourcecode&address=${address}&apikey=${getEtherscanApiKey(
      parsedChainId
    )}`
  )
  const source = data.result[0].SourceCode;
  const slicedSource = source.substring(1, source.length - 1)
  // console.log('sliced', typeof slicedSource, slicedSource)
  const parsedSource = JSON.parse(slicedSource)
  // console.log('source', parsedSource.sources)
  const contractPaths = Object.keys(parsedSource.sources);
  // console.log('contractPaths', contractPaths)

  const contracts = [];
  for (const contractPath of contractPaths) {
    const eachSource = parsedSource.sources[contractPath].content
    contracts.push({
        contractPath,
        address: address as string,
        chainId: parsedChainId,
        sourceCode: eachSource,
        contractName: data.result[0].ContractName,
        abi: data.result[0].ABI,
        compilerVersion: data.result[0].CompilerVersion,
        optimizationUsed: data.result[0].OptimizationUsed,
        runs: data.result[0].Runs,
        constructorArguments: data.result[0].ConstructorArguments,
        evmVersion: data.result[0].EVMVersion,
        library: data.result[0].Library,
        licenseType: data.result[0].LicenseType,
        proxy: data.result[0].Proxy,
        implementation: data.result[0].Implementation,
        swarmSource: data.result[0].SwarmSource,
    })
  }

  // await prisma.contract.createMany({ data: contracts })

  res.status(200).json({ contracts })
}
