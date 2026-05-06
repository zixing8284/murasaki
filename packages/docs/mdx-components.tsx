import type { MDXComponents } from 'mdx/types'
import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs'
import { ComponentExample } from './components/component-example'

const themeComponents = getThemeComponents()

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...themeComponents,
    ComponentExample,
    ...components,
  }
}
