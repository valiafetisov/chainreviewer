import { useRouter } from 'next/router'
import type { SupportedChain } from '~/types'
import { firstLetterUppercase } from '~/helpers'
import { Select } from 'antd'
import { chainConfigs } from '~/helpers'

type HeaderDescriptionProps = {
  pathname: string
  chain?: SupportedChain
  address?: string
  isFollowing?: boolean
  router: ReturnType<typeof useRouter>
}

const HeaderDescription = ({
  pathname,
  chain,
  address,
  router,
}: HeaderDescriptionProps) => {
  if (pathname.includes('contract') && chain && address) {
    return (
      <>
        <Select
          title={chainConfigs[chain].name}
          value={chain}
          onChange={(newChain) =>
            router.push(`/contract/${newChain}/${address}`)
          }
          options={Object.entries(chainConfigs).map(([chain, chainConfig]) => ({
            label: chainConfig.name,
            value: chain,
          }))}
          className="mr-1"
          popupMatchSelectWidth={false}
        >
          {firstLetterUppercase(chain as string)}{' '}
        </Select>
        / {address}
      </>
    )
  }
  if (pathname.includes('user') && address) {
    return <>{address}</>
  }

  return <>Know Your Contracts</>
}

export default HeaderDescription
