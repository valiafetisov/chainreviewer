import { ASTNode } from '@solidity-parser/parser/dist/src/ast-types';
export declare interface AddressInfo {
    contractPath: string;
    contractName: string;
    loc: ASTNode['loc'];
    range: ASTNode['range'];
    source: "variable" | "hardcoded" | "interface" | "public_function" | "external_function" | "private_function" | "state";
    getAddress: (...args: any[]) => string,
    parent: ASTNode | undefined,
}

