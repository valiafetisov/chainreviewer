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
import AttestationListItem, {
  AttestationMenuItemProps,
} from '~/components/Attestation/ListItem'
import { AiFillCaretRight, AiFillCaretUp } from 'react-icons/ai'

// TODO: remove this mock data when there is proper data fetched @DaeunYoon
// menu props doesn't need to be in type
// the data type is subject of change
const demoAttestationKnownUsers: AttestationMenuItemProps[] = [
  {
    userType: 'me',
    attestation: {
      attestationType: undefined,
      attester: '0xdC233b5368d39FED2EB99EE4dc225882D35ff4B6',
      attestedAt: undefined,
    },
    onClickIcon: () => {},
    onAttest: () => {},
    onRevoke: () => {},
  },
  {
    userType: 'following',
    attestation: {
      attestationType: 'attested',
      attester: '0xdD123b5368d39FED2EB99EE4dc225882D35ff4D4',
      attestedAt: new Date(),
    },
    onClickIcon: () => {},
    onAttest: () => {},
    onRevoke: () => {},
  },
]
const demoAttestationStrangers: AttestationMenuItemProps[] = [
  {
    userType: 'stranger',
    attestation: {
      attestationType: 'attested',
      attester: '0xdB513b5368d39FED2EB99EE4dc225882D35ff4VE',
      attestedAt: new Date(),
    },
    onClickIcon: () => {},
    onAttest: () => {},
    onRevoke: () => {},
  },
  {
    userType: 'stranger',
    attestation: {
      attestationType: 'attested',
      attester: '0xdB513b5368d39FED2EB99EE4dc225882D35ff4VE',
      attestedAt: new Date(),
    },
    onClickIcon: () => {},
    onAttest: () => {},
    onRevoke: () => {},
  },
  {
    userType: 'stranger',
    attestation: {
      attestationType: 'attested',
      attester: '0xdB513b5368d39FED2EB99EE4dc225882D35ff4VE',
      attestedAt: new Date(),
    },
    onClickIcon: () => {},
    onAttest: () => {},
    onRevoke: () => {},
  },
]

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
  const [isAttestationInfosOpen, setIsAttestationInfosOpen] = useState(false)

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

          <div className="bg-white flex flex-col gap-1">
            <MenuTitle
              title="Attestations"
              total={
                demoAttestationKnownUsers.length +
                demoAttestationStrangers.length
              }
              isLoading={isLoadingContracts}
            />
            {demoAttestationKnownUsers.length ? (
              demoAttestationKnownUsers.map((attestation, idx) => (
                <AttestationListItem
                  key={idx}
                  userType={attestation.userType}
                  attestation={attestation.attestation}
                  onClickIcon={() => {}}
                  onAttest={() => {}}
                  onRevoke={() => {}}
                />
              ))
            ) : (
              <MenuEmpty />
            )}
            <button
              className="bg-neutral-100 text-gray-400 w-full"
              disabled={!demoAttestationStrangers.length}
              onClick={() => setIsAttestationInfosOpen(!isAttestationInfosOpen)}
            >
              <div className="flex items-center py-1 px-2">
                {!isAttestationInfosOpen ? (
                  <div className="flex gap-2 items-center mr-1">
                    <AiFillCaretRight />
                    {`show ${demoAttestationStrangers.length}`}
                  </div>
                ) : (
                  <div className="flex gap-2 items-center mr-1">
                    <AiFillCaretUp />
                    hide
                  </div>
                )}
                other attestations
              </div>
            </button>
            {isAttestationInfosOpen &&
              demoAttestationStrangers.length &&
              demoAttestationStrangers.map((attestation, idx) => (
                <AttestationListItem
                  key={idx}
                  userType={attestation.userType}
                  attestation={attestation.attestation}
                  onClickIcon={() => {}}
                  onAttest={() => {}}
                  onRevoke={() => {}}
                />
              ))}
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
