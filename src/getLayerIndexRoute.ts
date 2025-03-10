import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { PageConfig } from './module'

/**
 * Get layer index page configuration
 */
export function getLayerIndexRoute(layerName: string, layerRoot: string): PageConfig | null {
  const indexPath = join(layerRoot, 'index.vue')
  if (existsSync(indexPath)) {
    return {
      name: layerName,
      path: `/${layerName}`,
      file: indexPath,
    }
  }
  return null
}
