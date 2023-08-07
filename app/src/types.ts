import { ASTNode } from '@solidity-parser/parser/dist/src/ast-types';
export declare interface GetAddressBase {
    type: DirectValueReturn['type'];
}
export declare interface DirectValueReturn  extends GetAddressBase {
    type: 'DirectValueReturn'
    value: string;
}
export declare type GetAddress = DirectValueReturn;
export declare interface AddressInfo {
    contractPath: string;
    contractName: string;
    loc: ASTNode['loc'];
    range: ASTNode['range'];
    source: "variable" | "hardcoded" | "interface" | "public_function" | "external_function" | "private_function" | "state";
    getAddress: GetAddress,
    parent: ASTNode | undefined,
}

