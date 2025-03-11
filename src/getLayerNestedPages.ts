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

  const vueFiles = findVueFiles(pagesDir)

  // Filter out only the root index.vue, but keep nested index.vue files
  const filteredFiles = vueFiles.filter((file) => {
    const relativePath = relative(pagesDir, file)
    // Exclude only the root-level index.vue
    return relativePath !== 'index.vue'
  })

  // Create page configs for each file
  return filteredFiles.map((file) => {
    const relativePath = relative(pagesDir, file)
      .replace(/\.vue$/, '') // Remove .vue extension

    // Handle index.vue files in nested directories
    let pagePath
    if (relativePath.endsWith('/index')) {
      // For a file like reports/users/index.vue, we want the path to be /reports/users
      pagePath = `/${layerName}/${relativePath.replace(/\/index$/, '')}`
    }
    else {
      // Normal path with layer name prefix
      pagePath = `/${layerName}/${relativePath}`
    }

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
