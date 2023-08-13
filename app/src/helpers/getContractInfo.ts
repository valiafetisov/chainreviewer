import { Contract } from '@prisma/client'
import { getChainConfigs, chainsWithoutApiKey } from '.'
import getPrisma from './getPrisma'
import axios from 'axios'
import type { SupportedChain } from '~/types'

export default async function getContractInfo(
  address: string,
  chain: SupportedChain
): Promise<Contract[] | Error> {
  const prisma = getPrisma()
  const addressExists = await prisma.contract.findMany({
    where: {
      address: address as string,
      chain: chain,
    },
  })

  if (addressExists.length) {
    return addressExists
  }

  const { endpoint, apiKey } = getChainConfigs(chain)
  if (!apiKey && !chainsWithoutApiKey.includes(chain)) {
    return new Error('No API key')
  }

  const fetchingURL = !chainsWithoutApiKey.includes(chain)
    ? `${endpoint}/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
    : `${endpoint}/${address}`

  try {
    const { data } = await axios.get(fetchingURL)

    const contracts = []
    if (chainsWithoutApiKey.includes(chain)) {
      const contractBase = {
        address: address,
        chain: chain,
        contractName: data.name,
        abi: JSON.stringify(data.abi),
        compilerVersion: data.compiler_version,
        optimizationUsed: 0,
        runs: Number(data.optimization_runs) ?? 0,
        constructorArguments: data.constructor_args ?? '',
        evmVersion: data.evm_version,
        library:
          data.external_libraries
            .map(
              (l: { name: string; address_hash: string }) =>
                `${l.name}:${l.address_hash.slice(2)}`
            )
            .join(';') ?? '',
        licenseType: '',
        proxy: data.minimal_proxy_address_hash ?? '',
        implementation: '',
        swarmSource: '',
      }

      contracts.push({
        ...contractBase,
        contractPath: data.file_path ?? `/${contractBase.contractName}.sol`,
        sourceCode: data.source_code,
      })

      for (const additionalSource of data.additional_sources) {
        contracts.push({
          ...contractBase,
          contractPath: additionalSource.file_path,
          sourceCode: additionalSource.source_code,
        })
      }
    } else {
      const source = data.result[0].SourceCode
      const slicedSource = source.substring(1, source.length - 1)

      const contractBase = {
        address: address,
        chain: chain,
        contractName: data.result[0].ContractName,
        abi: data.result[0].ABI,
        compilerVersion: data.result[0].CompilerVersion,
        optimizationUsed: Number(data.result[0].OptimizationUsed),
        runs: Number(data.result[0].Runs),
        constructorArguments: data.result[0].ConstructorArguments,
        evmVersion: data.result[0].EVMVersion,
        library: data.result[0].Library,
        licenseType: data.result[0].LicenseType,
        proxy: data.result[0].Proxy,
        implementation: data.result[0].Implementation,
        swarmSource: data.result[0].SwarmSource,
      }

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
          contractPath: `/${contractBase.contractName}.sol`,
          sourceCode: data.result[0].SourceCode,
        })
      }
    }

    // update contracts to database
    const createdContracts = []
    for (const contract of contracts) {
      createdContracts.push(await prisma.contract.create({ data: contract }))
    }
    return createdContracts
  } catch (error: any) {
    console.error(error)
    // Mode endpoint returns 404 when there is no contract
    if (error.response.status === 404) {
      return []
    }
    throw error
  }
}
