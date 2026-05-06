import type { ReactElement, ReactNode } from 'react'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { ComponentExampleClient } from './component-example-client'

export type ComponentExamplePreviewTheme = 'auto' | 'none'

interface ComponentExampleProps {
  /** Maps to `./<component>/<name>.tsx` inside the content/components directory. */
  name: string
  /** Optional heading rendered above the example. */
  title?: string
  /** Extra class on the preview pane wrapper, e.g. for fixed heights. */
  previewClassName?: string
  /** Whether the docs preview frame should apply the current docs theme. */
  previewTheme?: ComponentExamplePreviewTheme
  /** MDX children: the live demo JSX. */
  children?: ReactNode
}

const sourceCache = new Map<string, string>()
const contentComponentsRoot = path.join(/* turbopackIgnore: true */ process.cwd(), 'content/components')

export function ComponentExample({
  name,
  title,
  previewClassName,
  previewTheme = 'auto',
  children,
}: ComponentExampleProps): ReactElement {
  const source = readExampleSource(name)

  return (
    <ComponentExampleClient
      title={title}
      previewClassName={previewClassName}
      previewTheme={previewTheme}
      source={source}
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
