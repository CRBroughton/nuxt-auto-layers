import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Helper function to recursively find .vue files
 */
export function findVueFiles(dir: string) {
  let results: string[] = []
  const list = readdirSync(dir)

  list.forEach((file) => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    console.log(file)

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
