import hljs from 'highlight.js'
import hljsDefineSolidity from 'highlightjs-solidity'

import React, { useEffect, useRef, useMemo } from 'react'
import 'highlight.js/styles/agate.css'

type HighlightProps = {
  language?: string
  children: React.ReactNode
}

hljsDefineSolidity(hljs)

const Highlight = ({ language, children }) => {
  const codeRef = useRef()

  useEffect(() => {
    // Highlight code
    hljs.highlightElement(codeRef.current)
  }, [])

  return (
    <pre>
      <code ref={codeRef} className={`hljs language-${language}`}>
        {children}
      </code>
    </pre>
  )
}

export default Highlight
