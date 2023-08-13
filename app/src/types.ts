import { ASTNode } from '@solidity-parser/parser/dist/src/ast-types'

export type SupportedChain =
  | 'optimism'
  | 'optimism-goerli'
  | 'mode'
  | 'base'
  | 'ethereum'
  | 'goerli-ethereum'
  | 'sepolia-ethereum'

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
  chainId: number
  contractAddress: string
  contractHash: string
}

export interface ContractAttestation {
  id: string
  userType: 'me' | 'following' | 'stranger'
  userName?: string
  attestation: {
    attestationType?: 'attested' | 'revoked'
    attester: string
    attestedAt?: Date
    revokedAt?: Date
  }
}

// To remove "Property 'ethereum' does not exist on type 'Window & typeof globalThis'." error
// https://ethereum.stackexchange.com/questions/135989/property-ethereum-does-not-exist-on-type-window-typeof-globalthis-in-next
declare global {
  interface Window {
    ethereum: any
  }
}
