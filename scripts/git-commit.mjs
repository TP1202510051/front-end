import { execFileSync } from 'node:child_process'

/** The commit of the tree the script runs in, or `unknown` outside a checkout. */
export function gitCommit() {
  try { return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() } catch { return 'unknown' }
}
