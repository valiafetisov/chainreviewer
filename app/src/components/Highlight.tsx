import type { AddressInfo } from '~/types'
import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import Link from 'next/link'
import 'prism-themes/themes/prism-one-light.css'

type HighlightProps = {
  code: string
  chain: string
  references: AddressInfo[]
}

const Highlight = ({ code, chain, references }: HighlightProps) => {
  const myContainer = useRef(null);
  useEffect(() => {
    if (!myContainer.current) {
      return
    }
    Prism.highlightElement(myContainer.current)
  }, [myContainer])

  // debugging references
  // if (references) {
  //   references.push({
  //     "contractPath": "/DssSpell.sol",
  //     "contractName": "DssSpell",
  //     "address": "0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F",
  //     "locStartLine": 1,
  //     "locStartCol": 0,
  //     "locEndLine": 1,
  //     "locEndCol": 0,
  //     "rangeFrom": 0,
  //     "rangeTo": 30,
  //     "source": "hardcoded",
  //     "parent": undefined
  //   })
  //   references.push({
  //     "contractPath": "/DssSpell.sol",
  //     "contractName": "DssSpell",
  //     "address": "0xdA0Ab1e0017DEbCd72Be8599041a2aa3bA7e740F",
  //     "locStartLine": 100,
  //     "locStartCol": 0,
  //     "locEndLine": 1,
  //     "locEndCol": 0,
  //     "rangeFrom": 0,
  //     "rangeTo": 30,
  //     "source": "hardcoded",
  //     "parent": undefined
  //   })
  // }

  return (
    <pre className='relative' style={{ fontSize: '0.75rem', marginTop: '0px' }}>
      <code
        ref={myContainer}
        style={{ background: 'red !important' }}
        className="language-solidity line-numbers"
      >{code}</code>
      <div className='absolute top-0 -mt-[8px] ml-[1px] opacity-20 w-full'>
      {references && references.map((r, index) => {
        if (r.rangeTo === undefined || r.rangeFrom === undefined) {
          return <></>
        }
        const width = r.rangeTo - r.rangeFrom + 1
        const left = r.locStartCol
        const widthMultiplier = 0.45
        const heightMultiplier = 1.1248
        return <Link
          key={index}
          href={`/contract/${chain}/${r.address}`}
          className='bg-red-500 absolute block mt-1 opacity-40'
          style={{  height: '1rem', top: `${r.locStartLine * heightMultiplier}rem`, left: `${left * widthMultiplier}rem`, width: `${width * widthMultiplier}rem` }}
        />
      })}
      </div>
    </pre>
  )
}

export default Highlight
