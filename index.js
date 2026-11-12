import { loadCommands as loadCommandFiles, getCommandMap } from './lib/loader.js'
import { createMessageHandler as createSharedMessageHandler } from './lib/handler.js'
import { trackAdmin } from './src/database/admintracker.js';
import { startTelegram } from './telegram/bot.js'
// PairServer disabled
import { handleAntibug } from './whatsapp/antibug.js'
import { handleAntilink } from './whatsapp/antilink.js'
import { handleAntibot } from './whatsapp/antibot.js'
import { handleWelcomeGoodbye } from './whatsapp/welcome.js'
import { handleAntidelete, saveMessageCache } from './whatsapp/antidelete.js'
import { handleAntigroupmention } from './whatsapp/antigroupmention.js'
import { handleAutokick } from './whatsapp/autokick.js'
import { handleAntipromote } from './whatsapp/antipromote.js'
import { handleAntidemote } from './whatsapp/antidemote.js'
import { handleWarnReminder } from './whatsapp/warn.js'
import {
    restoreAutoActions,
    scheduleAutoAction,
    saveAutoMuteSchedule
} from './whatsapp/automute.js';
import {
    activeSessions,
    startSession,
    clearSession,
    getPairingCode,
    resumeSessions,
    hasRegisteredCredentials
} from './whatsapp/pairManager.js';
import makeWASocket, { useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs'
import readline from 'readline'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const require = createRequire(import.meta.url)

const prefix = '.'
const commandFolder = './commands'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(res => rl.question(q, res))
const R="\x1b[0m", B="\x1b[1m", C="\x1b[36m", G="\x1b[32m", Y="\x1b[33m", Rd="\x1b[31m"

if(!fs.existsSync('./src/database/session')) fs.mkdirSync('./src/database/session',{recursive:true})
if(!fs.existsSync('./sessions')) fs.mkdirSync('./sessions',{recursive:true})
if(!fs.existsSync('./database')) fs.mkdirSync('./database',{recursive:true})
if(!fs.existsSync(commandFolder)) fs.mkdirSync(commandFolder,{recursive:true})
if(!fs.existsSync('./assets')) fs.mkdirSync('./assets',{recursive:true})

global.subbots = new Map()
global.subbotOwners = []
global.commands = new Map()
global.sessionMeta = new Map()
global.reconnectTimers = new Map()
function setMeta(n,d){let o=global.sessionMeta.get(n)||{};global.sessionMeta.set(n,{...o,...d})}
function fmtTime(ts){if(!ts) return 'unknown';let d=new Date(ts);return d.toLocaleString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
let startTime = Date.now()
let connectedCount = 0
// FIX: ONE TRUTH - count from activeSessions, not subbots.size
function syncConnectedCount(){
  try{
    let c = 0
    for(let [_, s] of global.activeSessions || []){
      if(s?.connected && s?.sock) c++
    }
    // Fallback: if activeSessions empty but subbots has live, count subbots
    if(c === 0 && global.subbots.size > 0){
      // keep subbots as fallback only when pairManager not yet filled
      c = global.subbots.size
    }
    connectedCount = c
    return connectedCount
  }catch{ return global.subbots.size }
}
function getConnected(){ return syncConnectedCount() }
function runtime(){ let s=Math.floor((Date.now()-startTime)/1000); let d=Math.floor(s/86400); s%=86400; let h=Math.floor(s/3600); s%=3600; let m=Math.floor(s/60); return {d,h,m,s:s%60} }
// FIX: REAL countUsers - only folders with creds.json + registered:true
function countUsers(){
  try{
    return fs.readdirSync('./sessions').filter(d=>{
      try{
        const file='./sessions/'+d+'/creds.json'
        if(!fs.existsSync(file)) return false
        const creds=JSON.parse(fs.readFileSync(file,'utf8'))
        return creds.registered === true
      }catch{ return false }
    }).length
  }catch(e){ console.log('countUsers err', e.message); return 0 }
}
const delay = (ms) => new Promise(r=>setTimeout(r,ms))

function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return text.toLowerCase().split('').map(c=>map[c]||c).join('')
}

function getTgSessionFile(){ return './database/telegram_sessions.json' }
function loadTgSessions(){
 try{ if(!fs.existsSync(getTgSessionFile())) return {}; return JSON.parse(fs.readFileSync(getTgSessionFile())) }catch(e){ console.log('loadTgSessions err', e.message); return {} }
}
function saveTgSession(tgId, number){
 let db=loadTgSessions(); if(!db[tgId]) db[tgId]=[]; if(!db[tgId].includes(number)) db[tgId].push(number);
 fs.mkdirSync('./database',{recursive:true}); fs.writeFileSync(getTgSessionFile(), JSON.stringify(db,null,2));
}

global.scheduleAutoAction = scheduleAutoAction;
global.saveAutoMuteSchedule = saveAutoMuteSchedule;

const _cfgCache = new Map()
function readJsonCached(file, ttlMs = 10000){
  const now = Date.now()
  const hit = _cfgCache.get(file)
  if(hit && (now - hit.t) < ttlMs) return hit.v
  try{
    if(!fs.existsSync(file)){ _cfgCache.set(file,{t:now,v:null}); return null }
    const v = JSON.parse(fs.readFileSync(file))
    _cfgCache.set(file,{t:now,v})
    return v
  }catch(e){ return null }
}

async function loadCommands(){
  await loadCommandFiles()
  global.commands = getCommandMap()

  console.log(C + `Loaded ${global.commands.size} WhatsApp command names and aliases` + R)

  if(global.commands.size === 0) {
    console.log(Rd + 'WARNING: 0 WhatsApp commands loaded' + R)
  }

  return global.commands
}
global.loadCommands = loadCommands
// Shared message handler for the main bot and every subbot.
function createMessageHandler(sock, isSubBotSession = false) {
  return createSharedMessageHandler(sock, isSubBotSession)
}

global.createMessageHandler = createMessageHandler
global.setMeta = setMeta;
global.getConnected = getConnected;
global.countUsers = countUsers;
global.delay = delay;
global.runtime = runtime;
global.fmtTime = fmtTime;

const _pendingOnConnected = new Map()
const subbotHooks = {
  onMessage: (sock) => createMessageHandler(sock, true),
  onGroupUpdate: async (sock, anu, phone) => {
    try{
      await handleWelcomeGoodbye(sock, anu, phone);
      await handleAutokick(sock, anu, phone);
      await handleAntipromote(sock, anu, phone);
      await handleAntidemote(sock, anu, phone);
    }catch(e){ console.log('subbot group update err', e.message) }
  },
  onOpen: async (sock, phone) => {
    setMeta(phone,{connectedAt:Date.now(),pairedAt:global.sessionMeta.get(phone)?.pairedAt||Date.now(),disconnectedAt:null,isConnected:true})
    if(!global.subbots.has(phone)) global.subbots.set(phone, sock)
    if(!global.subbotOwners.includes(phone)) global.subbotOwners.push(phone)
    syncConnectedCount()
    try{ restoreAutoActions(sock, phone) }catch(e){ console.log('subbot restoreAutoActions err', e.message) }
    const cb = _pendingOnConnected.get(phone)
    if(cb){ _pendingOnConnected.delete(phone); try{ await cb() }catch(e){ console.log('pair onConnected err', e.message) } }
  },
  onLoggedOut: async (phone) => {
    // FIX: KEEP folder, KEEP activeSessions entry. Only mark disconnected.
    // pairManager.js already sets connected:false + disconnectedAt.
    // We only clean subbots map, NOT sessions/ folder.
    if(global.subbots.has(phone)){ global.subbots.delete(phone); syncConnectedCount() }
    setMeta(phone,{disconnectedAt:Date.now(),isConnected:false})
    console.log(Rd+`❌ SUBBOT ${phone} logged out - FOLDER KEPT, use /disconnect to delete`+R)
  },
  onPairingInterrupted: async (phone) => {
    setMeta(phone,{disconnectedAt:Date.now(),isConnected:false})
  }
}
global.subbotHooks = subbotHooks
global.activeSessions = activeSessions
global.clearSession = clearSession
global.hasRegisteredCredentials = hasRegisteredCredentials
global.startSession = startSession
global.getPairingCode = getPairingCode

let mainRetries = 0
let mainReconnectTimer = null

async function startSubBotSession(phoneNumber){
  global.startSubBotSession = startSubBotSession
  const id = String(phoneNumber).replace(/[^0-9]/g,'')
  return startSession(id, null, false, subbotHooks)
}

global.requestPairFromEngine = async (number, { onConnected } = {}) => {
  const id = String(number).replace(/[^0-9]/g,'')
  if(global.subbots.has(id)) throw new Error('already connected')
  // FIX: Check real activeSessions first, not only subbots
  if(activeSessions.get(id)?.connected && activeSessions.get(id)?.sock) throw new Error('already connected')
  if(hasRegisteredCredentials(id)) throw new Error('already registered')
  if(typeof onConnected === 'function') _pendingOnConnected.set(id, onConnected)
  try{
    const sock = await startSession(id, null, false, subbotHooks)
    if(sock?.user?.id || activeSessions.get(id)?.connected) throw new Error('already connected')
    const code = await getPairingCode(sock, id)
    setMeta(id,{pairedAt:Date.now(),isConnected:false})
    return code
  }catch(e){
    _pendingOnConnected.delete(id)
    throw e
  }
}

async function startAllSubBots(){
  global.startAllSubBots = startAllSubBots
  await resumeSessions(subbotHooks)
}

async function startWhatsApp(){
  console.log(C+B+`\n █ STORM CYBER MD - WHATSAPP BOT █\n`+R)
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState('./src/database/session')
  const sock = makeWASocket({
    version, logger:pino({level:'silent'}),
    auth:{creds:state.creds, keys:makeCacheableSignalKeyStore(state.keys,pino({level:'silent'}))},
    browser:Browsers.ubuntu('Chrome'), printQRInTerminal:false, syncFullHistory:false, markOnlineOnConnect:false,
    connectTimeoutMs:60000, keepAliveIntervalMs:15000, defaultQueryTimeoutMs:60000
  })
  sock.ev.on('creds.update', saveCreds)
  if(!state.creds.registered){
    let num=(process.env.MAIN_NUMBER||'').replace(/[^0-9]/g,'')
    if(!num){
      if(process.stdin.isTTY){ num=await ask(C+B+'📱 Enter main bot number (2567xxxxxxx): '+R); num=num.replace(/[^0-9]/g,'') }
      else { console.log(Y+'Set MAIN_NUMBER in Railway'+R); await delay(10000); return startWhatsApp() }
    }
    if(num){
      console.log(Y+'⏳ Requesting pairing code for '+num+'...'+R)
      await delay(4000)
      try{ let code; try{code=await sock.requestPairingCode(num)}catch{ await delay(3000); code=await sock.requestPairingCode(num) } console.log(G+B+`\n CODE FOR ${num}: ${code} \n`+R) }catch(e){ console.log(Rd+e.message+R) }
    }
  }
  sock.ev.on('connection.update', u=>{
    if(u.connection==='open'){
      mainRetries = 0
      if(mainReconnectTimer){ clearTimeout(mainReconnectTimer); mainReconnectTimer = null }
      console.log(G+B+'\n✅ WHATSAPP BOT CONNECTED!\n'+R); try{rl.close()}catch(e){ console.log('rl close err', e.message) }
      try{
        let botId=sock.user.id.split(':')[0];
        restoreAutoActions(sock, botId);
      }catch(e){ console.log('main restoreAutoActions err', e.message) }
    }
    if(u.connection==='close'){
      const statusCode = u.lastDisconnect?.error?.output?.statusCode
      const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401
      console.log(Rd+`WhatsApp closed code:${statusCode} loggedOut:${isLoggedOut} retries:${mainRetries}`+R)
      if(isLoggedOut){
        console.log(Rd+'Main session logged out, need re-pair. Delete ./src/database/session'+R)
        return
      }
      mainRetries++
      if(mainRetries > 20){
        console.log(Rd+'Max retries 20 reached, stopping restart. Restart manually'+R)
        return
      }
      let backoff = Math.min(3000 * mainRetries, 30000)
      console.log(Y+`Restarting in ${backoff/1000}s...`+R)
      if(mainReconnectTimer) clearTimeout(mainReconnectTimer)
      mainReconnectTimer = setTimeout(startWhatsApp, backoff)
    }
  })
  console.log(C+`Loaded ${global.commands.size} WhatsApp commands`+R)
  sock.ev.on('messages.upsert', createMessageHandler(sock, false))
  sock.ev.on('group-participants.update', async (anu)=>{
   try{
    let botId=sock.user.id.split(':')[0];
    await handleWelcomeGoodbye(sock, anu, botId);
    await handleAutokick(sock, anu, botId);
    await handleAntipromote(sock, anu, botId);
    await handleAntidemote(sock, anu, botId);
   }catch(e){ console.log('group update err', e.message) }
  });
  await delay(3000)
  startAllSubBots()
}
async function safeStart(){
  await loadCommands()
  try{ await startTelegram() }catch(e){ console.log(Rd+'Telegram start failed: '+e.message+R) }
// PairServer disabled
  try{ await startWhatsApp() }catch(e){ console.log(Rd+'WhatsApp start failed: '+e.message+R); setTimeout(startWhatsApp,5000) }
}
safeStart()
