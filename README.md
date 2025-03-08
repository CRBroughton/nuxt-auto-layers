# nuxt-auto-layers

> 🚀 Automatically discover and extend Nuxt layers with zero configuration

This module automatically detects all layers within your project and sets up the necessary configuration without you having to manually declare each layer.

## Features

- ✅ **Auto-discovery**: Automatically finds all layers in your project
- ✅ **Zero configuration**: Works out of the box with sensible defaults
- ✅ **Fully customizable**: Configure directory paths if needed

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
  ]
})
```

That's it! The module will automatically discover all directories in `app/layers` and add them as Nuxt layers.

## How It Works

This module scans your project for directories within the `app/layers` folder (configurable) and automatically adds them to the `extends` array in your Nuxt configuration.

### Directory Structure

By default, the module expects your layers to be in the `app/layers` directory:

```
your-project/
├── app/
│   ├── layers/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   ├── composables/
│   │   │   ├── index.vue <- required
│   │   │   └── ... other Nuxt directories
│   │   ├── shop/
│   │   │   ├── components/
│   │   │   ├── composables/
│   │   │   ├── index.vue <- required
│   │   │   └── ... other Nuxt directories
```

Each directory under `app/layers` becomes a Nuxt layer, allowing you to organise your application into modular, self-contained pieces.

## Configuration

You can customise the behavior of this module in your `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  modules: [
    '@crbroughton/nuxt-auto-layers'
  ],
  autoLayers: {
    // Custom directory for layers (default: 'app/layers')
    layersDir: 'custom/path/to/layers'
  }
})
```

## License

[MIT License](./LICENSE)