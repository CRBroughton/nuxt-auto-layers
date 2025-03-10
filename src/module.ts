// src/index.ts
import { readdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { defineNuxtModule, createResolver } from '@nuxt/kit'
import { getLayerNestedPages } from './getLayerNestedPages'
import { logger } from './logger'
import { getLayerPaths } from './getLayerPaths'
import { getLayerIndexRoute } from './getLayerIndexRoute'

export interface ModuleOptions {
  /**
   * The directory where your layers are located
   * @default 'app/layers'
   */
  layersDir?: string

  /**
   * Whether to output debug logs
   * @default false
   */
  debug?: boolean

  /**
   * Configuration for auto-registration features
   * Set to true to enable all features, false to disable all, or use object for granular control
   * @default true
   */
  autoRegister?: boolean | {
    /**
     * Whether to automatically register components from layers
     * @default true
     */
    components?: boolean

    /**
     * Whether to automatically register composables from layers
     * @default true
     */
    composables?: boolean

    /**
     * Whether to automatically register the shared folder from layers
     * @default true
     */
    shared?: boolean

    /**
     * Whether to automatically register plugins from layers
     * @default true
     */
    plugins?: boolean

    /**
     * Whether to automatically register utils from layers
     * @default true
     */
    utils?: boolean

    /**
     * Whether to automatically register nested pages from layers
     * @default true
     */
    pages?: boolean
  }
}

// Define page configuration structure
export interface PageConfig {
  name: string
  path: string
  file: string
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
    logger.warn(`Could not get layer names: ${errorMessage}`)
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
    debug: false,
    autoRegister: true,
  },
  setup(options, nuxt) {
    const { resolve: resolveAppDir } = createResolver(nuxt.options.rootDir)
    const layersDir = resolveAppDir(options.layersDir!)

    // Log startup message
    logger.start('Initialising Nuxt auto layers')

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
      if (options.debug) {
        logger.success(`Added ${layerPaths.length} layers: ${layerPaths.join(', ')}`)
      }
    }
    else {
      logger.warn(`No layers found in ${layersDir}`)
    }

    // Helper function to check if a feature is enabled
    const isFeatureEnabled = (feature: string): boolean => {
      if (typeof options.autoRegister === 'boolean') {
        return options.autoRegister
      }

      if (typeof options.autoRegister === 'object') {
        return options.autoRegister[feature as keyof typeof options.autoRegister] !== false
      }

      return true // Default to true if not specified
    }

    // Page and nested pages auto registration
    const layerNames = getLayerNames(layersDir)
    nuxt.hook('pages:extend', (pages) => {
      layerNames.forEach((layerName) => {
        const layerRoot = resolve(layersDir, layerName)

        // Register layer index page
        const indexRoute = getLayerIndexRoute(layerName, layerRoot)
        if (indexRoute) {
          pages.push(indexRoute)
          if (options.debug) {
            logger.success(`Added route ${indexRoute.path} for ${indexRoute.file}`)
          }
        }

        // Register nested pages if enabled
        if (isFeatureEnabled('pages')) {
          const nestedPages = getLayerNestedPages(layerName, layersDir)

          if (nestedPages.length > 0) {
            pages.push(...nestedPages)
            if (options.debug) {
              logger.success(`Registered ${nestedPages.length} nested pages from ${layerName} layer`)
            }
          }
        }
      })
    })

    // Component auto registration
    if (isFeatureEnabled('components')) {
      layerNames.forEach((layerName) => {
        const componentsDir = join(layersDir, layerName, 'components')
        if (existsSync(componentsDir)) {
          nuxt.hook('components:dirs', (dirs) => {
            dirs.push({
              path: componentsDir,
            })
          })
          if (options.debug) {
            logger.success(`Registered components from ${componentsDir}`)
          }
        }
      })
    }

    // Composables auto registration
    if (isFeatureEnabled('composables')) {
      layerNames.forEach((layerName) => {
        const composablesDir = join(layersDir, layerName, 'composables')
        if (existsSync(composablesDir)) {
          nuxt.hook('imports:dirs', (dirs) => {
            dirs.push(composablesDir)
          })
          if (options.debug) {
            logger.success(`Registered composables from ${composablesDir}`)
          }
        }
      })
    }

    // Plugins auto registration
    if (isFeatureEnabled('plugins')) {
      layerNames.forEach((layerName) => {
        const pluginsDir = join(layersDir, layerName, 'plugins')
        if (existsSync(pluginsDir)) {
          nuxt.hook('imports:dirs', (dirs) => {
            dirs.push(pluginsDir)
          })
          if (options.debug) {
            logger.success(`Registered plugins from ${pluginsDir}`)
          }
        }
      })
    }

    // Shared folder auto registration
    if (isFeatureEnabled('shared')) {
      layerNames.forEach((layerName) => {
        const sharedDir = join(layersDir, layerName, 'shared')
        if (existsSync(sharedDir)) {
          nuxt.hook('imports:dirs', (dirs) => {
            dirs.push(sharedDir)
          })
          if (options.debug) {
            logger.success(`Registered shared files from ${sharedDir}`)
          }
        }
      })
    }

    // Utils auto registration
    if (isFeatureEnabled('utils')) {
      layerNames.forEach((layerName) => {
        const utilsDir = join(layersDir, layerName, 'utils')
        if (existsSync(utilsDir)) {
          nuxt.hook('imports:dirs', (dirs) => {
            dirs.push(utilsDir)
          })
          if (options.debug) {
            logger.success(`Registered utils from ${utilsDir}`)
          }
        }
      })
    }
    logger.success('Nuxt auto layers initialised successfully')
  },
})
