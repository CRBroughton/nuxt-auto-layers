// src/index.ts
import { readdirSync, existsSync, statSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'
import { defineNuxtModule, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * The directory where your layers are located
   * @default 'app/layers'
   */
  layersDir?: string

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

    // Page auto registration
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

    // Auto-register pages within layers
    if (isFeatureEnabled('pages')) {
      nuxt.hook('pages:extend', (pages) => {
        layerNames.forEach((layerName) => {
          const pagesDir = join(layersDir, layerName, 'pages')
          if (existsSync(pagesDir)) {
            // Find all .vue files except index.vue using recursive function
            const vueFiles = findVueFiles(pagesDir).filter(file =>
              !file.endsWith('index.vue'),
            )

            // Register each .vue file as a page
            vueFiles.forEach((file) => {
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

              pages.push({
                name: routeName,
                path: pagePath,
                file: file,
              })
            })

            console.info(`[nuxt-auto-layers] Registered ${vueFiles.length} nested pages from ${layerName} layer`)
          }
        })
      })
    }
    // Helper function to recursively find .vue files
    function findVueFiles(dir: string) {
      let results: string[] = []
      const list = readdirSync(dir)

      list.forEach((file) => {
        const filePath = join(dir, file)
        const stat = statSync(filePath)

        if (stat.isDirectory()) {
          // Recursive case: it's a directory
          results = results.concat(findVueFiles(filePath))
        }
        else if (file.endsWith('.vue')) {
          // Base case: it's a .vue file
          results.push(filePath)
        }
      })

      return results
    }
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
          console.info(`[nuxt-auto-layers] Registered components from ${componentsDir}"`)
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
          console.info(`[nuxt-auto-layers] Registered composables from ${composablesDir}"`)
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
          console.info(`[nuxt-auto-layers] Registered plugins from ${pluginsDir}"`)
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
          console.info(`[nuxt-auto-layers] Registered shared files from ${sharedDir}"`)
        }
      })
    }

    // Component auto registration
    if (isFeatureEnabled('utils')) {
      layerNames.forEach((layerName) => {
        const utilsDir = join(layersDir, layerName, 'utils')
        if (existsSync(utilsDir)) {
          nuxt.hook('imports:dirs', (dirs) => {
            dirs.push(utilsDir)
          })
          console.info(`[nuxt-auto-layers] Registered utils from ${utilsDir}"`)
        }
      })
    }
  },
})
