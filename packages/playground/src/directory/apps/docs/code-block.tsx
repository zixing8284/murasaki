import type { BundledTheme, Highlighter } from 'shiki'
import { useEffect, useRef, useState } from 'react'
import { createHighlighter } from 'shiki'

const THEME: BundledTheme = 'min-light'
const LANGS = ['tsx', 'typescript', 'js', 'jsx', 'css', 'bash', 'json', 'html'] as const

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: [...LANGS],
    })
  }
  return highlighterPromise
}

interface CodeBlockProps {
  code: string
  lang?: string
}

export function CodeBlock({ code, lang = 'tsx' }: CodeBlockProps): React.ReactElement {
  const [html, setHtml] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    getHighlighter().then((hl) => {
      if (cancelled)
        return
      const result = hl.codeToHtml(code.trim(), {
        lang,
        theme: THEME,
      })
      setHtml(result)
    })
    return () => {
      cancelled = true
    }
  }, [code, lang])

  return (
    <div
      ref={containerRef}
      className="docs-code-block overflow-auto text-[11px] leading-[1.4] [&_pre]:m-0 [&_pre]:p-2 [&_code]:font-[Consolas,monospace] [&_code]:text-[11px]"
      // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
