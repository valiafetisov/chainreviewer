import ConnectButton from '~/components/ConnectButton'

type HeaderProps = {
  pageDescription?: string
}

const Header = ({ pageDescription = 'Know your contracts' }: HeaderProps) => {
  return (
    <div className="h-12 py-2 px-2 flex justify-between bg-secondary items-center w-full">
      <div className="flex items-center gap-2">
        <span className="font-bold text-primary text-lg">Sidescan</span>
        <span className="text-gray-500 text-base">{pageDescription}</span>
      </div>
      <ConnectButton />
    </div>
  )
}

export default Header
