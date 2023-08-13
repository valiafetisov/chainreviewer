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
import { FiArrowUpRight } from 'react-icons/fi'
import type {
  AddressInfo,
  SupportedChain,
  ContractAttestation,
  Attestation,
} from '~/types'
import AttestationListItem from '~/components/Attestation/ListItem'
import { AiFillCaretRight, AiFillCaretUp } from 'react-icons/ai'
import { EAS } from '@ethereum-attestation-service/eas-sdk'
import {
  CODE_AUDIT_SCHEMA,
  EASContractAddress,
  getAttestationsByContractAddress,
  contractSchemaEncoder,
} from '~/utils'
import { ethers } from 'ethers'
import { toChecksumAddress } from 'web3-utils'
import { useAccount } from 'wagmi'
import { fromUnixTime } from 'date-fns'
import { useRouter } from 'next/router'

const digestMessage = async function (message: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

const ContractMenuFileItem = ({ filePath }: { filePath: string }) => (
  <Link
    href={`#${filePath}`}
    className="w-full bg-neutral-100 pt-1 px-2 block hover:bg-secondary transition duration-300 text-primary"
  >
    <span title={filePath} className="reverseElipsis" dir="rtl">
      &lrm;{filePath && filePath.substring(filePath.lastIndexOf('\/') + 1)}
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
  chain: SupportedChain
}) => (
  <div className='flex'>
    <Link
      href={`#${contractPath}`}
      className="flex-1 block w-full bg-neutral-100 py-2 px-2 hover:bg-secondary transition duration-300 text-primary"
    >
      <div className="flex justify-between break-words">
        <p>Source: {source}</p>
        <p title={address}>{shortendAddress(address)}</p>
      </div>
      {/* <p>{contractPath}</p> */}
    </Link>
    <Link
      href={`/contract/${chain}/${address}`}
      target="_blank"
      className="flex-shrink-0 block bg-neutral-100 py-2 px-2 hover:bg-secondary transition duration-300 text-primary"
    ><FiArrowUpRight /></Link>
  </div>
)

const eas = new EAS(EASContractAddress)

export default function Address() {
  const { chain, address } = useDynamicRouteParams()
  const chainConfig = chainConfigs[chain as SupportedChain]
  const { address: myAddress, isConnected } = useAccount()
  const router = useRouter()

  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoadingContracts, setIsLoadingContracs] = useState(false)
  const [contractSearch, setContractSearch] = useState('')
  const [addressInfos, setAddressInfos] = useState<
    Record<string, AddressInfo[]>
  >({})
  const [isLoadingAddressInfos, setIsLoadingAddressInfos] = useState(false)
  const [addressInfosSearch, setAddressInfosSearch] = useState('')
  const [isAttestationInfosOpen, setIsAttestationInfosOpen] = useState(false)
  const [isLoadingAttestations, setIsLoadingAttestations] = useState(false)
  const [attestationsKnownUsers, setAttestationsKnownUsers] = useState<
    ContractAttestation[]
  >([])
  const [attestationsStrangers, setAttestationsStrangers] = useState<
    ContractAttestation[]
  >([])

  const [attesting, setAttesting] = useState(false)
  const [isStale, setIsStale] = useState(false)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)

  const contractHashPromise = useMemo(async () => {
    if (!contracts.length) return ''
    return await digestMessage(contracts.map(c => c.sourceCode).join())
  }, [contracts])

  const isAddressValid = useMemo(
    () => (typeof address === 'string' ? isAddress(address) : false),
    [address]
  )

  const searchedContracts = useMemo(
    () =>
      Array.isArray(contracts) && contracts
        .map((contract) => ({
          ...contract,
          lowerCasePath: contract.contractPath.toLowerCase(),
        }))
        .filter((contract) =>
          contract.lowerCasePath.includes(contractSearch.toLowerCase())
        ),
    [contracts, contractSearch]
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

  const connectWallet = async function () {
    // Check if the ethereum object exists on the window object
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.enable()

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        setSigner(signer)
        return signer;
      } catch (error) {
        console.error('User rejected request', error)
      }
    } else {
      console.error('Metamask not found')
    }
  }

  const revokeContract = async function (uid: string) {
    const localSigner = signer ? signer : await connectWallet()
    try {
      setAttesting(true)
      // @ts-expect-error This should work but type doesn't match.
      // TODO: use the correct type
      eas.connect(localSigner)

      const tx = await eas.revoke({
        schema: CODE_AUDIT_SCHEMA,
        data: {
          uid,
        },
      })

      await tx.wait()
    } catch (e) {
      console.error(e)
    } finally {
      setIsStale(true)
      setAttesting(false)
    }
  }

  const attestContract = async function ({
    contractAddress,
    contractHash,
    chainId,
  }: {
    contractAddress: string
    contractHash: string
    chainId: number
  }) {
    const localSigner = signer ? signer : await connectWallet()
    try {
      setAttesting(true)

      const encoded = contractSchemaEncoder.encodeData([
        { name: 'chainId', type: 'uint16', value: chainId },
        {
          name: 'contractAddress',
          type: 'address',
          value: contractAddress,
        },
        { name: 'contractHash', type: 'string', value: contractHash },
      ])

      // @ts-expect-error This should work but type doesn't match.
      // TODO: use the correct type
      eas.connect(localSigner)

      const tx = await eas.attest({
        data: {
          recipient: contractAddress,
          data: encoded,
          refUID: ethers.constants.HashZero,
          revocable: true,
          expirationTime: undefined,
        },
        schema: CODE_AUDIT_SCHEMA,
      })

      await tx.wait()
    } catch (e) {
      console.log(e)
    } finally {
      setIsStale(true)
      setAttesting(false)
    }
  }

  async function getAtts() {
    if (!address) {
      return
    }

    setAttestationsKnownUsers([])
    setAttestationsStrangers([])
    setIsLoadingAttestations(true)
    const tmpAttestations = await getAttestationsByContractAddress(
      toChecksumAddress(address as string)
    )

    const uniqueAttstations: Attestation[] = []
    const uniqueAttestors: Set<string> = new Set()

    for (const att of tmpAttestations) {
      if (!uniqueAttestors.has(att.attester)) {
        uniqueAttestors.add(att.attester)
        uniqueAttstations.push(att)
      }
    }

    let contractAttestations: ContractAttestation[] = []

    uniqueAttstations.forEach((att) => {
      const isRevoked = att.revocationTime !== 0
      // const decodedData = contractSchemaEncoder.decodeData(att.data)

      contractAttestations.push({
        id: att.id,
        userType: att.attester === myAddress ? 'me' : 'stranger',
        userName: att.attester === myAddress ? 'YOU' : undefined,
        attestation: {
          attester: att.attester,
          attestedAt: fromUnixTime(att.time),
          revokedAt: isRevoked ? fromUnixTime(att.revocationTime) : undefined,
          attestationType: isRevoked ? 'revoked' : 'attested',
        },
      })
    })

    if (
      myAddress &&
      !contractAttestations.find((att) => att.userType === 'me')
    ) {
      contractAttestations.push({
        id: 'not-attested',
        userType: 'me',
        userName: 'YOU',
        attestation: {
          attester: myAddress,
          attestedAt: undefined,
          attestationType: undefined,
        },
      })
    }

    setAttestationsKnownUsers(
      contractAttestations.filter((att) => att.userType !== 'stranger')
    )
    setAttestationsStrangers(
      contractAttestations.filter((att) => att.userType === 'stranger')
    )
    setIsLoadingAttestations(false)
    setIsStale(false)
  }

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

  const parseUniqueAddresses = (contracts?: Record<string, AddressInfo[]>): AddressInfo[] => {
    if (!contracts) {
      return []
    }
    const uniqueAddressInfos: AddressInfo[] = [];
    for (const addressInfo of Object.values(contracts).flat()) {
      if (uniqueAddressInfos.some(u => u.address === addressInfo.address)) {
        continue
      }
      uniqueAddressInfos.push(addressInfo)
    }
    return uniqueAddressInfos
  }

  useEffect(() => {
    if (contracts.length) {
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
  }, [contracts])

  useEffect(() => {
    getAtts()
  }, [contracts, myAddress])

  useEffect(() => {
    if (isStale) {
      getAtts()
    }
  }, [isStale])

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

  if (!isLoadingContracts && (contracts?.[0]?.abi === 'Contract source code not verified' || !contracts?.[0]?.sourceCode)) {
    return (
      <div>
        <p>
          Contract source code is not verified
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
            {Array.isArray(contracts) && contracts.map((contract) => (
              <div key={contract.id} id={contract.contractPath}>
                <MenuTitle
                  className="sticky top-0 z-10"
                  title={contract.contractPath}
                />
                <div className="-mt-[2px]">
                  <Highlight
                    code={contract.sourceCode}
                    references={addressInfos[contract.contractPath]}
                    chain={chain as SupportedChain}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <div className="flex flex-col gap-3 w-80 sticky top-0 h-screen overflow-scroll">
        <div className="bg-white flex flex-col gap-1">
            <MenuTitle
              title="Attestations"
              total={
                attestationsKnownUsers.filter(
                  (att) => att.attestation.attestationType === 'attested'
                ).length + attestationsStrangers.length
              }
              isLoading={isLoadingContracts || isLoadingAttestations}
            />
            {isConnected ? (
              attestationsKnownUsers.length ? (
                attestationsKnownUsers.map((attestation) => (
                  <AttestationListItem
                    key={attestation.id}
                    id={attestation.id}
                    userType={attestation.userType}
                    userName={attestation.userName}
                    attestation={attestation.attestation}
                    isAttesting={attesting}
                    onClickIcon={() =>
                      router.push(`/user/${attestation.attestation.attester}`)
                    }
                    onAttest={async () => {
                      attestContract({
                        contractAddress: address as string,
                        chainId: chainConfig.chainId,
                        contractHash: await contractHashPromise,
                      })
                    }}
                    onRevoke={() => {
                      revokeContract(attestation.id)
                    }}
                  />
                ))
              ) : (
                <MenuEmpty />
              )
            ) : (
              <></>
            )}
            {isConnected && (
              <button
                className="bg-neutral-100 text-gray-400 w-full"
                disabled={!attestationsStrangers.length}
                onClick={() =>
                  setIsAttestationInfosOpen(!isAttestationInfosOpen)
                }
              >
                <div className="flex items-center py-1 px-2">
                  {!isAttestationInfosOpen ? (
                    <div className="flex gap-2 items-center mr-1">
                      <AiFillCaretRight />
                      {`show ${attestationsStrangers.length}`}
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
            )}
            {(isAttestationInfosOpen && attestationsStrangers.length) ||
            !isConnected ? (
              attestationsStrangers.map((attestation) => (
                <AttestationListItem
                  key={attestation.id}
                  id={attestation.id}
                  userType={attestation.userType}
                  attestation={attestation.attestation}
                  onClickIcon={() =>
                    router.push(`/user/${attestation.attestation.attester}`)
                  }
                  isAttesting={false}
                  onAttest={() => {}}
                  onRevoke={() => {}}
                />
              ))
            ) : (
              <></>
            )}
          </div>

          <div className="bg-white flex flex-col gap-1">
            <MenuTitleWithSearch
              title="Files"
              isLoading={isLoadingContracts}
              total={contracts.length}
              search={contractSearch}
              setSearch={setContractSearch}
            />
            {Array.isArray(searchedContracts) ? (
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

          <div className="bg-white flex flex-col gap-1 pb-32">
            <MenuTitleWithSearch
              title="References"
              isLoading={isLoadingContracts || isLoadingAddressInfos}
              total={parseUniqueAddresses(searchedAddressInfos).length}
              search={addressInfosSearch}
              setSearch={setAddressInfosSearch}
            />
            {parseUniqueAddresses(searchedAddressInfos).map((addressInfo, idx) => (
              <ContractMenuReferenceItem
                key={idx}
                chain={chain as SupportedChain}
                source={addressInfo.source}
                address={addressInfo.address}
                contractPath={addressInfo.contractPath}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
