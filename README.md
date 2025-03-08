# nuxt-auto-layers

> 🚀 Automatically discover and extend Nuxt layers with zero configuration

This module automatically detects all layers within your project and sets up the necessary configuration without you having to manually declare each layer.

## Features

- ✅ **Auto-discovery**: Automatically finds all layers in your project
- ✅ **Auto-routing**: Creates routes for each layer's index.vue file
- ✅ **Auto-registration**: Automatically registers components, composables, plugins, utils, and shared folders
- ✅ **Zero configuration**: Works out of the box with sensible defaults
- ✅ **Fully customizable**: Control which features to auto-register

## Quick Setup

1. Add `nuxt-auto-layers` dependency to your project

```bash
npm install @crbroughton/nuxt-auto-layers
```

2. Add `nuxt-auto-layers` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    '@crbroughton/nuxt-auto-layers'
  ],
  future: {
    compatibilityVersion: 4, // <- enable Nuxt 4 app folder
  },
})
```

That's it! The module will automatically:
- Discover all directories in `app/layers` and add them as Nuxt layers
- Register routes for each layer's index.vue file
- Register components, composables, plugins, utils and shared folders from each layer

## How It Works

This module scans your project for directories within the `app/layers` folder (configurable) and automatically:

1. Adds each directory as a Nuxt layer through the `extends` configuration
2. Creates routes for each layer's root index.vue file (e.g., `app/layers/admin/index.vue` → `/admin`)
3. Registers the following from each layer:
   - Components from the `components` directory 
   - Composables from the `composables` directory
   - Plugins from the `plugins` directory
   - Utils from the `utils` directory
   - Shared modules from the `shared` directory

### Directory Structure

By default, the module expects your layers to be in the `app/layers` directory:

```
your-project/
├── app/
│   ├── layers/
│   │   ├── admin/
│   │   │   ├── components/    # Auto-registered
│   │   │   ├── composables/   # Auto-registered
│   │   │   ├── plugins/       # Auto-registered
│   │   │   ├── utils/         # Auto-registered
│   │   │   ├── shared/        # Auto-registered
│   │   │   ├── index.vue      # Auto-routed to /admin (required)
│   │   │   └── ... other Nuxt directories
│   │   ├── shop/
│   │   │   ├── components/    # Auto-registered
│   │   │   ├── composables/   # Auto-registered
│   │   │   ├── plugins/       # Auto-registered
│   │   │   ├── utils/         # Auto-registered
│   │   │   ├── shared/        # Auto-registered
│   │   │   ├── index.vue      # Auto-routed to /shop (required)
│   │   │   └── ... other Nuxt directories
```

Each directory under `app/layers` becomes a Nuxt layer, allowing you to organize your application into modular, self-contained pieces.

## Configuration

You can customize the behavior of this module in your `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  modules: [
    '@crbroughton/nuxt-auto-layers'
  ],
  autoLayers: {
    // Custom directory for layers (default: 'app/layers')
    layersDir: 'custom/path/to/layers',
    
    // Control auto-registration features
    // Option 1: Enable/disable all features at once
    autoRegister: true, // or false to disable all
    
    // Option 2: Granular control over specific features
    autoRegister: {
      components: true,   // Auto-register components
      composables: true,  // Auto-register composables
      plugins: true,      // Auto-register plugins
      utils: true,        // Auto-register utils
      shared: true        // Auto-register shared folders
    }
  }
})
```

## License

[MIT License](./LICENSE)