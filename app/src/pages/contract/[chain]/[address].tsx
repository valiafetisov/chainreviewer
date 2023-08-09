import useDynamicRouteParams from '~/hooks/useDynamicRouteParams'
import { chainConfigs } from '~/helpers'
import { isAddress } from 'viem'
import { shortendAddress } from '~/helpers'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Contract } from '@prisma/client'
import Highlight from '~/components/Highlight'
import styles from './address.module.css'
import type { AddressInfo } from '~/types'

const ContractMenuTitle = ({
  title,
  className,
  total,
  isLoading,
}: {
  title: string
  className?: string
  total?: number
  isLoading?: boolean
}) => (
  <p
    className={`w-full bg-neutral-200 py-1 px-2 ${className} ${styles.reverseElipsis}`}
  >
    <span title={title} className="font-bold">
      {title}
    </span>
    &nbsp;
    {isLoading ? (
      <span>Loading...</span>
    ) : (
      total && <span>({total} total)</span>
    )}
  </p>
)

const ContractMenuFileItem = ({ filePath }: { filePath: string }) => (
  <Link
    href={`#${filePath}`}
    className="w-full bg-neutral-100 pt-1 px-2 block hover:bg-secondary transition duration-300 text-primary"
  >
    <span title={filePath} className={styles.reverseElipsis} dir="rtl">
      &lrm;{filePath}
    </span>
  </Link>
)

const ContractMenuReferenceItem = ({
  source,
  address,
  contractPath,
  chain,
}: {
  source: string
  address: string
  contractPath: string
  chain: string
}) => (
  <Link
    href={`/contract/${chain}/${address}`}
    target="_blank"
    className="w-full bg-neutral-100 py-2 px-2 hover:bg-secondary transition duration-300 text-primary"
  >
    <div className="flex justify-between break-words">
      <p>Source: {source}</p>
      <p title={address}>{shortendAddress(address)}</p>
    </div>
    <p>{contractPath}</p>
  </Link>
)

export default function Address() {
  const { chain, address } = useDynamicRouteParams()
  const chainConfig = chainConfigs[chain as string]
  const isAddressValid = useMemo(
    () => (typeof address === 'string' ? isAddress(address) : false),
    [address]
  )
  const [constracts, setContracts] = useState<Contract[]>([])
  const [isLoadingContracts, setIsLoadingContracs] = useState(false)
  const [addressInfos, setAddressInfos] = useState<
    Record<string, AddressInfo[]>
  >({})
  const [isLoadingAddressInfos, setIsLoadingAddressInfos] = useState(false)

  useEffect(() => {
    if (address && chainConfig && isAddressValid) {
      setIsLoadingContracs(true)
      fetch(`/api/address/${chain}/${address}`)
        .then((res) => res.json())
        .then((data) => {
          setContracts(data.contracts)
        })
        .finally(() => {
          setIsLoadingContracs(false)
        })

      setIsLoadingAddressInfos(true)
      fetch(`/api/linking/${chain}/${address}`)
        .then((res) => res.json())
        .then((data) => {
          setAddressInfos(data.addresses)
        })
        .finally(() => {
          setIsLoadingAddressInfos(false)
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
    <div className="flex gap-3">
      <div className="flex-1 max-w-[calc(100%-21rem)] h-full">
        {isLoadingContracts ? (
          <div>
            <p>Loading...</p>
          </div>
        ) : (
          <div>
            {constracts.map((contract) => (
              <div key={contract.id} id={contract.contractPath}>
                <ContractMenuTitle
                  className="sticky top-0 z-10"
                  title={contract.contractPath}
                />
                <div className="-mt-[2px] bg-neutral-900">
                  <Highlight code={contract.sourceCode} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <div className="flex flex-col gap-3 w-80 sticky top-0 h-screen overflow-scroll">
          <div className="bg-white flex flex-col gap-1">
            <ContractMenuTitle
              title="Files"
              isLoading={isLoadingContracts}
              total={constracts.length}
            />
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
            <div className="bg-white flex flex-col gap-1">
              <ContractMenuTitle
                title="References"
                isLoading={isLoadingContracts || isLoadingAddressInfos}
                total={Object.values(addressInfos).reduce(
                  (total, arr) => total + arr.length,
                  0
                )}
              />
              {Object.values(addressInfos).map((arr) =>
                arr.map((addressInfo, idx) => (
                  <ContractMenuReferenceItem
                    key={idx}
                    chain={chain as string}
                    source={addressInfo.source}
                    address={addressInfo.address}
                    contractPath={addressInfo.contractPath}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
