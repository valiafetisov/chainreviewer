import { useState, SyntheticEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Select, Input, Button, Space } from 'antd'
import { getChainLabel } from '~/helpers'
import type { SupportedChain } from '~/types'
import { chainConfigs } from '~/helpers'

export default function Home() {
  const [chain, setChain] = useState<SupportedChain>(
    Object.keys(chainConfigs)[0]
  )
  const [address, setAddress] = useState('')
  const router = useRouter()

  const searchContract = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.push(`/contract/${chain}/${address}`)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-7 flex-1">
      <h1 className="text-4xl font-bold">Chain Reviewer</h1>
      <form
        onSubmit={searchContract}
        className="flex justify-center w-full max-w-2xl"
      >
        <div className="flex w-full max-w-2xl">
          <Space.Compact className="w-full">
            <Input
              value={address}
              placeholder="Contract Address 0x..."
              onChange={(val) => setAddress(val.target.value)}
              style={{ borderRadius: '0px' }}
              addonBefore={
                <Select
                  title={getChainLabel[chain]}
                  value={chain}
                  onChange={setChain}
                  options={Object.keys(chainConfigs).map((chain) => ({
                    label: getChainLabel[chain],
                    value: chain,
                  }))}
                  popupMatchSelectWidth={false}
                />
              }
            />
            <Button className="bg-primary" type="primary" htmlType="submit">
              View Source Code
            </Button>
          </Space.Compact>
        </div>
      </form>
      <p className="text-gray-500">
        Or try example contracts:{' '}
        <Link
          className="text-primary underline"
          href="/contract/ethereum/0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b"
        >
          MakerDAOvat.sol
        </Link>{' '}
        <Link
          className="text-primary underline"
          href="/contract/ethereum/0xE592427A0AEce92De3Edee1F18E0157C05861564"
        >
          UniswapV3Router.sol
        </Link>
      </p>
    </div>
  )
}
