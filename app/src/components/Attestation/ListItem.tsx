import { ReactNode, useMemo } from 'react'
import { Button } from 'antd'
import { shortendAddress } from '~/helpers'
import { FiArrowUpRight } from 'react-icons/fi'
import type { ContractAttestation } from '~/types'

export interface AttestationMenuItemProps extends ContractAttestation {
  clickIcon?: ReactNode
  onClickIcon: () => void
  onAttest: () => void
  onRevoke: () => void
}

export default ({
  userType,
  userName,
  attestation,
  clickIcon,
  onClickIcon,
  onAttest,
  onRevoke,
}: AttestationMenuItemProps) => {
  const backgroundColor = useMemo(() => {
    if (userType === 'me' || userType === 'following') {
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
      return attestation.attestedAt.toDateString()
    }

    if (attestation.attestationType === 'attested') {
      return 'Attested at ' + attestation.attestedAt?.toDateString()
    } else if (attestation.attestationType === 'revoked') {
      return 'Revoked at ' + attestation.attestedAt?.toDateString()
    }
    return 'Not yet attested'
  }, [userType])

  return (
    <div className={`w-full ${backgroundColor} flex flex-col px-2 py-1`}>
      <div className="flex justify-between">
        {userName ? (
          <span>
            {userName} ({shortendAddress(attestation.attester)})
          </span>
        ) : (
          <span>{shortendAddress(attestation.attester)}</span>
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
        {userType === 'me' ? (
          attestation.attestationType === 'attested' ? (
            <Button
              size="small"
              type="link"
              className="text-primary"
              onClick={onRevoke}
            >
              Revoke
            </Button>
          ) : (
            <Button
              size="small"
              type="link"
              className="text-primary"
              onClick={onAttest}
            >
              Attest
            </Button>
          )
        ) : (
          ''
        )}
      </div>
    </div>
  )
}