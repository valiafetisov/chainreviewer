import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { MenuTitle } from '~/components/MenuTitle'
import MenuEmpty from '~/components/MenuEmpty'
import AttestationListItem from '~/components/Attestation/ListItem'
import type { ContractAttestation, Attestation } from '~/types'
import {
  getContractsAttestationsByUserAddress,
  getFollowersByAddress,
  getFolloweesByAddress,
} from '~/utils'
import { toChecksumAddress } from 'web3-utils'
import { fromUnixTime } from 'date-fns'
import { MdOpenInNew } from 'react-icons/md'
import { List, Button } from 'antd'
import { differenceInCalendarDays } from 'date-fns'
import { getChainNameById, shortendAddress } from '~/helpers'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import {
  FOLLOWING_SCHEMA,
  EASContractAddress,
  followSchemaEncoder,
  getFollowingUser,
} from '~/utils'
import { ethers } from 'ethers'
import { EAS } from '@ethereum-attestation-service/eas-sdk'

const eas = new EAS(EASContractAddress)

export default function Profile() {
  const router = useRouter()
  const { address } = router.query
  const { address: userAddress } = useAccount()

  const [followers, setFollowers] = useState<Attestation[]>([])
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false)

  const [followees, setFollowees] = useState<Attestation[]>([])
  const [isLoadingFollowees, setIsLoadingFollowees] = useState(false)

  const [attestations, setAttestations] = useState<ContractAttestation[]>([])
  const [isLoadingAttestations, setIsLoadingAttestations] = useState(false)

  const [following, setFollowing] = useState<Attestation[]>([])
  const [attesting, setAttesting] = useState(false)
  const [isStale, setIsStale] = useState(false)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const isMyProfile = useMemo(() => {
    return userAddress === address
  }, [address, userAddress])

  async function getFollowees() {
    if (!userAddress) {
      return
    }

    setFollowees([])
    setIsLoadingFollowees(true)
    const tmpAttestations = await getFolloweesByAddress(
      toChecksumAddress(userAddress)
    )

    setFollowees(tmpAttestations)
    setIsLoadingFollowees(false)
  }

  async function getFollowers() {
    setFollowers([])

    if (!address) {
      return
    }

    try {
      setIsLoadingFollowers(true)
      const followings = await getFollowersByAddress(
        toChecksumAddress(address as string)
      )
      setFollowers(followings)
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoadingFollowers(false)
    }
  }

  async function getAtts() {
    if (!address) {
      return
    }

    setAttestations([])
    setIsLoadingAttestations(true)
    const tmpAttestations = await getContractsAttestationsByUserAddress(
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
    getFollowers()
    getFollowees()
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

  const updateFollowing = async () => {
    if (!isMyProfile && userAddress && address) {
      const followingState = await getFollowingUser(
        toChecksumAddress(userAddress),
        toChecksumAddress(address as string)
      )
      setFollowing(followingState)
      setIsStale(false)
    }
  }

  useEffect(() => {
    if (signer || isMyProfile) return
    connectWallet()
  }, [])

  useEffect(() => {
    if (isMyProfile) return
    updateFollowing()
  }, [isMyProfile, userAddress, address])

  useEffect(() => {
    if (isMyProfile || !isStale) return
    updateFollowing()
    getFollowers()
  }, [isStale])

  const connectWallet = async function () {
    // Check if the ethereum object exists on the window object
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.enable()

        const provider = new ethers.providers.Web3Provider(window.ethereum)

        setSigner(provider.getSigner())
      } catch (error) {
        console.error('User rejected request', error)
      }
    } else {
      console.error('Metamask not found')
    }
  }

  const followUser = async () => {
    if (!address) return

    try {
      setAttesting(true)

      const encoded = followSchemaEncoder.encodeData([
        { name: 'isFollowing', type: 'bool', value: true },
      ])

      // @ts-expect-error This should work but type doesn't match.
      // TODO: use the correct type
      eas.connect(signer)

      const tx = await eas.attest({
        data: {
          recipient: address as string,
          data: encoded,
          refUID: ethers.constants.HashZero,
          revocable: true,
          expirationTime: undefined,
        },
        schema: FOLLOWING_SCHEMA,
      })

      await tx.wait()
    } catch (e) {
      console.log(e)
    } finally {
      setIsStale(true)
      setAttesting(false)
    }
  }

  const unfollowUser = async () => {
    if (following.length === 0) return

    try {
      setAttesting(true)
      // @ts-expect-error This should work but type doesn't match.
      // TODO: use the correct type
      eas.connect(signer)

      const tx = await eas.revoke({
        schema: FOLLOWING_SCHEMA,
        data: {
          uid: following[0].id,
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

  return (
    <div className="flex fle items-start justify-between gap-7 flex-1 sticky top-0 h-screen overflow-scroll">
      <div className="flex-1">
        <MenuTitle title="General Info">
          {!isMyProfile && userAddress ? (
            following.length ? (
              <Button
                onClick={unfollowUser}
                className="ml-2 bg-white font-bold"
              >
                {attesting ? 'Unfollowing...' : 'Unfollow'}
              </Button>
            ) : (
              <Button onClick={followUser} className="ml-2 bg-white font-bold">
                {attesting ? 'Following...' : 'Follow'}
              </Button>
            )
          ) : (
            <></>
          )}
        </MenuTitle>
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
      <div className="flex-1 flex flex-col gap-1">
        <MenuTitle
          title={`Followers (${followers.length}) total`}
          isLoading={isLoadingFollowers}
        />
        {followers.length ? (
          followers.map((followers) => (
            <div className="w-full bg-gray-100 p-2">
              <Link
                className="hover:underline text-primary"
                href={`/user/${followers.attester}`}
              >
                {followers.attester}
              </Link>
            </div>
          ))
        ) : (
          <MenuEmpty />
        )}
      </div>

      {isMyProfile ? (
        <div className="flex-1 flex flex-col gap-1">
          <MenuTitle
            title={`Followings (${followees.length}) total`}
            isLoading={isLoadingFollowees}
          />
          {followees.length ? (
            followees.map((followee) => (
              <div className="w-full bg-gray-100 p-2">
                <Link
                  className="hover:underline text-primary"
                  href={`/user/${followee.recipient}`}
                >
                  {followee.recipient}
                </Link>
              </div>
            ))
          ) : (
            <MenuEmpty />
          )}
        </div>
      ) : null}
    </div>
  )
}
