import type { EASChainConfig, MyAttestationResult } from './types'
import axios from 'axios'
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'

/** Attestation */
export const CODE_AUDIT_SCHEMA =
  '0x2436acbad3f99b07f76dd405e38893483047cbcf88691d4a238fc03e12a99b74'
export const FOLLOWING_SCHEMA =
  '0x7292d47ac1cac7f1f430c8e7bd8d93942d9acdc3e88aaf48a5b3b018ffb7af81'

export const EAS_CHAIN_CONFIGS: EASChainConfig = {
  chainId: 420,
  chainName: 'optimism-goerli',
  subdomain: 'optimism-goerli-bedrock.',
  version: '0.26',
  contractAddress: '0x4200000000000000000000000000000000000021',
  schemaRegistryAddress: '0x4200000000000000000000000000000000000020',
  etherscanURL: 'https://goerli-optimism.etherscan.io/',
  contractStartBlock: 2958570,
  rpcProvider: `https://optimism-goerli.infura.io/v3/`,
}

export const baseURL = `https://${EAS_CHAIN_CONFIGS.subdomain}easscan.org`
export const EASContractAddress = EAS_CHAIN_CONFIGS.contractAddress
export const EASVersion = EAS_CHAIN_CONFIGS.version

export const EAS_CONFIG = {
  address: EASContractAddress,
  version: EASVersion,
  chainId: EAS_CHAIN_CONFIGS.chainId,
}

export const contractSchemaEncoder = new SchemaEncoder(
  'uint24 chainId,address contractAddress,string contractHash'
)
export const followSchemaEncoder = new SchemaEncoder('bool isFollowing')

export async function getContractsAttestationsByContractAddress(
  address: string,
  chainId: number
) {
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
    .map((attestation) => {
      const decoded = contractSchemaEncoder
        .decodeData(attestation.data)
        .reduce((acc, decoded) => {
          acc[decoded.name] = decoded.value.value
          return acc
        }, {} as Record<string, any>)

      return {
        ...attestation,
        chainId: Number(decoded.chainId),
        contractAddress: decoded.contractAddress,
        contractHash: decoded.contractHash,
      }
    })
    .filter((attestation) => {
      return attestation.chainId === chainId
    })
}

export async function getContractsAttestationsByUserAddress(
  address: string,
  chainId?: number
) {
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
    .map((attestation) => {
      const decoded = contractSchemaEncoder
        .decodeData(attestation.data)
        .reduce((acc, decoded) => {
          acc[decoded.name] = decoded.value.value
          return acc
        }, {} as Record<string, any>)

      return {
        ...attestation,
        chainId: Number(decoded.chainId),
        contractAddress: decoded.contractAddress,
        contractHash: decoded.contractHash,
      }
    })
    .filter((attestation) => {
      if (!chainId) return true
      return attestation.chainId === chainId
    })
}

export async function getFollowingUsersByAddress(address: string) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}',

      variables: {
        where: {
          schemaId: {
            equals: FOLLOWING_SCHEMA,
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

  return response.data.data.attestations.filter((attestation) => {
    const decoded = followSchemaEncoder
      .decodeData(attestation.data)
      .reduce((acc, decoded) => {
        acc[decoded.name] = decoded.value.value
        return acc
      }, {} as Record<string, any>)

    return !decoded.isFollowing
  })
}

export async function getFollowersByAddress(address: string) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}',

      variables: {
        where: {
          schemaId: {
            equals: FOLLOWING_SCHEMA,
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

  return response.data.data.attestations.filter((attestation) => {
    const decoded = followSchemaEncoder
      .decodeData(attestation.data)
      .reduce((acc, decoded) => {
        acc[decoded.name] = decoded.value.value
        return acc
      }, {} as Record<string, any>)

    return decoded.isFollowing
  })
}

export async function getFollowingUser(follower: string, followee: string) {
  const response = await axios.post<MyAttestationResult>(
    `${baseURL}/graphql`,
    {
      query:
        'query Attestations($where: AttestationWhereInput, $orderBy: [AttestationOrderByWithRelationInput!]) {\n  attestations(where: $where, orderBy: $orderBy) {\n    attester\n    revocationTime\n    expirationTime\n    time\n    recipient\n    id\n    data\n  }\n}',

      variables: {
        where: {
          schemaId: {
            equals: FOLLOWING_SCHEMA,
          },
          attester: {
            equals: follower,
          },
          recipient: {
            equals: followee,
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

  return response.data.data.attestations.filter((attestation) => {
    const decoded = followSchemaEncoder
      .decodeData(attestation.data)
      .reduce((acc, decoded) => {
        acc[decoded.name] = decoded.value.value
        return acc
      }, {} as Record<string, any>)

    return decoded.isFollowing
  })
}
