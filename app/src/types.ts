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
