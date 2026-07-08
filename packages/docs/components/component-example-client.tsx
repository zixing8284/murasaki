'use client'

import type { HTMLAttributes, ReactElement, ReactNode } from 'react'
import { LayerProvider } from '@murasaki-io/react98'
import { Code } from 'nextra/components'
import { evaluate } from 'nextra/evaluate'
import { useId, useState } from 'react'

type ComponentExamplePreviewTheme = 'auto' | 'none'

interface ComponentExampleClientProps {
  /** Optional heading rendered above the example. */
  title?: string
  /** Extra Tailwind classes on the preview pane wrapper, e.g. `h-80 min-h-80` for fixed heights. */
  previewClassName?: string
  /** When true, the preview inner fills the outer container height with no padding (for edge-test stages). */
  fill?: boolean
  /** Whether the docs preview frame should apply the current docs theme. */
  previewTheme: ComponentExamplePreviewTheme
  /** Raw source shown in the Code tab. */
  source: string
  /** Nextra-compiled highlighted code block source. */
  compiledSource: string
  /** MDX children: the live demo JSX. */
  children?: ReactNode
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
  const preClassName = [
    'm-0 overflow-visible bg-transparent font-(--m98-docs-font-mono) text-[12px] leading-[1.45]',
    '[&_code.nextra-code]:block [&_code.nextra-code]:font-(--m98-docs-font-mono) [&_code.nextra-code]:text-[12px] [&_code.nextra-code]:leading-[1.45] [&_code.nextra-code]:whitespace-pre',
    className,
  ].filter(Boolean).join(' ')

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
  fill = false,
  previewTheme,
  source,
  compiledSource,
  children,
}: ComponentExampleClientProps): ReactElement {
  const exampleTheme = 'windows-98'
  const previewElements = getExampleChildren(children)

  const [tab, setTab] = useState<'preview' | 'code'>('preview')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const baseId = useId()
  const previewId = `${baseId}-preview`
  const codeId = `${baseId}-code`
  const previewTabId = `${baseId}-preview-tab`
  const codeTabId = `${baseId}-code-tab`

  const frameClassName = [
    'min-h-28 overflow-auto bg-(--m98-docs-preview-bg) shadow-(--shadow-border-field) text-(--window-text)',
    previewClassName,
  ].filter(Boolean).join(' ')

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
    <section className="mt-7 mb-9">
      {title ? <h3 className="text-base mt-0 mb-2.5">{title}</h3> : null}
      <div className="inline-flex gap-1 mb-2 border-b border-b-(--m98-docs-border)" role="tablist" aria-label={title ?? 'Example'}>
        <button
          type="button"
          role="tab"
          id={previewTabId}
          aria-controls={previewId}
          aria-selected={tab === 'preview'}
          tabIndex={tab === 'preview' ? 0 : -1}
          className="appearance-none bg-transparent border-none border-b-2 border-b-transparent py-1.5 px-2.5 [font:inherit] text-[0.9rem] text-inherit cursor-pointer opacity-70 data-active:opacity-100 data-active:border-b-current hover:opacity-100 focus-visible:[outline:2px_solid_currentColor] focus-visible:-outline-offset-2"
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
          className="appearance-none bg-transparent border-none border-b-2 border-b-transparent py-1.5 px-2.5 [font:inherit] text-[0.9rem] text-inherit cursor-pointer opacity-70 data-active:opacity-100 data-active:border-b-current hover:opacity-100 focus-visible:[outline:2px_solid_currentColor] focus-visible:-outline-offset-2"
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
      >
        <div
          className={frameClassName}
          data-theme={previewTheme === 'auto' ? exampleTheme : undefined}
        >
          <div
            className={[
              'box-border relative font-(--m98-docs-font-mono) text-[12px] leading-tight [font-smooth:never] [-webkit-font-smoothing:none] [text-rendering:optimizeSpeed] *:max-w-full',
              fill ? 'h-full p-0' : 'min-h-full p-(--m98-docs-example-padding)',
            ].join(' ')}
          >
            <LayerProvider className="overflow-visible">
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
        className="mt-0 [&_pre]:m-0"
      >
        <div className="relative max-h-90 overflow-auto pt-10 px-3 pb-3 bg-(--m98-docs-code-bg) shadow-(--shadow-border-field) text-(--m98-docs-code-text)">
          <button
            type="button"
            className="absolute top-2 right-2 border border-(--m98-docs-code-copy-border) bg-(--m98-docs-code-copy-bg) text-(--m98-docs-code-text) [font:inherit] text-[11px] leading-none py-1.25 px-2 cursor-pointer hover:bg-(--m98-docs-code-copy-hover) focus-visible:[outline:1px_solid_currentColor] focus-visible:outline-offset-1"
            onClick={() => void handleCopyCode()}
            aria-label="Copy example code"
          >
            {copyStatus === 'copied' ? 'COPIED' : copyStatus === 'failed' ? 'FAILED' : 'COPY'}
          </button>
          <div>
            <CompiledCode compiledSource={compiledSource} />
          </div>
        </div>
      </div>
    </section>
  )
}
