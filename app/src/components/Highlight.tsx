import { useEffect } from 'react'
import Prism from 'prismjs'
import 'prismjs/themes/prism-okaidia.css'

type HighlightProps = {
  code: string
}

const Highlight = ({ code }: HighlightProps) => {
  useEffect(() => {
    // Highlight code
    Prism.highlightAll()
  }, [])

  return (
    <pre style={{ fontSize: '0.85rem' }}>
      <code className="language-solidity line-numbers">{code}</code>
    </pre>
  )
}

export default Highlight
