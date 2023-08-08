import useDynamicRouteParams from '~/hooks/useDynamicRouteParams'
import { chainConfigs } from '~/helpers'
import { isAddress } from 'viem'
import { shortendAddress } from '~/helpers'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Contract } from '@prisma/client'
import Highlight from '~/components/Highlight'

const ContractMenuTitle = ({
  title,
  total,
}: {
  title: string
  total: number
}) => (
  <p className="w-full bg-blue-100 py-1 px-2">
    <span className="font-bold">{title}</span>&nbsp;
    <span>({total} total)</span>
  </p>
)

const ContractMenuFileItem = ({ filePath }: { filePath: string }) => (
  <Link
    href={`#${filePath}`}
    className="w-full bg-blue-50 py-1 px-2 break-words"
  >
    {filePath}
  </Link>
)

const ContractMenuReferenceItem = ({
  source,
  address,
  name,
}: {
  source: string
  address: string
  name: string
}) => (
  <div className="w-full bg-blue-50 py-1 px-2">
    <div className="flex justify-between break-words">
      <p>Source: {source}</p>
      <p>{shortendAddress(address)}</p>
    </div>
    <p>{name}</p>
  </div>
)

export default function Address() {
  const { chain, address } = useDynamicRouteParams()
  const chainConfig = chainConfigs[chain as string]
  const isAddressValid = useMemo(
    () => (typeof address === 'string' ? isAddress(address) : false),
    [address]
  )
  const [constracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (address && chainConfig && isAddressValid) {
      setIsLoading(true)
      fetch(`/api/address/${chain}/${address}`)
        .then((res) => res.json())
        .then((data) => {
          setContracts(data.contracts)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [address, chain, isAddressValid, chainConfig])

  if (!address || !chainConfig || !isAddressValid) {
    return (
      <div>
        <p>{!chainConfig ? `Not supported or invalid chain ${chain}` : ''}</p>
        <p>
          {!address
            ? 'Address not provided'
            : !isAddressValid
            ? `Invalid address ${address}`
            : ''}
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-2 h-screen">
      <div className="flex-1 max-w-[calc(100%-20rem)] h-full overflow-scroll">
        {isLoading ? (
          <div>
            <p>Loading...</p>
          </div>
        ) : (
          <div>
            {constracts.map((contract) => (
              <div key={contract.id} id={contract.contractPath}>
                <h1 className="text-xl font-bold bg-white sticky top-0 z-10">
                  {contract.contractPath}
                </h1>
                <Highlight code={contract.sourceCode} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 w-80 h-full overflow-scroll">
        <div className="bg-white flex flex-col gap-[3px] relative">
          <ContractMenuTitle title="File" total={constracts.length} />
          {constracts.map((contract) => (
            <>
              <ContractMenuFileItem
                key={contract.id}
                filePath={contract.contractPath}
              />
            </>
          ))}
        </div>
        <div className="bg-white">
          <div className="bg-white flex flex-col gap-[3px]">
            <ContractMenuTitle title="References" total={3} />
            <ContractMenuReferenceItem
              source="code"
              address="0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b"
              name="LedingProtocolProvider"
            />
            <ContractMenuReferenceItem
              source="code"
              address="0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b"
              name="POOL"
            />
            <ContractMenuReferenceItem
              source="state"
              address="0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b"
              name="POOL_STATE"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
