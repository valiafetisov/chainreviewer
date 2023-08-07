import { Contract } from '@prisma/client';
import { parse, visit } from '@solidity-parser/parser'
import {AddressInfo} from '~/types'

const isAddress = (val: string) => {
    return val.length === 42 && val.startsWith('0x')
}

function getAst(val: string) {
    try {
        return parse(val, { loc: true, range: true });
    } catch (e) {
        console.error(e)
        return null
    }
}

export const getAddresses = (contractInfo: Contract) => {
    const { contractName, contractPath, sourceCode  } = contractInfo;
    const ast = getAst(sourceCode);
    const addresses: AddressInfo[] = [];
    visit(ast, {
        NumberLiteral: (node, parent) => {
            isAddress(node.number) && node.loc ? addresses.push(
                {
                    contractPath,
                    contractName,
                    loc: node.loc,
                    range: node.range,
                    source: "hardcoded",
                    getAddress: () => node.number,
                    parent,
                }
            ) : null
        }
    })
    return addresses;
}
