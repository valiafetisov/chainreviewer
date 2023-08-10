import { Contract } from '@prisma/client';
import { parse, visit } from '@solidity-parser/parser'
import { ASTNode, BaseASTNode, VariableDeclaration } from '@solidity-parser/parser/dist/src/ast-types';
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

function getFlatLocationInfo(node: ASTNode | BaseASTNode) {
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

const getVariableId = (varName:string, node: ASTNode) => (`${varName} ${node.range ? node.range[0] : ''}`);

export const getAddresses = (contractInfo: Contract) => {
    const { contractName, contractPath, sourceCode, address  } = contractInfo;
    const ast = getAst(sourceCode);
    const addresses: AddressInfo[] = [];
    visit(ast, {
        NumberLiteral: (node, parent) => {
            isAddress(node.number) && node.loc ? addresses.push(
                {
                    contractPath,
                    contractName,
                    address: node.number,
                    locStartLine: node.loc.start.line,
                    locStartCol: node.loc.start.column,
                    locEndLine: node.loc.end.line,
                    locEndCol: node.loc.end.column,
                    rangeFrom: node.range ? node.range[0] : undefined,
                    rangeTo: node.range ? node.range[1] : undefined,
                    source: "hardcoded",
                    parent,
                }
            ) : null
        }
    })
    const discoveredVariables: Record<string, string> = {};
    const discoveredStateVars: Record<string, string> = {};
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
            const varDeclarationIdentifier = (variableDeclaration as VariableDeclaration).identifier;
            if (!varName || !varDeclarationIdentifier) {
                return;
            }
            addresses.push(
                {
                    ...getFlatLocationInfo(varDeclarationIdentifier),
                    contractPath,
                    contractName,
                    source: "variable",
                    address: initValue.number,
                    parent: variableDeclarationParent,
                }
            )
            // If variable declaraton is in block (curly brackets) - search it for the name occurence
            if (!variableDeclarationParent || variableDeclarationParent.type !== 'Block') {
                return
            }
            discoveredVariables[getVariableId(varName, variableDeclarationParent)] = initValue.number;
            visit(variableDeclarationParent, {
                Identifier(identifierNode, identifierParent) {
                    const isNotReferenceToDeclaredVar = (
                        (identifierNode.name !== varName)
                        || identifierNode.range
                        && varDeclarationIdentifier.range
                        && (identifierNode.range[0] === varDeclarationIdentifier.range[0])
                    );
                    if (isNotReferenceToDeclaredVar) {
                        return
                    }
                    addresses.push(
                        {
                            ...getFlatLocationInfo(identifierNode),
                            contractPath,
                            address: initValue.number,
                            contractName,
                            source: "variable",
                            parent: identifierParent,
                        }
                    )
                }
            });
        },
    })
    visit(ast, {
        StateVariableDeclaration(node, variableDeclarationParent) {
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
            if (!variableDeclaration.identifier) {
                return
            }
            addresses.push(
                {
                    ...getFlatLocationInfo(variableDeclaration.identifier),
                    contractPath,
                    contractName,
                    address: initValue.number,
                    source: "state",
                    parent: variableDeclarationParent,
                }
            )
            discoveredStateVars[getVariableId(varName, variableDeclaration.identifier)] = initValue.number;
        },
    })
    visit(ast, {
        Identifier(node, parent) {
            const stateVarsWithMatchingName = Object.keys(discoveredStateVars).filter(key => key.startsWith(`${node.name} `));
            if (stateVarsWithMatchingName.length === 0) {
                return
            }
            const targetRangeStart = node.range ? node.range[0] : undefined;
            if (!targetRangeStart) {
                return
            }
            let relevantDeclarationRangeStart: number = 0;
            stateVarsWithMatchingName.forEach(key => {
                const [_varName, rangeStart] = key.split(' ');
                if (targetRangeStart >= Number(rangeStart) && Number(rangeStart) > relevantDeclarationRangeStart) {
                    relevantDeclarationRangeStart = Number(rangeStart);
                }
            })
            if (relevantDeclarationRangeStart === targetRangeStart) {
                return
            }
            const addressValue = discoveredStateVars[`${node.name} ${relevantDeclarationRangeStart}`] || undefined;
            if (!addressValue) {
                return
            }
            addresses.push(
                {
                    ...getFlatLocationInfo(node),
                    contractPath,
                    contractName,
                    address: addressValue,
                    source: "state",
                    parent,
                }
            )
        }
    })
    return addresses;
}
