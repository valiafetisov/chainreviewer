import type {
  Attestation,
  AttestationResult,
  EASChainConfig,
  MyAttestationResult,
} from './types'
import { ethers } from 'ethers'
import axios from 'axios'

/** Attestation */
export const CODE_AUDIT_SCHEMA =
  '0x34a0149c9f5d1831012c9fa52e0375287b1cd16a6a7ecd4cbb3e210695b59f07'

function getChainId() {
  return Number(process.env.NEXT_PUBLIC_CHAIN_ID)
}

export const CHAINID = getChainId()
if (!CHAINID) {
  throw Error('No chain ID env found')
}

export const EAS_CHAIN_CONFIGS: EASChainConfig[] = [
  {
    chainId: 420,
    chainName: 'optimism-goerli',
    subdomain: 'optimism-goerli-bedrock.',
    version: '0.26',
    contractAddress: '0x4200000000000000000000000000000000000021',
    schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
    etherscanURL: 'https://goerli-optimism.etherscan.io/',
    contractStartBlock: 2958570,
    rpcProvider: `https://optimism-goerli.infura.io/v3/`,
  },
]

export const activeChainConfig = EAS_CHAIN_CONFIGS.find(
  (config) => config.chainId === CHAINID
)

if (!activeChainConfig) {
  throw Error('No chain config found for chain ID')
}

export const baseURL = `https://${activeChainConfig!.subdomain}easscan.org`
export const EASContractAddress = activeChainConfig.contractAddress
export const EASVersion = activeChainConfig.version

export const EAS_CONFIG = {
  address: EASContractAddress,
  version: EASVersion,
  chainId: CHAINID,
}

export async function getAttestationsByContractAddress(address: string) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}',

      variables: {
        where: {
          schemaId: {
            equals: CODE_AUDIT_SCHEMA,
          },
          recipient: {
            equals: address,
          },
        },
        orderBy: [
          {
            time: 'desc',
          },
        ],
      },
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )
  return response.data.data.attestations
}

export async function getAttestationsByUserAddress(address: string) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}',

      variables: {
        where: {
          schemaId: {
            equals: CODE_AUDIT_SCHEMA,
          },
          attester: {
            equals: address,
          },
        },
        orderBy: [
          {
            time: 'desc',
          },
        ],
      },
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )
  return response.data.data.attestations
}
