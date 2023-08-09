import useDynamicRouteParams from '~/hooks/useDynamicRouteParams'
import { chainConfigs } from '~/helpers'
import { isAddress } from 'viem'
import { shortendAddress } from '~/helpers'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Contract } from '@prisma/client'
import Highlight from '~/components/Highlight'
import { MenuTitle, MenuTitleWithSearch } from '~/components/MenuTitle'
import MenuEmpty from '~/components/MenuEmpty'

const ContractMenuFileItem = ({ filePath }: { filePath: string }) => (
  <Link
    href={`#${filePath}`}
    className="w-full bg-neutral-100 pt-1 px-2 block hover:bg-secondary transition duration-300 text-primary"
  >
    <span title={filePath} className="reverseElipsis" dir="rtl">
      &lrm;{filePath}
    </span>
  </Link>
)

const ContractMenuReferenceItem = ({
  source,
  address,
  name,
  chain,
}: {
  source: string
  address: string
  name: string
  chain: string
}) => (
  <Link
    href={`/contract/${chain}/${address}`}
    target="_blank"
    className="w-full bg-neutral-100 py-2 px-2 hover:bg-secondary transition duration-300 text-primary"
  >
    <div className="flex justify-between break-words">
      <p>Source: {source}</p>
      <p>{shortendAddress(address)}</p>
    </div>
    <p>{name}</p>
  </Link>
)

// TODO: add AttestationMenuItem props
// isMine
// isMyFollowers
// address
// attestation {address, attestedAt, isRevoked}
// clickIcon
// onClickIcon
// onAttest
// onRevoke

const AttestationMenuItem = () => {}

export default function Address() {
  const { chain, address } = useDynamicRouteParams()
  const chainConfig = chainConfigs[chain as string]
  const isAddressValid = useMemo(
    () => (typeof address === 'string' ? isAddress(address) : false),
    [address]
  )
  const [constracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearchShown, setIsSearchShown] = useState(false)
  const [search, setSearch] = useState('')

  const searchedContracts = useMemo(
    () =>
      constracts
        .map((contract) => ({
          ...contract,
          lowerCasePath: contract.contractPath.toLowerCase(),
        }))
        .filter((contract) =>
          contract.lowerCasePath.includes(search.toLowerCase())
        ),
    [constracts, search]
  )

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
    <div className="flex gap-3">
      <div className="flex-1 max-w-[calc(100%-21rem)] h-full">
        {isLoading ? (
          <div>
            <p>Loading...</p>
          </div>
        ) : (
          <div>
            {constracts.map((contract) => (
              <div key={contract.id} id={contract.contractPath}>
                <MenuTitle
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
            <MenuTitleWithSearch
              title="Files"
              isLoading={isLoading}
              total={constracts.length}
              isSearchShown={isSearchShown}
              setIsSearchShown={setIsSearchShown}
              search={search}
              setSearch={setSearch}
            />
            {searchedContracts.length ? (
              searchedContracts.map((contract) => (
                <ContractMenuFileItem
                  key={contract.id}
                  filePath={contract.contractPath}
                />
              ))
            ) : (
              <MenuEmpty />
            )}
          </div>

          <div>
            <MenuTitle title="Attestations" total={5} isLoading={isLoading} />
          </div>

          <div className="bg-white">
            <div className="bg-white flex flex-col gap-1">
              <MenuTitle title="References" total={3} isLoading={isLoading} />
              <ContractMenuReferenceItem
                chain={chain as string}
                source="code"
                address="0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b"
                name="LedingProtocolProvider"
              />
              <ContractMenuReferenceItem
                chain={chain as string}
                source="code"
                address="0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b"
                name="POOL"
              />
              <ContractMenuReferenceItem
                chain={chain as string}
                source="state"
                address="0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b"
                name="POOL_STATE"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
