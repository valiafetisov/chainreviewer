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
import type { AddressInfo } from '~/types'

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

// TODO: mock attestation UI will be implemented from next frontend PR @DaeunYoon
// isMine
// isMyFollowers
// address
// attestation {address, attestedAt, isRevoked}
// clickIcon
// onClickIcon
// onAttest
// onRevoke
const AttestationMenuItem = ({}: {}) => {}
const demoAttestations = []

export default function Address() {
  const { chain, address } = useDynamicRouteParams()
  const chainConfig = chainConfigs[chain as string]
  const isAddressValid = useMemo(
    () => (typeof address === 'string' ? isAddress(address) : false),
    [address]
  )
  const [constracts, setContracts] = useState<Contract[]>([])
  const [isLoadingContracts, setIsLoadingContracs] = useState(false)
  const [contractSearch, setContractSearch] = useState('')
  const [addressInfos, setAddressInfos] = useState<
    Record<string, AddressInfo[]>
  >({})
  const [isLoadingAddressInfos, setIsLoadingAddressInfos] = useState(false)
  const [addressInfosSearch, setAddressInfosSearch] = useState('')

  const searchedContracts = useMemo(
    () =>
      constracts
        .map((contract) => ({
          ...contract,
          lowerCasePath: contract.contractPath.toLowerCase(),
        }))
        .filter((contract) =>
          contract.lowerCasePath.includes(contractSearch.toLowerCase())
        ),
    [constracts, contractSearch]
  )

  const searchedAddressInfos = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(addressInfos).map(([filePath, addressInfos]) => [
          filePath,
          addressInfos.filter(
            (addressInfo) =>
              addressInfo.contractPath
                .toLocaleLowerCase()
                .includes(addressInfosSearch.toLowerCase()) ||
              addressInfo.address
                .toLocaleLowerCase()
                .includes(addressInfosSearch.toLowerCase()) ||
              addressInfo.source
                .toLocaleLowerCase()
                .includes(addressInfosSearch.toLowerCase())
          ),
        ])
      ),
    [addressInfos, addressInfosSearch]
  )

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
    }
  }, [address, chain, isAddressValid, chainConfig])

  useEffect(() => {
    if (constracts.length) {
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
  }, [constracts])

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
                <MenuTitle
                  className="sticky top-0 z-10"
                  title={contract.contractPath}
                />
                <div className="-mt-[2px]">
                  <Highlight code={contract.sourceCode} chain={chain} />
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
              isLoading={isLoadingContracts}
              total={constracts.length}
              search={contractSearch}
              setSearch={setContractSearch}
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
            <MenuTitle
              title="Attestations"
              total={5}
              isLoading={isLoadingContracts}
            />
          </div>

          <div className="bg-white">
            <div className="bg-white flex flex-col gap-1">
              <MenuTitleWithSearch
                title="References"
                isLoading={isLoadingContracts || isLoadingAddressInfos}
                total={Object.values(searchedAddressInfos).reduce(
                  (total, arr) => total + arr.length,
                  0
                )}
                search={addressInfosSearch}
                setSearch={setAddressInfosSearch}
              />
              {Object.values(searchedAddressInfos).map((arr) =>
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
