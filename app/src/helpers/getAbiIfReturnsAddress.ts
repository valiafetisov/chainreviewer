import { Interface } from "ethers/lib/utils";
import getContractInfo from "./getContractInfo"
import getPrisma from "./getPrisma";
import { SupportedChain } from "~/types";

const getAbi = async (address: string, chain: string, functionName: string) => {
  await getContractInfo(address, chain as SupportedChain);
  const {abi} = await getPrisma().contract.findFirst({
    where: {
      address,
      chain,
    },
    select: {
      abi: true,
    }
  }) || {abi: null};
  if (!abi) {
    return null;
  }
  for (const [nameFull, func] of Object.entries((new Interface(abi)).functions)){
    const name = nameFull.split('(')[0]
    if (name !== functionName) {
      continue;
    }
    const retTypes = func.outputs?.map(o => o.type);
    if (retTypes?.length !== 1) {
      return;
    }
    const retType = retTypes[0];
    if (retType === 'address') {
      return abi;
    }
  }
  return;
}

export default getAbi
