import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path'
import { parse, visit } from '@solidity-parser/parser'

const SAMPLE_DIR = join(__dirname, '../../../../../sample_data/DssSpell')

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
    const hardcodedAddresses: string[] = [];
    visit(ast, {
        NumberLiteral: (node) => { isAddress(node.number) ? hardcodedAddresses.push(node.number) : null }
    })
    res.status(200).json({ ast, abi: JSON.parse(abi), hardcodedAddresses });
};
