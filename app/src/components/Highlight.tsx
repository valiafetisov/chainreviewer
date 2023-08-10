import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import Link from 'next/link'
import 'prism-themes/themes/prism-one-light.css'

type HighlightProps = {
  code: string
  chain: string
}

const references = [
  {
    "contractPath": "lib/forge-std/src/console.sol",
    "contractName": "UniswapV3LP",
    "address": "0x7dd0e3d2d740c6fc08ed2e2bd4122f239ad77875",
    "locStartLine": 5,
    "locStartCol": 47,
    "locEndLine": 5,
    "locEndCol": 47,
    "rangeFrom": 135,
    "rangeTo": 176,
    "source": "hardcoded"
  },
]

const Highlight = ({ code, chain }: HighlightProps) => {
  const myContainer = useRef(null);
  useEffect(() => {
    if (!myContainer.current) {
      return
    }
    Prism.highlightElement(myContainer.current)
  }, [myContainer])
  const numberOfLines = code.match(/\r?\n/g)?.length ?? 0 + 1
  const numberWidth = numberOfLines.toString().length

  return (
    <pre className='relative' style={{ fontSize: '0.75rem', marginTop: '0px' }}>
      <code
        ref={myContainer}
        style={{ background: 'red !important' }}
        className="language-solidity line-numbers"
      >{code}</code>
      {references.map((r, index) => {
        const width = r.rangeTo - r.rangeFrom + 1
        const left = numberWidth + 2 + r.locStartCol
        const widthMultiplier = 0.453
        return <Link
          key={index}
          href={`/contract/${chain}/${r.address}`}
          className='bg-red-500 absolute block mt-1 opacity-40'
          style={{  height: '1rem', top: `${r.locStartLine}rem`, left: `${left * widthMultiplier}rem`, width: `${width * widthMultiplier}rem` }}
        />
      })}
    </pre>
  )
}

export default Highlight
