'use client'

import type { ReactElement, ReactNode } from 'react'
import { useId, useState, useSyncExternalStore } from 'react'

type ComponentExamplePreviewTheme = 'auto' | 'none'

interface ComponentExampleClientProps {
  /** Optional heading rendered above the example. */
  title?: string
  /** Extra class on the preview pane wrapper, e.g. for fixed heights. */
  previewClassName?: string
  /** Whether the docs preview frame should apply the current docs theme. */
  previewTheme: ComponentExamplePreviewTheme
  /** Raw source shown in the Code tab. */
  source: string
  /** MDX children: the live demo JSX. */
  children?: ReactNode
}

type ExampleTheme = 'windows-98' | 'slate'

function getDocsExampleTheme(): ExampleTheme {
  if (typeof document === 'undefined')
    return 'windows-98'

  const root = document.documentElement
  const rootStyle = getComputedStyle(root)

  if (
    root.classList.contains('dark')
    || root.style.colorScheme === 'dark'
    || rootStyle.colorScheme === 'dark'
  ) {
    return 'slate'
  }

  return 'windows-98'
}

function subscribeDocsExampleTheme(onChange: () => void): () => void {
  if (typeof document === 'undefined')
    return () => {}

  const root = document.documentElement
  const observer = new MutationObserver(onChange)
  observer.observe(root, { attributes: true, attributeFilter: ['class', 'style'] })

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', onChange)

  return () => {
    observer.disconnect()
    mediaQuery.removeEventListener('change', onChange)
  }
}

function getServerDocsExampleTheme(): ExampleTheme {
  return 'windows-98'
}

function getExampleChildren(children: ReactNode): ReactNode[] {
  const childArray = Array.isArray(children) ? children : [children]

  return childArray.filter((child) => {
    if (child == null || typeof child === 'boolean')
      return false

    return typeof child !== 'string' || child.trim().length > 0
  })
}

export function ComponentExampleClient({
  title,
  previewClassName,
  previewTheme,
  source,
  children,
}: ComponentExampleClientProps): ReactElement {
  const exampleTheme = useSyncExternalStore(
    subscribeDocsExampleTheme,
    getDocsExampleTheme,
    getServerDocsExampleTheme,
  )
  const previewElements = getExampleChildren(children)

  const [tab, setTab] = useState<'preview' | 'code'>('preview')
  const baseId = useId()
  const previewId = `${baseId}-preview`
  const codeId = `${baseId}-code`
  const previewTabId = `${baseId}-preview-tab`
  const codeTabId = `${baseId}-code-tab`

  const frameClassName = ['m98-example__preview', previewClassName].filter(Boolean).join(' ')

  return (
    <section className="m98-example">
      {title ? <h3 className="m98-example__title">{title}</h3> : null}
      <div className="m98-example__tabs" role="tablist" aria-label={title ?? 'Example'}>
        <button
          type="button"
          role="tab"
          id={previewTabId}
          aria-controls={previewId}
          aria-selected={tab === 'preview'}
          tabIndex={tab === 'preview' ? 0 : -1}
          className="m98-example__tab"
          data-active={tab === 'preview' ? '' : undefined}
          onClick={() => setTab('preview')}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault()
              setTab('code')
              document.getElementById(codeTabId)?.focus()
            }
          }}
        >
          Preview
        </button>
        <button
          type="button"
          role="tab"
          id={codeTabId}
          aria-controls={codeId}
          aria-selected={tab === 'code'}
          tabIndex={tab === 'code' ? 0 : -1}
          className="m98-example__tab"
          data-active={tab === 'code' ? '' : undefined}
          onClick={() => setTab('code')}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault()
              setTab('preview')
              document.getElementById(previewTabId)?.focus()
            }
          }}
        >
          Code
        </button>
      </div>

      <div
        role="tabpanel"
        id={previewId}
        aria-labelledby={previewTabId}
        hidden={tab !== 'preview'}
        className="m98-example__panel"
      >
        <div
          className={frameClassName}
          data-theme={previewTheme === 'auto' ? exampleTheme : undefined}
        >
          <div className="m98-example__preview-inner">{previewElements}</div>
        </div>
      </div>

      <div
        role="tabpanel"
        id={codeId}
        aria-labelledby={codeTabId}
        hidden={tab !== 'code'}
        className="m98-example__panel m98-example__panel--code"
      >
        <pre className="m98-example__source"><code>{source}</code></pre>
      </div>
    </section>
  )
}
