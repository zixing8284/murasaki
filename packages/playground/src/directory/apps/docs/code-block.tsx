import type { BundledTheme, Highlighter } from 'shiki'
import { useEffect, useState } from 'react'
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

// Module-scoped cache: same (lang, code) renders to identical HTML, so reuse it
// across remounts and unrelated CodeBlock instances. Trim mirrors render-time trim.
const htmlCache = new Map<string, string>()
const cacheKey = (lang: string, code: string): string => `${lang}::${code}`

interface CodeBlockProps {
  code: string
  lang?: string
}

export function CodeBlock({ code, lang = 'tsx' }: CodeBlockProps): React.ReactElement {
  const trimmed = code.trim()
  const key = cacheKey(lang, trimmed)

  // Track key alongside html so that prop changes which hit the cache update
  // synchronously during render — no extra effect-driven setState. The effect
  // below only handles the cache-miss async highlight path.
  const [snapshot, setSnapshot] = useState<{ key: string, html: string }>(() => ({
    key,
    html: htmlCache.get(key) ?? '',
  }))
  if (snapshot.key !== key) {
    setSnapshot({ key, html: htmlCache.get(key) ?? snapshot.html })
  }

  useEffect(() => {
    if (htmlCache.has(key))
      return

    let cancelled = false
    getHighlighter().then((hl) => {
      if (cancelled)
        return
      const result = hl.codeToHtml(trimmed, {
        lang,
        theme: THEME,
      })
      htmlCache.set(key, result)
      setSnapshot({ key, html: result })
    })
    return () => {
      cancelled = true
    }
  }, [key, lang, trimmed])

  return (
    <div
      className="docs-code-block text-[11px] leading-[1.4] [&_pre]:m-0 [&_pre]:p-2 [&_code]:font-[Consolas,monospace] [&_code]:text-[11px]"
      // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{ __html: snapshot.html }}
    />
  )
}
