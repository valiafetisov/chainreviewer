import useDynamicRouteParams from '~/hooks/useDynamicRouteParams'
import { supportedChain } from '~/schemas'
import { isAddress } from 'viem'

export default function Address() {
  const { chain, address } = useDynamicRouteParams()
  const parsedChain = supportedChain.safeParse(chain)
  const isAddressValid = isAddress(address)

  if (!parsedChain.success || !isAddressValid) {
    return (
      <div>
        <p>
          {!parsedChain.success
            ? `Not supported or invalid chain ${chain}`
            : ''}
        </p>
        <p>{!isAddressValid ? `Invalid address ${address}` : ''}</p>
      </div>
    )
  }

  return (
    // TODO: separate into components
    <div className="flex gap-2">
      <div className="flex-1">Code comes here</div>
      <div className="flex flex-col gap-4 w-80">
        <div className="bg-white flex flex-col gap-[3px]">
          <p className="w-full bg-blue-100 py-1 px-2">
            <span className="font-bold">Files</span>&nbsp;
            <span>(4 total)</span>
          </p>
          <p className="w-full bg-blue-50 py-1 px-2">/main.sol</p>
          <p className="w-full bg-blue-50 py-1 px-2">/library/interfaces.sol</p>
          <p className="w-full bg-blue-50 py-1 px-2">/library/interface.sol</p>
          <p className="w-full bg-blue-50 py-1 px-2">/library/helpers.sol</p>
        </div>
        <div className="bg-white">
          <div className="bg-white flex flex-col gap-[3px]">
            <p className="w-full bg-blue-100 py-1 px-2">
              <span className="font-bold">References</span>&nbsp;
              <span>(4 total)</span>
            </p>
            <div className="w-full bg-blue-50 py-1 px-2">
              <div className="flex justify-between">
                <p>Source: code</p>
                <p>0x123...890</p>
              </div>
              <p>LedingProtocolProvider</p>
            </div>
            <div className="w-full bg-blue-50 py-1 px-2">
              <div className="flex justify-between">
                <p>Source: code</p>
                <p>0x513...908</p>
              </div>
              <p>POOL</p>
            </div>
            <div className="w-full bg-blue-50 py-1 px-2">
              <div className="flex justify-between">
                <p>Source: state</p>
                <p>0x145...810</p>
              </div>
              <p>POOL_STATE</p>
            </div>
            <div className="w-full bg-blue-50 py-1 px-2">
              <div className="flex justify-between">
                <p>Source: state</p>
                <p>0x234...897</p>
              </div>
              <p>Oracle</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
