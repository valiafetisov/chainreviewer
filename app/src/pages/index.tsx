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
    <div className="flex flex-col items-center justify-center gap-7 flex-1 pb-20">
      <h1 className="text-4xl font-bold">Chain Reviewer</h1>
      <form
        onSubmit={searchContract}
        className="flex justify-center w-full max-w-2xl"
      >
        <div className="flex w-full max-w-2xl">
          <Space.Compact className="w-full">
            <Input
              value={address}
              autoFocus
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
            <Button disabled={!address} className="bg-primary" type="primary" htmlType="submit">
              View Contract
            </Button>
          </Space.Compact>
        </div>
      </form>
      <p className="text-gray-500 opacity-50">
        Or try example contracts:{' '}
        <Link
          className="text-primary underline"
          href="/contract/base/0x78a087d713Be963Bf307b18F2Ff8122EF9A63ae9"
        >
          BswapToken on Base
        </Link>,{' '}
        <Link
          className="text-primary underline"
          href="/contract/ethereum/0xE592427A0AEce92De3Edee1F18E0157C05861564"
        >
          UniswapV3Router
        </Link>,{' '}
        <Link
          className="text-primary underline"
          href="/contract/ethereum/0xa1c423ee0bbC927EF5809c7ebB24c86D4284e431"
        >
          MakerDAO DssSpell on Ethereum
        </Link>{' '}
      </p>
    </div>
  )
}
