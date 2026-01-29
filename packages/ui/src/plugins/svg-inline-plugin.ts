/* eslint-disable ts/explicit-function-return-type */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// Match /assets/icons/*.svg in various contexts
// Handles: '/assets/icons/x.svg', url(/assets/icons/x.svg), bg-[url(/assets/icons/x.svg)]
const SVG_PATH_REGEX = /(?:url\(\\?['"]?)?\\?['"]?\/assets\/icons\/[^'"()\s[\]]+\.svg\\?['"]?(?:\\?['"]?\))?/g

function isSvgAssetPath(p: string) {
  return p.startsWith('/assets/icons/') && p.endsWith('.svg')
}

function svgToDataUri(svgPath: string) {
  // Strip leading slash since path.resolve treats absolute paths differently
  const relativePath = svgPath.replace(/^\//, '')
  const resolvedPath = path.resolve(process.cwd(), 'src', relativePath)

  if (!fs.existsSync(resolvedPath)) {
    return svgPath
  }

  try {
    const content = fs.readFileSync(resolvedPath, 'utf-8')
    if (!content.trim().startsWith('<svg')) {
      return svgPath
    }
    return `data:image/svg+xml,${encodeURIComponent(content)}`
  }
  catch {
    return svgPath
  }
}

export function svgInlinePlugin() {
  return {
    name: 'svg-inline',
    enforce: 'pre',
    transform(code: string, id: string) {
      // Only process .ts and .tsx files
      if (!id.endsWith('.ts') && !id.endsWith('.tsx')) {
        return null
      }

      const matches = [...code.matchAll(SVG_PATH_REGEX)]

      if (matches.length === 0) {
        return null
      }

      let result = code

      for (const match of matches) {
        const fullMatch = match[0]
        // Remove surrounding escapes, quotes, and url() wrapper to get just the path
        const svgPath = fullMatch
          .replace(/^url\(\s*/, '')
          .replace(/\s*\)$/, '')
          .replace(/^\\?['"]+|\\?['"]+$/g, '')

        if (isSvgAssetPath(svgPath)) {
          const dataUri = svgToDataUri(svgPath)
          if (dataUri !== svgPath) {
            // Check if original was wrapped in url()
            const isUrlWrapped = /url\(/.test(fullMatch)

            let replacement
            if (isUrlWrapped) {
              // url(/assets/icons/x.svg) -> url(\'data:image...\')
              // Use escaped single quote since result is inside a JS string
              replacement = `url(\\'${dataUri}\\')`
            }
            else {
              // '/assets/icons/x.svg' -> 'data:image...'
              replacement = `'${dataUri}'`
            }
            result = result.replace(fullMatch, replacement)
          }
        }
      }

      return result
    },
  }
}
