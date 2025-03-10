import { existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { PageConfig } from './module'
import { findVueFiles } from './findVueFiles'

/**
 * Get nested pages from a layer
 */
export function getLayerNestedPages(layerName: string, layersDir: string): PageConfig[] {
  const pagesDir = join(layersDir, layerName, 'pages')
  if (!existsSync(pagesDir)) {
    return []
  }

  // Find all .vue files except index.vue using recursive function
  const vueFiles = findVueFiles(pagesDir).filter(file =>
    !file.endsWith('index.vue'),
  )

  // Create page configs for each file
  return vueFiles.map((file) => {
    const relativePath = relative(pagesDir, file)
      .replace(/\.vue$/, '') // Remove .vue extension

    // Create path with layer name prefix
    let pagePath = `/${layerName}/${relativePath}`

    // Properly handle dynamic routes with [parameter] syntax
    pagePath = pagePath.replace(/\/\[([^\]]+)\]/g, '/:$1')

    // Generate a route name without special characters
    const routeName = `${layerName}-${relativePath}`
      .replace(/\//g, '-')
      .replace(/\[([^\]]+)\]/g, '$1')

    return {
      name: routeName,
      path: pagePath,
      file: file,
    }
  })
}
