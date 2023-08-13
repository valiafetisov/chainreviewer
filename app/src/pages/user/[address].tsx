import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { MenuTitle } from '~/components/MenuTitle'
import MenuEmpty from '~/components/MenuEmpty'
import AttestationListItem from '~/components/Attestation/ListItem'
import type { ContractAttestation } from '~/types'
import { getAttestationsByUserAddress } from '~/utils'
import { toChecksumAddress } from 'web3-utils'
import { fromUnixTime } from 'date-fns'
import { MdOpenInNew } from 'react-icons/md'
import { List } from 'antd'
import { differenceInCalendarDays } from 'date-fns'
import { getChainNameById } from '~/helpers'

export default function Profile() {
  const router = useRouter()
  const { address } = router.query

  const [attestations, setAttestations] = useState<ContractAttestation[]>([])
  const [isLoadingAttestations, setIsLoadingAttestations] = useState(false)

  async function getAtts() {
    if (!address) {
      return
    }

    setAttestations([])
    setIsLoadingAttestations(true)
    const tmpAttestations = await getAttestationsByUserAddress(
      toChecksumAddress(address as string)
    )

    let contractAttestations: ContractAttestation[] = []

    tmpAttestations.forEach((att) => {
      const isRevoked = att.revocationTime !== 0

      contractAttestations.push({
        id: att.id,
        userType: 'profile',
        userName: undefined,
        attestation: {
          attester: att.attester,
          attestedAt: fromUnixTime(att.time),
          revokedAt: isRevoked ? fromUnixTime(att.revocationTime) : undefined,
          attestationType: isRevoked ? 'revoked' : 'attested',
          recipient: att.recipient,
          chain: getChainNameById(att.chainId),
        },
      })
    })

    setAttestations(contractAttestations)
    setIsLoadingAttestations(false)
  }

  useEffect(() => {
    getAtts()
  }, [address])

  const userData = useMemo(
    () => [
      {
        title: 'First Attestation',
        value: () => {
          const attestedAt =
            attestations?.[attestations.length - 1]?.attestation?.attestedAt
          return attestedAt
            ? `${differenceInCalendarDays(new Date(), attestedAt)} days ago`
            : 'N/A'
        },
      },
      {
        title: 'Last Attestation',
        value: attestations?.[0]?.attestation?.attestedAt
          ? `${differenceInCalendarDays(
              new Date(),
              attestations[0].attestation.attestedAt
            )} days ago`
          : 'N/A',
      },
      {
        title: 'Number of Attestations',
        value: attestations.filter(
          (att) => att.attestation.attestationType === 'attested'
        ).length,
      },
      {
        title: 'Revoked Attestations',
        value: attestations.filter(
          (att) => att.attestation.attestationType === 'revoked'
        ).length,
      },
    ],
    [address, attestations]
  )

  return (
    <div className="flex fle items-start justify-between gap-7 flex-1 sticky top-0 h-screen overflow-scroll">
      <div className="flex-1">
        <MenuTitle title="General Info" />
        <List
          itemLayout="vertical"
          size="large"
          dataSource={userData}
          renderItem={(item) => (
            <List.Item>
              <div className="flex gap-2">
                <div className="w-[240px] font-bold text-gray-600">
                  {item.title}
                </div>
                <div>
                  {typeof item.value === 'function' ? item.value() : item.value}
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <MenuTitle
          title={`Actions (${attestations.length}) total`}
          isLoading={isLoadingAttestations}
        />
        {attestations.length ? (
          attestations.map((attestation) => (
            <AttestationListItem
              key={attestation.id}
              id={attestation.id}
              userType={attestation.userType}
              userName={attestation.userName}
              attestation={attestation.attestation}
              isAttesting={false}
              isProfile={true}
              clickIcon={<MdOpenInNew />}
              onClickIcon={() =>
                window.open(
                  `https://optimism-goerli-bedrock.easscan.org/attestation/view/${attestation.id}`
                )
              }
              onAttest={() => {}}
              onRevoke={() => {}}
            />
          ))
        ) : (
          <MenuEmpty />
        )}
      </div>
    </div>
  )
}
