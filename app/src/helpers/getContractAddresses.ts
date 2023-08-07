import { Contract } from '@prisma/client';
import { parse, visit } from '@solidity-parser/parser'
import { ASTNode, VariableDeclaration } from '@solidity-parser/parser/dist/src/ast-types';
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

function getFlatLocationInfo(node: ASTNode) {
    if (!node.loc) {throw new Error('No location info')}
    return {
        locStartLine: node.loc.start.line,
        locStartCol: node.loc.start.column,
        locEndLine: node.loc.end.line,
        locEndCol: node.loc.end.column,
        rangeFrom: node.range ? node.range[0] : undefined,
        rangeTo: node.range ? node.range[1] : undefined,
    }
}

const getVariableId = (varName:string, node: ASTNode) => (`${varName}_${node.loc?.start.line || ''}`);

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
                    ...getFlatLocationInfo(node),
                    source: "hardcoded",
                    getAddress: () => node.number,
                    parent,
                }
            ) : null
        }
    })
    const discoveredVariables: Record<string, string> = {};
    visit(ast, {
        VariableDeclarationStatement(node, variableDeclarationParent) {
            const initValue = node.initialValue;
            if (!initValue || initValue.type !== 'NumberLiteral' || !isAddress(initValue.number)) {
                return
            }
            // only supports single variable in assignment such as `address a = 0x1234`
            const nodeVars = node.variables;
            if (!nodeVars || nodeVars.length !== 1) {
                return;
            }
            const variableDeclaration = nodeVars[0];
            if (!variableDeclaration || variableDeclaration.type !== 'VariableDeclaration') {
                return;
            }
            const varName = (variableDeclaration as VariableDeclaration).name;
            if (!varName) {
                return;
            }
            addresses.push(
                {
                    ...getFlatLocationInfo(node),
                    contractPath,
                    contractName,
                    source: "variable",
                    getAddress: () => initValue.number,
                    parent: variableDeclarationParent,
                }
            )
            discoveredVariables[getVariableId(varName, node)] = initValue.number;
            // If variable declaraton is in block (curly brackets) - search it for the name occurence
            if (!variableDeclarationParent || variableDeclarationParent.type !== 'Block') {
                return
            }
            visit(variableDeclarationParent, {
                Identifier(identifierNode, identifierParent) {
                    if (identifierNode.name === varName && identifierNode.loc !== node.loc) {
                        addresses.push(
                            {
                                ...getFlatLocationInfo(identifierNode),
                                contractPath,
                                contractName,
                                source: "variable",
                                getAddress: () => initValue.number,
                                parent: identifierParent,
                            }
                        )
                    }
                }
            });
        },
    })
    return addresses;
}
