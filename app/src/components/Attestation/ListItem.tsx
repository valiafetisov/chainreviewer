import { ReactNode, useMemo } from 'react'
import { Button } from 'antd'
import { shortendAddress, formatDate } from '~/helpers'
import { FiArrowUpRight } from 'react-icons/fi'
import type { ContractAttestation } from '~/types'
import Link from 'next/link'

export interface AttestationMenuItemProps extends ContractAttestation {
  clickIcon?: ReactNode
  isAttesting: boolean
  isProfile?: boolean
  onClickIcon: () => void
  onAttest: () => void
  onRevoke: () => void
}

const ListItem = ({
  userType,
  userName,
  attestation,
  clickIcon,
  isAttesting,
  isProfile,
  onClickIcon,
  onAttest,
  onRevoke,
}: AttestationMenuItemProps) => {
  const backgroundColor = useMemo(() => {
    if (
      userType === 'me' ||
      userType === 'following' ||
      userType === 'profile'
    ) {
      if (attestation.attestationType === 'attested') {
        return 'bg-green-600/30'
      } else if (attestation.attestationType === 'revoked') {
        return 'bg-red-600/30'
      }
      return 'bg-yellow-500/30'
    } else {
      return 'bg-neutral-100'
    }
  }, [userType])

  const statusText = useMemo(() => {
    if (userType === 'me' && attestation.attestedAt) {
      return formatDate(attestation.attestedAt)
    }

    if (attestation.attestationType === 'attested') {
      return 'Attested at ' + formatDate(attestation.attestedAt)
    } else if (attestation.attestationType === 'revoked') {
      return 'Revoked at ' + formatDate(attestation.revokedAt)
    }
    return 'Not yet attested'
  }, [userType])

  const addresss = isProfile
    ? attestation.recipient ?? 'n/a'
    : attestation.attester

  return (
    <div className={`w-full ${backgroundColor} flex flex-col px-2 py-1`}>
      <div className="flex justify-between" title={addresss}>
        {isProfile ? (
          <Link
            className="text-primary hover:underline cursor-pointer"
            href={`/contract/${attestation.chain}/${attestation.recipient}`}
          >
            {addresss}
          </Link>
        ) : userName ? (
          <span>
            {userName} ({shortendAddress(addresss)})
          </span>
        ) : (
          <span>{shortendAddress(addresss)}</span>
        )}
        <Button
          type="link"
          className="text-primary"
          onClick={onClickIcon}
          icon={clickIcon ?? <FiArrowUpRight />}
        />
      </div>
      <div className="flex justify-between">
        <span>{statusText}</span>
        {userType === 'me' && !isProfile ? (
          attestation.attestationType === 'attested' ? (
            <Button
              size="small"
              type="link"
              className="text-primary"
              onClick={onRevoke}
              disabled={isAttesting}
            >
              {isAttesting ? 'Revoking...' : 'Revoke'}
            </Button>
          ) : (
            <Button
              size="small"
              type="link"
              className="text-primary"
              onClick={onAttest}
              disabled={isAttesting}
            >
              {isAttesting ? 'Attestting...' : 'Attest'}
            </Button>
          )
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default ListItem
