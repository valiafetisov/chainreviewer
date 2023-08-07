import { ASTNode } from '@solidity-parser/parser/dist/src/ast-types';
export declare interface AddressInfo {
    contractPath: string;
    contractName: string;
    locStartLine: number;
    locStartCol: number;
    locEndLine: number;
    locEndCol: number;
    rangeTo?: number;
    rangeFrom?: number;
    source: "variable" | "hardcoded" | "interface" | "public_function" | "external_function" | "private_function" | "state";
    getAddress: (...args: any[]) => string,
    parent: ASTNode | undefined,
}

