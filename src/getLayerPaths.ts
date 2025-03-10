import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { logger } from './logger'

/**
 * Get all layer paths
 */
export function getLayerPaths(layersDir: string) {
  try {
    const layers = readdirSync(layersDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => join(layersDir, dirent.name))

    return layers
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.warn(`Could not load layers automatically: ${errorMessage}`)
    return []
  }
}
