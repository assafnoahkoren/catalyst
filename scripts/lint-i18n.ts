/**
 * Lint rule: no hardcoded text in JSX.
 * Scans .tsx files for string literals inside JSX elements.
 * Allows: {t('key')}, {variable}, className, etc.
 * Catches: <div>Hardcoded text</div>, <button>Click me</button>
 *
 * Usage: bun run scripts/lint-i18n.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const SCAN_DIRS = ['apps/web/src']
const IGNORE_PATTERNS = [/\.gen\.ts$/, /\.d\.ts$/, /node_modules/]

// Match text content between JSX tags: >some text<
// Ignores whitespace-only, {expressions}, and common non-text patterns
const JSX_TEXT_REGEX = />([^<{}\n]+)</g
const ALLOWED_PATTERNS = [
  /^\s*$/, // whitespace only
  /^[•·\-|/\\:;.,!?&=+*#@()[\]{}'"` ]+$/, // punctuation/symbols only
  /^\s*\d+\s*$/, // numbers only
]

function findTsxFiles(dir: string): string[] {
  const { globSync } = require('fs')
  // Use Bun.glob or simple approach
  const results: string[] = []
  const entries = require('fs').readdirSync(dir, { withFileTypes: true, recursive: true })
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const fullPath = join(entry.parentPath ?? entry.path, entry.name)
    if (!fullPath.endsWith('.tsx')) continue
    if (IGNORE_PATTERNS.some((p) => p.test(fullPath))) continue
    results.push(fullPath)
  }
  return results
}

let errors = 0

for (const dir of SCAN_DIRS) {
  const files = findTsxFiles(dir)

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      let match: RegExpExecArray | null

      JSX_TEXT_REGEX.lastIndex = 0
      while ((match = JSX_TEXT_REGEX.exec(line)) !== null) {
        const text = match[1]!.trim()
        if (!text) continue
        if (ALLOWED_PATTERNS.some((p) => p.test(text))) continue
        // Skip if it looks like it's inside a prop value
        if (/=\s*['"]/.test(line.slice(0, match.index))) continue

        console.error(`  ${file}:${i + 1}  Hardcoded text in JSX: "${text}"`)
        console.error(`    Use t('translationKey') from @catalyst/i18n instead.\n`)
        errors++
      }
    }
  }
}

if (errors > 0) {
  console.error(`\nFound ${errors} hardcoded string(s) in JSX. Use t() from @catalyst/i18n.\n`)
  process.exit(1)
} else {
  console.log('No hardcoded JSX strings found.')
}
