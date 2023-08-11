import Link from 'next/link'
import ConnectButton from '~/components/ConnectButton'
import { Button } from 'antd'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'
import { AiOutlineUser } from 'react-icons/ai'
import { ReactNode } from 'react'

type HeaderProps = {
  pageDescription?: ReactNode
}

const Header = ({ pageDescription = 'Know your contracts' }: HeaderProps) => {
  const { isConnected, address } = useAccount()
  const router = useRouter()

  return (
    <div className="h-12 py-2 px-2 flex justify-between bg-secondary items-center w-full">
      <div className="flex items-center gap-2">
        <Link href="/" className="font-bold text-primary text-lg">
          Sidescan
        </Link>
        <div className="text-gray-500 text-base">{pageDescription}</div>
      </div>
      <div className="flex gap-2">
        {isConnected && (
          <Button
            onClick={() => router.push(`/user/${address}`)}
            className="bg-white font-bold"
            icon={<AiOutlineUser />}
          >
            Profile
          </Button>
        )}
        <ConnectButton />
      </div>
    </div>
  )
}

export default Header
