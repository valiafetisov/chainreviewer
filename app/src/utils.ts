import type {
  Attestation,
  AttestationResult,
  EASChainConfig,
  MyAttestationResult,
} from './types'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ethers } from 'ethers'
import axios from 'axios'

/** Attestation */
export const CODE_AUDIT_SCHEMA ='0x34a0149c9f5d1831012c9fa52e0375287b1cd16a6a7ecd4cbb3e210695b59f07',

dayjs.extend(duration)
dayjs.extend(relativeTime)

function getChainId() {
  return Number(process.env.NEXT_PUBLIC_CHAIN_ID)
}

export const CHAINID = getChainId()
if(!CHAINID){
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

if(!activeChainConfig){
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

export async function getAddressForENS(name: string) {
  const provider = new ethers.providers.StaticJsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
    'mainnet'
  )

  return await provider.resolveName(name)
}

export async function getAttestation(uid: string): Promise<Attestation | null> {
  const response = await axios.post<AttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Query($where: AttestationWhereUniqueInput!) {\n  attestation(where: $where) {\n    id\n    attester\n    recipient\n    revocationTime\n    expirationTime\n    time\n    txid\n    data\n  }\n}',
      variables: {
        where: {
          id: uid,
        },
      },
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )
  return response.data.data.attestation
}

export async function getAttestationsForAddress(address: string) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}',

      variables: {
        where: {
          schemaId: {
            equals: CUSTOM_SCHEMAS.SKILL_SCHEMA,
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

export async function getConfirmationAttestationsForUIDs(refUids: string[]) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  refUID\n  }\n}',

      variables: {
        where: {
          schemaId: {
            equals: CUSTOM_SCHEMAS.CONFIRM_SCHEMA,
          },
          refUID: {
            in: refUids,
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

/** POAP SUBGRAPH */
export async function getRecentlyMintedPoapForId(to: string) {
  const response = await axios.post<{ validateEntities: PoapWithEvent[] }>(
    'https://api.thegraph.com/subgraphs/name/sharathkrml/poap-gnosis',
    {
      query: `query Poap {\n  validateEntities(\n    first: 15\n    where: { to: "${to}"}\n    orderBy: id\n    orderDirection: desc\n  ) {\n    id\n    eventId\n  }\n}`,
      variables: {},
    },
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )

  const poaps = [] as PoapWithEvent[]
  for (const validateEntity of response.data.data.validateEntities) {
    const eventResponse = await axios.get(
      `https://api.poap.tech/metadata/${validateEntity.eventId}/${validateEntity.id}`
    )

    poaps.push({
      ...validateEntity,
      imageUri: eventResponse.data.image_url,
    })
  }

  return poaps
}
