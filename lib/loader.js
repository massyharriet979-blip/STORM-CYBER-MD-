import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const COMMANDS_DIR = path.join(__dirname, '../commands')
const require = createRequire(import.meta.url)

const commands = new Map()
const plugins = new Map()
const categories = new Map()

const SKIP_TELEGRAM = new Set([
  'session.js',
  'disconnect.js',
  'list.js',
  'users.js'
])

function walk(dir) {
  let files = []

  if (!fs.existsSync(dir)) return files

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
    } else if (
      (entry.name.endsWith('.js') || entry.name.endsWith('.cjs')) &&
      !SKIP_TELEGRAM.has(entry.name)
    ) {
      files.push(fullPath)
    }
  }

  return files
}

function registerAlias(alias, plugin, file) {
  const name = String(alias || '').toLowerCase().trim()

  if (!name) return

  // Match the old loader: later aliases replace earlier ones.
  commands.set(name, plugin)
}

async function importCommand(file) {
  if (file.endsWith('.cjs')) {
    try {
      delete require.cache[require.resolve(file)]
    } catch {}

    return require(file)
  }

  return import(
    `${pathToFileURL(file).href}?t=${Date.now()}`
  )
}

export async function loadCommands() {
  commands.clear()
  plugins.clear()
  categories.clear()

  let loaded = 0
  let failed = 0

  const files = walk(COMMANDS_DIR)

  for (const file of files) {
    try {
      const mod = await importCommand(file)

      const exported = mod?.default || mod
      const list = Array.isArray(exported) ? exported : [exported]

      for (const plugin of list) {
        if (
          !plugin ||
          typeof plugin !== 'object' ||
          !plugin.name ||
          typeof plugin.execute !== 'function'
        ) {
          continue
        }

        const name = String(plugin.name).toLowerCase().trim()

        if (!name) continue

        // Match the old loader: later commands replace earlier ones.
        plugin.desc = plugin.desc || plugin.description || 'Storm command'

        commands.set(name, plugin)
        plugins.set(name, plugin)

        const aliases = [
          ...(Array.isArray(plugin.aliases) ? plugin.aliases : []),
          ...(Array.isArray(plugin.alias) ? plugin.alias : [])
        ]

        for (const alias of aliases) {
          registerAlias(alias, plugin, file)
        }

        const category =
          plugin.category ||
          path.basename(path.dirname(file)) ||
          'general'

        if (!categories.has(category)) {
          categories.set(category, [])
        }

        categories.get(category).push(plugin)

        loaded++
      }
    } catch (error) {
      failed++
      console.error(
        `[Loader] Failed ${path.basename(file)}:`,
        error.message
      )
    }
  }

  console.log(`[Loader] Loaded ${loaded} WhatsApp commands`)
  console.log(`[Loader] Registered ${commands.size} command names and aliases`)

  if (failed) {
    console.log(`[Loader] Failed files: ${failed}`)
  }

  return loaded
}

export function getCommand(name) {
  return commands.get(String(name || '').toLowerCase().trim())
}

export function getAllCommands() {
  return plugins
}

export function getCommandMap() {
  return commands
}

export function getCategories() {
  return categories
}

export function reloadCommands() {
  return loadCommands()
}

export default loadCommands
