import axios from 'axios'
import { getEtherscanApiUrl, getEtherscanApiKey } from '~/helpers'
import { supportedChainIds } from '~/schemas'

export default async function handler(req, res) {
  const { address, chainId } = req.query
  const apikey = process.env.ETHERSCAN_API_KEY as string

  const parsedChainId = supportedChainIds.parse(chainId)
  if (!address) {
    return res.status(400).json({ error: 'No chainId or address' })
  }

  const { data } = await axios.get(
    `${getEtherscanApiUrl(
      parsedChainId
    )}/api?module=contract&action=getsourcecode&address=${address}&apikey=${getEtherscanApiKey(
      parsedChainId
    )}`
  )

  res.status(200).json({ ...data.result })
}
