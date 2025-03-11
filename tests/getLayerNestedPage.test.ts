import * as fs from 'node:fs'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

import { getLayerNestedPages } from '../src/getLayerNestedPages'

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
}))

vi.mock('path', async () => {
  const actual = await vi.importActual('path')
  return {
    ...actual,
    join: (...args: fs.Dirent[]) => args.join('/'),
  }
})

describe('Page Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getLayerNestedPages', () => {
    it('should return empty array if pages directory does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const result = getLayerNestedPages('admin', 'app/layers')

      expect(result).toEqual([])
      expect(fs.existsSync).toHaveBeenCalledWith('app/layers/admin/pages')
    })

    it('should return page configs for each vue file in pages directory', () => {
      // Mock directory structure
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readdirSync).mockImplementation((path) => {
        if (path === 'app/layers/admin/pages') {
          return ['users.vue', 'settings', '[id].vue'] as unknown as fs.Dirent[]
        }
        if (path === 'app/layers/admin/pages/settings') {
          return ['index.vue', 'profile.vue'] as unknown as fs.Dirent[]
        }
        return [] as unknown as fs.Dirent[]
      })

      // Mock stat for directories and files
      vi.mocked(fs.statSync).mockImplementation((path) => {
        if (path === 'app/layers/admin/pages/settings') {
          return { isDirectory: vi.fn(() => true) } as unknown as fs.Stats
        }
        return { isDirectory: vi.fn(() => false) } as unknown as fs.Stats
      })

      const result = getLayerNestedPages('admin', 'app/layers')

      // Should find users.vue, [id].vue, and settings/profile.vue settings/index.vue)
      expect(result).toHaveLength(4)

      // Check specific routes
      expect(result).toContainEqual({
        name: 'admin-users',
        path: '/admin/users',
        file: 'app/layers/admin/pages/users.vue',
      })

      expect(result).toContainEqual({
        name: 'admin-id',
        path: '/admin/:id',
        file: 'app/layers/admin/pages/[id].vue',
      })

      expect(result).toContainEqual({
        name: 'admin-settings-profile',
        path: '/admin/settings/profile',
        file: 'app/layers/admin/pages/settings/profile.vue',
      })

      expect(result).toContainEqual({
        name: 'admin-settings-index',
        path: '/admin/settings',
        file: 'app/layers/admin/pages/settings/index.vue',
      })
    })
  })
})
