import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prism-themes/themes/prism-one-light.css'

type HighlightProps = {
  code: string
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

const addLinksToCode = (code: string, references: any) => {
  // 0x000000000000000000636F6e736F6c652e6c6f67
  if (!code) return code
  const lines = code.split(/\r?\n/)
  for (const reference of references) {
    const lineNumber = reference.locStartLine - 1
    const line = lines[lineNumber]
    const startCol = reference.locStartCol
    const endCol = startCol + (reference.rangeTo - reference.rangeFrom) + 1
    const start = line.substring(0, startCol)
    const middle = line.substring(startCol, endCol)
    const end = line.substring(endCol)
    const output = `${start}<a href="${reference.address}">${middle}</a>${end}`;
    // const output = `${start}<mark>${middle}</mark>${end}`;
    lines[lineNumber] = output
    console.log('line, start, middle, end, output', line, start, middle, end, output)
  }
  return lines.join('\n')
}

const Highlight = ({ code }: HighlightProps) => {
  const formattedCode = addLinksToCode(code, references)

  const myContainer = useRef(null);
  // Prism.hooks.add('wrap', function(env) {
  //   console.log('env', env.token, env)
  //   if (env.token === 'entity') {
  //     env.attributes['title'] = env.content.replace(/&amp;/, '&');
  //   }
  // });

  useEffect(() => {
    if (!myContainer.current) {
      return
    }
    Prism.highlightElement(myContainer.current)
  }, [myContainer])

  return (
    <pre style={{ fontSize: '0.75rem', marginTop: '0px', background: 'red !important' }}>
      <code
        ref={myContainer}
        style={{ background: 'red !important' }}
        className="language-solidity line-numbers keep-markup"
      >{formattedCode}</code>
    </pre>
  )
}

export default Highlight
