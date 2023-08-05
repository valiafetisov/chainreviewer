import hljs from 'highlight.js'
import React, { useEffect, useRef, useMemo } from 'react'
import 'highlight.js/styles/agate.css'

type HighlightProps = {
  language?: string
  children: React.ReactNode
}

const links = [
  {
    keyword: 'google',
    url: 'https://www.google.com',
  },
  {
    keyword: 'facebook',
    url: 'https://www.facebook.com',
  },
] as const

const Highlight = ({ language, children }) => {
  const codeRef = useRef()

  const linkKeywords = useMemo(() => links.map((link) => link.keyword), [])
  useEffect(() => {
    // Highlight code
    hljs.highlightElement(codeRef.current)

    // Add a link to the "helloWorld" function keyword
    const keywordElements = codeRef.current.querySelectorAll('.hljs-keyword')

    keywordElements.forEach((element) => {
      // TODO: check if the keyword is partially matching -> change it to link
      if (linkKeywords.includes(element.textContent)) {
        const link = document.createElement('a')
        link.href = 'https://example.com' // Replace this URL with your external link
        link.textContent = element.textContent
        element.parentNode.replaceChild(link, element)
      }
    })
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
