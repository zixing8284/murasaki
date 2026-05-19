import type { ReactElement, ReactNode } from 'react'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { compileMdx } from 'nextra/compile'

import { ComponentExampleClient } from './component-example-client'

export type ComponentExamplePreviewTheme = 'auto' | 'none'

interface ComponentExampleProps {
  /** Maps to `./<component>/<name>.tsx` inside the content/components directory. */
  name: string
  /** Optional heading rendered above the example. */
  title?: string
  /** Extra Tailwind classes on the preview pane wrapper, e.g. `h-80 min-h-80` for fixed heights. */
  previewClassName?: string
  /** When true, the preview inner fills the outer container height with no padding (for edge-test stages). */
  fill?: boolean
  /** Whether the docs preview frame should apply the current docs theme. */
  previewTheme?: ComponentExamplePreviewTheme
  /** MDX children: the live demo JSX. */
  children?: ReactNode
}

const sourceCache = new Map<string, string>()
const compiledSourceCache = new Map<string, string>()
const contentComponentsRoot = path.join(/* turbopackIgnore: true */ process.cwd(), 'content/components')

export async function ComponentExample({
  name,
  title,
  previewClassName,
  fill,
  previewTheme = 'auto',
  children,
}: ComponentExampleProps): Promise<ReactElement> {
  const source = readExampleSource(name)
  const compiledSource = await getCompiledSource(source)

  return (
    <ComponentExampleClient
      title={title}
      previewClassName={previewClassName}
      fill={fill}
      previewTheme={previewTheme}
      source={source}
      compiledSource={compiledSource}
    >
      {children}
    </ComponentExampleClient>
  )
}

function readExampleSource(name: string): string {
  const cached = sourceCache.get(name)
  if (cached !== undefined)
    return cached

  const sourcePath = findExampleSourcePath(contentComponentsRoot, name)
  if (sourcePath == null) {
    throw new Error(`[ComponentExample] Cannot find example source for "${name}".`)
  }

  const source = stripUseClient(fs.readFileSync(sourcePath, 'utf-8')).trimEnd()
  sourceCache.set(name, source)
  return source
}

function findExampleSourcePath(directory: string, name: string): string | null {
  const entries = fs.readdirSync(directory, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory())
      continue

    const candidate = path.join(/* turbopackIgnore: true */ directory, entry.name, `${name}.tsx`)
    if (fs.existsSync(candidate))
      return candidate
  }

  return null
}

function stripUseClient(source: string): string {
  return source.replace(/^\s*(['"])use client\1;?\s*\n/, '')
}

async function getCompiledSource(source: string): Promise<string> {
  const cached = compiledSourceCache.get(source)
  if (cached !== undefined)
    return cached

  const compiledSource = await compileMdx(createExampleCodeFence(source), {
    codeHighlight: true,
    defaultShowCopyCode: false,
    mdxOptions: {},
    useCachedCompiler: false,
  })

  compiledSourceCache.set(source, compiledSource)
  return compiledSource
}

function createExampleCodeFence(source: string): string {
  const longestFence = source.match(/`+/g)?.reduce((longest, fence) => Math.max(longest, fence.length), 0) ?? 0
  const fence = '`'.repeat(Math.max(3, longestFence + 1))

  return `${fence}tsx copy=false word-wrap=false\n${source}\n${fence}`
}
