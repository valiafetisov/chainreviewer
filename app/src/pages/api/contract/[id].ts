import type { NextApiRequest, NextApiResponse } from 'next';
import getPrisma from '~/helpers/getPrisma';
import { z } from 'zod'
import {getAddresses} from '~/helpers/getContractAddresses'

const contractIdSchema = z.number().int().positive();

export default async (req: NextApiRequest, res: NextApiResponse) => {

    const { id } = req.query;
    if (!id) {
        res.status(400).json({ error: 'contract id is required' });
    }
    const contractId = contractIdSchema.parse(id);
    const prisma = getPrisma();
    const contractInfo = await prisma.contract.findUnique({
        where: {
            id: contractId
        }
    });
    if (!contractInfo) {
        throw new Error('Contract not found');
    }
    const temp_return = getAddresses(contractInfo);

    res.status(200).json({ addresses: temp_return });
};
