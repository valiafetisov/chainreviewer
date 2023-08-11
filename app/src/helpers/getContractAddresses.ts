import { Contract } from '@prisma/client';
import { parse, visit } from '@solidity-parser/parser'
import { ASTNode, BaseASTNode, VariableDeclaration } from '@solidity-parser/parser/dist/src/ast-types';
import { AddressInfo } from '~/types'
import loadContractLibraries from './loadContractLibraries';
import getPrisma from './getPrisma';
import {Contract as EthersContract, utils, providers} from 'ethers'
import { FormatTypes } from 'ethers/lib/utils';
import getAbiIfReturnsAddress from './getAbiIfReturnsAddress';
import getProvider from './getProvider';

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
  if (!node.loc) { throw new Error('No location info') }
  return {
    locStartLine: node.loc.start.line,
    locStartCol: node.loc.start.column,
    locEndLine: node.loc.end.line,
    locEndCol: node.loc.end.column,
    rangeFrom: node.range ? node.range[0] : undefined,
    rangeTo: node.range ? node.range[1] : undefined,
  }
}

const getVariableId = (varName: string, node: ASTNode) => (`${varName} ${node.range ? node.range[0] : ''}`);

export const getAddresses = async (contractInfo: Contract) => {
  const { contractName, contractPath, sourceCode, address, chain } = contractInfo;
  const ast = getAst(sourceCode);
  const addresses: AddressInfo[] = [];
  // Number literals are added twice, so we skip every second one
  let skipNextNumber = false;
  visit(ast, {
    NumberLiteral: (node, parent) => {
      if (isAddress(node.number) && node.loc && !skipNextNumber) {
        addresses.push(
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
        )
      }
      skipNextNumber = !skipNextNumber;
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
  const loadedLibraries = await loadContractLibraries(address, chain);
  const monitoredFunctions: Record<string, string[]> = {};
  for (const [libraryName, libraryAddress] of Object.entries(loadedLibraries)) {
    const abi = (await getPrisma().contract.findFirst({
      where: {
        address: libraryAddress,
        chain,
      }
    }))?.abi;
    if ( !abi ) {
      continue;
    }
    const iface = new utils.Interface(abi);
    const ifaceElements = iface.format(FormatTypes.full);
    if (!(ifaceElements instanceof Array)) {
      continue;
    }
    const relevantFunctions = ifaceElements.filter((element) => element.startsWith('function') && element.includes('returns (address)'));
    const relevantFunctionNames = relevantFunctions.map((element) => element.split(' ')[1].split('(')[0]);
    monitoredFunctions[libraryName] = relevantFunctionNames;
  }
  visit(ast, {
    MemberAccess(node, parent) {
      const memberAccessExpression = node.expression;
      if (!parent || parent.type !== 'FunctionCall') {
        return;
      }
      if (memberAccessExpression.type !== 'FunctionCall') {
        return;
      }
      const memberAccessFunctionCallExpression = memberAccessExpression.expression;
      if (memberAccessFunctionCallExpression.type !== 'Identifier') {
        return;
      }
      const memberAccessFunctionCallArguments = memberAccessExpression.arguments;
      if (memberAccessFunctionCallArguments.length !== 1) {
        return;
      }
      const memberAccessFunctionCallArgument = memberAccessFunctionCallArguments[0];
      if (memberAccessFunctionCallArgument.type !== 'NumberLiteral' && memberAccessFunctionCallArgument.type !== 'Identifier') {
        return;
      }
      if (memberAccessFunctionCallArgument.type === 'Identifier') {
        const addressToCall = discoveredStateVars[memberAccessFunctionCallArgument.name] || discoveredVariables[memberAccessFunctionCallArgument.name] || undefined;
        if (!addressToCall) {
          return
        }
        const functionToCall = node.memberName;
        const argsToUse = parent.arguments.map((arg) => {
          if (arg.type === 'NumberLiteral') {
            return arg.number;
          }
          if (arg.type === 'StringLiteral') {
            return arg.value;
          }
          if (arg.type === 'Identifier') {
            const val = discoveredStateVars[arg.name] || discoveredVariables[arg.name] || undefined;
            if (!val) {
              return null;
            }
            return val;
          }
        })
        if (argsToUse.includes(null)) {
          return;
        };
        addresses.push(
          {
            ...getFlatLocationInfo(node),
            contractPath,
            contractName,
            address: '',
            source: "public_function",
            parent,
            getAddress: async () => {
              const abi = await getAbiIfReturnsAddress(addressToCall, chain, functionToCall);
              if (!abi) {
                throw new Error(`Could not find ABI for ${addressToCall} on ${chain}`);
              }
              const provider = getProvider(chain);
              const contract = new EthersContract(addressToCall, abi, provider);
              return await contract[functionToCall](...argsToUse)
            },
          }
        )
      }
      else if (memberAccessFunctionCallArgument.type === 'NumberLiteral') {
        const addressToCall = memberAccessFunctionCallArgument.number;
        const functionToCall = node.memberName;
        const argsToUse = parent.arguments.map((arg) => {
          if (arg.type === 'NumberLiteral') {
            return arg.number;
          }
          if (arg.type === 'StringLiteral') {
            return arg.value;
          }
          if (arg.type === 'Identifier') {
            const val = discoveredStateVars[arg.name] || discoveredVariables[arg.name] || undefined;
            if (!val) {
              return null;
            }
            return val;
          }
        })
        if (argsToUse.includes(null)) {
          return;
        };
        addresses.push(
          {
            ...getFlatLocationInfo(node),
            contractPath,
            contractName,
            address: '',
            source: "public_function",
            parent,
            getAddress: async () => {
              const abi = await getAbiIfReturnsAddress(addressToCall, chain, functionToCall);
              if (!abi) {
                throw new Error(`Could not find ABI for ${addressToCall} on ${chain}`);
              }
              const provider = getProvider(chain);
              const contract = new EthersContract(addressToCall, abi, provider);
              return await contract[functionToCall](...argsToUse)
            }
          }
        )
      }
    },
  })
  const resolvedAddressIdx: number[] = [];
  await Promise.all(addresses.map(async (address, i) => {
    if (!address.getAddress) {
      resolvedAddressIdx.push(i);
      return
    }
    try {
      address.address = await address.getAddress();
      resolvedAddressIdx.push(i);
    } catch (e) {
      return
    }
  }))
  return addresses.filter((_, i) => resolvedAddressIdx.includes(i));
}
