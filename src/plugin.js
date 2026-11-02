import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

let dir = "src/commands"
let plugins = []

export async function loadPlugins() {
  plugins = []
  if (!fs.existsSync(dir)) {
    console.log(`plugin dir not found: ${dir}`)
    return plugins
  }
  let files = fs.readdirSync(dir).filter(f => f.endsWith('.js'))
  for (let file of files) {
    let full = path.join(dir, file)
    let fullPath = path.resolve(full)
    try {
      let mod
      try {
        // try ESM import
        let url = pathToFileURL(fullPath).href + '?t=' + Date.now()
        mod = await import(url)
        mod = mod.default || mod
      } catch (e) {
        // fallback to CJS require for old commands like yts.js, vv.js, song.js
        mod = require(fullPath)
        mod = mod.default || mod
      }
      if (mod) {
        plugins.push(mod)
        console.log(`loaded ${file}`)
      }
    } catch (e) {
      console.log(`Failed ${file}: ${e.message}`)
    }
  }
  console.log(`Loaded ${plugins.length} WhatsApp commands`)
  return plugins
}

await loadPlugins()

export default plugins
