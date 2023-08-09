import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prism-themes/themes/prism-one-light.css'

type HighlightProps = {
  code: string
}

const Highlight = ({ code }: HighlightProps) => {
  // const code
  const myContainer = useRef(null);
  Prism.hooks.add('wrap', function(env) {
    console.log('env', env.token, env)
    if (env.token === 'entity') {
      env.attributes['title'] = env.content.replace(/&amp;/, '&');
    }
  });

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
        className="language-solidity line-numbers"
      >{code}</code>
    </pre>
  )
}

export default Highlight
