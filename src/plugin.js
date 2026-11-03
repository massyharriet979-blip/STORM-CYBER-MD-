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
        let url = pathToFileURL(fullPath).href + '?t=' + Date.now()
        mod = await import(url)
        mod = mod.default || mod
      } catch (e) {
        let cjsPath = fullPath + '.cjs'
        try { fs.copyFileSync(fullPath, cjsPath) } catch {}
        mod = require(cjsPath)
        mod = mod.default || mod
        try { fs.unlinkSync(cjsPath) } catch {}
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
