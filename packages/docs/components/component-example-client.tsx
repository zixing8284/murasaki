'use client'

import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { LayerProvider } from '@murasaki/react98'
import { Code } from 'nextra/components'
import { evaluate } from 'nextra/evaluate'
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
  /** Nextra-compiled highlighted code block source. */
  compiledSource: string
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

function ComponentExampleCodePre({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLPreElement>): ReactElement {
  const preClassName = ['m98-example__highlighted-pre', className].filter(Boolean).join(' ')

  return (
    <pre className={preClassName} {...props}>
      {children}
    </pre>
  )
}

const codeBlockComponents = {
  code: Code,
  pre: ComponentExampleCodePre,
}

function CompiledCode({ compiledSource }: { compiledSource: string }): ReactElement {
  const Component = evaluate(compiledSource, codeBlockComponents).default
  return <Component />
}

export function ComponentExampleClient({
  title,
  previewClassName,
  previewTheme,
  source,
  compiledSource,
  children,
}: ComponentExampleClientProps): ReactElement {
  const exampleTheme = useSyncExternalStore(
    subscribeDocsExampleTheme,
    getDocsExampleTheme,
    getServerDocsExampleTheme,
  )
  const previewElements = getExampleChildren(children)

  const [tab, setTab] = useState<'preview' | 'code'>('preview')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const baseId = useId()
  const previewId = `${baseId}-preview`
  const codeId = `${baseId}-code`
  const previewTabId = `${baseId}-preview-tab`
  const codeTabId = `${baseId}-code-tab`

  const frameClassName = ['m98-example__preview', previewClassName].filter(Boolean).join(' ')

  async function handleCopyCode(): Promise<void> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText != null) {
        await navigator.clipboard.writeText(source)
      }
      else {
        const fallback = document.createElement('textarea')
        fallback.value = source
        fallback.style.position = 'fixed'
        fallback.style.opacity = '0'
        document.body.appendChild(fallback)
        fallback.focus()
        fallback.select()
        document.execCommand('copy')
        fallback.remove()
      }

      setCopyStatus('copied')
      window.setTimeout(setCopyStatus, 1800, 'idle')
    }
    catch {
      setCopyStatus('failed')
      window.setTimeout(setCopyStatus, 2200, 'idle')
    }
  }

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
          <div className="m98-example__preview-inner">
            <LayerProvider className="m98-example__layer-root">
              {previewElements}
            </LayerProvider>
          </div>
        </div>
      </div>

      <div
        role="tabpanel"
        id={codeId}
        aria-labelledby={codeTabId}
        hidden={tab !== 'code'}
        className="m98-example__panel m98-example__panel--code"
      >
        <div className="m98-example__source">
          <button
            type="button"
            className="m98-example__copy"
            onClick={() => void handleCopyCode()}
            aria-label="Copy example code"
          >
            {copyStatus === 'copied' ? 'COPIED' : copyStatus === 'failed' ? 'FAILED' : 'COPY'}
          </button>
          <div className="m98-example__source-rendered">
            <CompiledCode compiledSource={compiledSource} />
          </div>
        </div>
      </div>
    </section>
  )
}
