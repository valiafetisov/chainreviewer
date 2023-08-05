import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path'
import { parse } from '@solidity-parser/parser'

const SAMPLE_DIR = join(__dirname, '../../../../../sample_data/SparkGoerli_20230802')

function getContract() {
    return readFileSync(join(SAMPLE_DIR, 'src', 'SparkPayloadGoerli.sol'), 'utf8');
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

export default async (_req: NextApiRequest, res: NextApiResponse) => {
    const contractInfo = getContractAndAbi();
    if (!contractInfo) {
        return res.status(500).json({ error: 'Server error' });
    }
    const { contract, abi } = contractInfo;
    const ast = parse(contract, { loc: true, range: true });
    res.status(200).json({ ast, abi: JSON.parse(abi) });
};
