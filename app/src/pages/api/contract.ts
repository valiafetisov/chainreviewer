import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path'
import { parse, visit } from '@solidity-parser/parser'
import { ASTNode, StateVariableDeclaration, VariableDeclaration } from '@solidity-parser/parser/dist/src/ast-types';

const SAMPLE_DIR = join(__dirname, '../../../../../sample_data/DssSpell')

interface AddressInfo {
    filename: string;
    loc: ASTNode['loc'];
    range: ASTNode['range'];
    source: "variable" | "hardcoded" | "interface" | "public_function" | "external_function" | "private_function" | "state";
    getAddress: (...args: any[]) => string,
    parent: ASTNode | undefined,
}

function getContract() {
    return readFileSync(join(SAMPLE_DIR, 'DssSpell.sol'), 'utf8');
}

function getAbi() {
    return readFileSync(join(SAMPLE_DIR, 'abi.json'), 'utf8');
}

const getContractAndAbi = () => {
    try {
        return {
            contract: getContract(),
            abi: getAbi()
        }
    } catch (e) {
        return null
    }
}

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

export default async (_req: NextApiRequest, res: NextApiResponse) => {
    const contractInfo = getContractAndAbi();
    if (!contractInfo) {
        return res.status(500).json({ error: 'Server error' });
    }
    const { contract, abi } = contractInfo;
    const ast = getAst(contract);
    if (!ast) {
        return res.status(500).json({ error: 'Server error' });
    }
    const addresses: AddressInfo[] = [];
    visit(ast, {
        NumberLiteral: (node, parent) => {
            isAddress(node.number) && node.loc ? addresses.push(
                {
                    filename: "todo",
                    loc: node.loc,
                    range: node.range,
                    source: "hardcoded",
                    getAddress: () => node.number,
                    parent,
                }
            ) : null
        },
        VariableDeclarationStatement: (node, parent) => {
            if (node.variables.length !== 1
                || !node.variables[0]
                || node.variables[0].type !== 'VariableDeclaration'
            ) {
                return;
            }
            const variableDeclaration = node.variables[0] as VariableDeclaration;
            if (variableDeclaration.typeName?.type !== 'ElementaryTypeName'
                || variableDeclaration.typeName.name !== 'address') {
                return
            }
            addresses.push(
                {
                    filename: "todo",
                    loc: node.loc,
                    range: node.range,
                    source: "variable",
                    getAddress: () => "TODO",
                    parent,
                }
            );
        },
        FunctionDefinition: (node, parent) => {
            if (!node.returnParameters || node.returnParameters.length !== 1) {
                return
            }
            if (node.returnParameters[0].typeName?.type !== 'ElementaryTypeName'
                || node.returnParameters[0].typeName.name !== 'address'
               ) {
                return
            }
            if (!node.body && node.visibility === 'external') {
                addresses.push(
                    {
                        filename: "todo",
                        loc: node.loc,
                        range: node.range,
                        source: "interface",
                        getAddress: () => "TODO",
                        parent,
                    }
                );
                return
            }
            const visibility = node.visibility;
            if (visibility !== 'public' && visibility !== 'external' && visibility !== 'private') {
                return
            }
            addresses.push(
                {
                    filename: "todo",
                    loc: node.loc,
                    range: node.range,
                    source: `${visibility}_function`,
                    getAddress: () => "TODO",
                    parent,
                }
            )
        },
        StateVariableDeclaration: (node, parent) => {
            if (node.variables.length !== 1
                || node.variables[0].type !== 'VariableDeclaration'
                || node.variables[0].typeName?.type !== 'ElementaryTypeName'
                || node.variables[0].typeName.name !== 'address'
            ) {
                return;
            }
            addresses.push({
                filename: "todo",
                loc: node.loc,
                range: node.range,
                source: "state",
                getAddress: () => "TODO",
                parent,
            })
        },
    })
    res.status(200).json({ ast, abi: JSON.parse(abi), addresses });
};
