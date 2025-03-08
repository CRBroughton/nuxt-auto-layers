// src/index.ts
import { readdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { defineNuxtModule, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * The directory where your layers are located
   * @default 'app/layers'
   */
  layersDir?: string
}

/**
 * Get all layer paths
 */
const getLayerPaths = (layersDir: string) => {
  try {
    const layers = readdirSync(layersDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => join(layersDir, dirent.name))

    return layers
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.warn(`Could not load layers automatically: ${errorMessage}`)
    return []
  }
}

/**
 * Get all layer names (just the directory names)
 */
const getLayerNames = (layersDir: string) => {
  try {
    return readdirSync(layersDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.warn(`Could not get layer names: ${errorMessage}`)
    return []
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-auto-layers',
    configKey: 'autoLayers',
    compatibility: {
      nuxt: '^3.8.0',
    },
  },
  defaults: {
    layersDir: 'app/layers',
  },
  setup(options, nuxt) {
    const { resolve: resolveAppDir } = createResolver(nuxt.options.rootDir)
    const layersDir = resolveAppDir(options.layersDir!)

    // Get layer paths and extend the Nuxt config with them
    const layerPaths = getLayerPaths(layersDir)
    if (layerPaths.length > 0) {
      // Add layers to the Nuxt config extends array
      if (!nuxt.options.extends) {
        nuxt.options.extends = []
      }

      // If extends is a string, convert it to an array
      if (typeof nuxt.options.extends === 'string') {
        nuxt.options.extends = [nuxt.options.extends]
      }

      // Add layer paths to the extends array
      nuxt.options.extends.push(...layerPaths)
      console.info(`[nuxt-auto-layers] Added ${layerPaths.length} layers: ${layerPaths.join(', ')}`)
    }

    const layerNames = getLayerNames(layersDir)
    nuxt.hook('pages:extend', (pages) => {
      layerNames.forEach((layerName) => {
        const layerRoot = resolve(layersDir, layerName)
        const indexPath = join(layerRoot, 'index.vue')
        if (existsSync(indexPath)) {
          pages.push({
            name: layerName,
            path: `/${layerName}`,
            file: indexPath,
          })
          console.info(`[nuxt-auto-layers] Added route /${layerName} for ${indexPath}`)
        }
      })
    })
  },
})
