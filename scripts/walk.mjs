import { readdir } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'

/** Every file under the directory, as a relative POSIX path, in the order the file system gives. */
export async function walk(directory, root = directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path, root))
    else files.push(relative(root, path).split(sep).join('/'))
  }
  return files
}
