import makeWASocket, { useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs'
import readline from 'readline'
import path from 'path'
import { pathToFileURL } from 'url'
import { config } from './config.js'
import axios from 'axios'
import { fileURLToPath } from 'url'

const prefix = '.'
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(res => rl.question(q, res))

const R="\x1b[0m", B="\x1b[1m", C="\x1b[36m", G="\x1b[32m", Y="\x1b[33m", Rd="\x1b[31m"
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sessionPath = './src/database/session'

function banner(){
console.log(C+B+`
 ███████████████████████████████████████
 █ STORM CYBER PAIR SYSTEM █
 █ STORM CYBER MD █
 ███████████████████████████████████████
`+R)
console.log(config.BRAND_BOX)
}

function bigBoxCode(code){
  code = code.replace(/-/g,'').toUpperCase()
  console.log(G+B+`
╔════════════════════════════╗
║ YOUR CODE: ${code} ║
╚════════════════════════════╝
`+R)
  console.log(Y+B+` >>> COPY: ${code} <<< `+R)
}

// ==== NEW: SESSION_ID SUPPORT FOR WEBSITE / TELEGRAM ====
async function downloadSession(){
  // Check env first (for Render hosting)
  let SESSION_ID = process.env.SESSION_ID || config.SESSION_ID || ''
  
  if(!SESSION_ID){
    return false // No session id, use old method
  }

  console.log(Y+B+`🔗 Found SESSION_ID, downloading session...`+R)
  
  try{
    // If SESSION_ID starts with STORM~ it's base64
    if(SESSION_ID.startsWith('STORM~')){
      let b64 = SESSION_ID.slice(6)
      let buff = Buffer.from(b64, 'base64')
      fs.mkdirSync(sessionPath, {recursive:true})
      fs.writeFileSync(path.join(sessionPath, 'creds.json'), buff)
      console.log(G+B+'✅ Session restored from SESSION_ID!'+R)
      return true
    }
    
    // If it's a Mega link or Paste link
    if(SESSION_ID.includes('mega.nz') || SESSION_ID.includes('https://')){
      // Example: you can upload creds.json to mega and paste link
      console.log(Y+'Downloading from link...'+R)
      let res = await axios.get(SESSION_ID, { responseType: 'arraybuffer' })
      fs.mkdirSync(sessionPath, {recursive:true})
      fs.writeFileSync(path.join(sessionPath, 'creds.json'), res.data)
      console.log(G+B+'✅ Session downloaded!'+R)
      return true
    }
  }catch(e){
    console.log(Rd+`Failed to download session: ${e.message}`+R)
    console.log(Y+'Continuing with local pairing...'+R)
    return false
  }
  return false
}

async function startBot(){
  banner()

  if(!fs.existsSync(sessionPath)){
    fs.mkdirSync(sessionPath, { recursive: true })
  }

  // Try to load session from SESSION_ID first
  await downloadSession()

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    browser: Browsers.macOS('Chrome'),
    printQRInTerminal: false
  })

  sock.ev.on('creds.update', saveCreds)

  // PAIRING CODE FOR USERS - Only if not registered and no session
  if (!sock.authState.creds.registered) {
    // If running on Render, don't ask, wait for SESSION_ID
    if(process.env.RENDER){
      console.log(Y+B+'\n⚠️ No session! Add SESSION_ID in Render Environment!'+R)
      console.log(Y+'Get SESSION_ID from your Telegram Pair Bot or Website Pair'+R)
    } else {
      let num = await ask(C+B+'📱 Enter number (2567xxxxxxx): '+R)
      num = num.replace(/[^0-9]/g,'')
      if(!num){
        console.log(Rd+'Invalid number'+R)
        return
      }
      console.log(Y+B+'\n⏳ Requesting code...'+R)
      setTimeout(async () => {
        try {
          let code = await sock.requestPairingCode(num)
          bigBoxCode(code)
        } catch (e) {
          console.log(Rd+'Failed: '+e.message+R)
        }
      }, 3000)
    }
  }

  // CONNECTION HANDLER WITH AUTO RESTART
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    if (connection == 'open') {
      console.log(G+B+'\n ✅ CONNECTED! SESSION SAVED! \n'+R)
      console.log(G+` ✅ ${config.BOT_NAME} IS ONLINE FOR USERS - type .menu`+R)
      
      // AUTO CREATE SESSION_ID for user to copy
      try{
        let creds = fs.readFileSync(path.join(sessionPath, 'creds.json'))
        let b64 = Buffer.from(creds).toString('base64')
        let sessionId = 'STORM~' + b64
        console.log(Y+B+'\n🔑 YOUR SESSION_ID (Copy this for Render):'+R)
        console.log(C+sessionId.slice(0,100)+'...'+R)
        console.log(Y+'Full ID saved in session_id.txt'+R)
        fs.writeFileSync('./session_id.txt', sessionId)
      }catch{}
    }

    if (connection == 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      console.log(Y+`Connection closed. Code: ${statusCode}`+R)

      if (statusCode!= DisconnectReason.loggedOut) {
        console.log(Y+'Restarting in 3s...'+R)
        setTimeout(startBot, 3000)
      } else {
        console.log(Rd+'Logged out. Delete src/database/session and run node index.js again.'+R)
        rl.close()
      }
    }
  })

  // LOAD COMMANDS FOR USERS
  const commands = new Map()
  const commandsPath = './src/commands'
  if(!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath, { recursive: true })

  const files = fs.readdirSync(commandsPath)
  for (const f of files) {
    if (!f.endsWith('.js')) continue
    try {
      const fullPath = path.join(process.cwd(), commandsPath, f)
      const mod = await import(pathToFileURL(fullPath).href + '?v=' + Date.now())
      if (mod.default?.name) {
        commands.set(mod.default.name.toLowerCase(), mod.default)
        if(mod.default.alias){
          mod.default.alias.forEach(a=> commands.set(a.toLowerCase(), mod.default))
        }
        console.log(C+`[STORM] Loaded: ${mod.default.name}`+R)
      }
    } catch(e){
      console.log(Rd+`Failed to load ${f}: ${e.message}`+R)
    }
  }

  console.log(G+B+`Loaded ${commands.size} commands - Ready for USERS`+R)

  // MESSAGE HANDLER FOR USERS
  sock.ev.on('messages.upsert', async (m) => {
    try {
      const msg = m.messages[0]
      if (!msg.message) return
      if (msg.key.remoteJid == 'status@broadcast') return
      if (msg.key.fromMe) return

      let body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || ''
      if (!body.startsWith(prefix)) return

      const parts = body.slice(prefix.length).trim().split(/ +/)
      let cmdName = parts[0].toLowerCase()
      let args = parts.slice(1)
      let cmd = commands.get(cmdName)
      if (!cmd) return

      const remoteJid = msg.key.remoteJid

      try {
        await cmd.execute(sock, remoteJid, msg, args)
      } catch (cmdErr) {
        console.error(`[CMD ERROR]`, cmdErr)
        await sock.sendMessage(remoteJid, { text: `${config.BRAND_BOX}\n\n⚠️ Command failed but bot still running.\n${cmdErr.message}` })
      }

    } catch (e) {
      console.error(e)
    }
  })
}

startBot()
