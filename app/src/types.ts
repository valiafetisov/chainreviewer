import { ASTNode } from '@solidity-parser/parser/dist/src/ast-types'

export type SupportedChain =
  | 'mode'
  | 'ethereum'
  | 'goerli-ethereum'
  | 'sepolia-ethereum'
  | 'optimism'
  | 'optimism-goerli'

export declare interface AddressInfo {
  contractPath: string
  contractName: string
  address: string
  locStartLine: number
  locStartCol: number
  locEndLine: number
  locEndCol: number
  rangeTo?: number
  rangeFrom?: number
  getAddress?: (...args: any) => Promise<any>
  source:
    | 'variable'
    | 'hardcoded'
    | 'interface'
    | 'public_function'
    | 'external_function'
    | 'private_function'
    | 'state'
  parent: ASTNode | undefined
}

/** Attestation */
export type EASChainConfig = {
  chainId: number
  chainName: string
  version: string
  contractAddress: string
  schemaRegistryAddress: string
  etherscanURL: string
  /** Must contain a trailing dot (unless mainnet). */
  subdomain: string
  contractStartBlock: number
  rpcProvider: string
}

export interface AttestationResult {
  data: Data
}

export interface MyAttestationResult {
  data: MyData
}

export interface Data {
  attestation: Attestation | null
}

export interface MyData {
  attestations: Attestation[]
}

export interface Attestation {
  id: string
  attester: string
  recipient: string
  refUID: string
  revocationTime: number
  expirationTime: number
  time: number
  txid: string
  data: string
}

export type ResolvedAttestation = Attestation & {
  decodedData?: Record<string, any>
}
