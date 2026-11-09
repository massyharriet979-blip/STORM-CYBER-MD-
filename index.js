import { trackAdmin } from './src/database/admintracker.js';
import { startTelegram } from './src/telegram/bot.js'
import { startPairServer } from './src/web/pairServer.js'
import { handleAntibug } from './src/whatsapp/antibug.js'
import { handleAntilink } from './src/whatsapp/antilink.js'
import { handleAntibot } from './src/whatsapp/antibot.js'
import { handleWelcomeGoodbye } from './src/whatsapp/welcome.js'
import { handleAntidelete, saveMessageCache } from './src/whatsapp/antidelete.js'
import { handleAntigroupmention } from './src/whatsapp/antigroupmention.js'
import { handleAutokick } from './src/whatsapp/autokick.js'
import { handleAntipromote } from './src/whatsapp/antipromote.js'
import { handleAntidemote } from './src/whatsapp/antidemote.js'
import { handleWarnReminder } from './src/whatsapp/warn.js'
import {
    restoreAutoActions,
    scheduleAutoAction,
    saveAutoMuteSchedule
} from './src/whatsapp/automute.js';
import {
    activeSessions,
    startSession,
    clearSession,
    getPairingCode,
    resumeSessions,
    hasRegisteredCredentials
} from './src/whatsapp/pairManager.js';
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
const commandFolder = './src/commands'

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
function syncConnectedCount(){ connectedCount = Math.max(0, global.subbots.size); return connectedCount }
function getConnected(){ return syncConnectedCount() }
function runtime(){ let s=Math.floor((Date.now()-startTime)/1000); let d=Math.floor(s/86400); s%=86400; let h=Math.floor(s/3600); s%=3600; let m=Math.floor(s/60); return {d,h,m,s:s%60} }
function countUsers(){ try{return fs.readdirSync('./sessions').length}catch(e){ console.log('countUsers err', e.message); return 0} }
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

// FIXED: cache prefix/mode/sudo so we don't read disk on every message
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

// FIXED: ESM project - .js files MUST use await import(), .cjs files use require()
async function loadCommands(){
  global.commands.clear()
  let failed = []
  const walk = (dir) => {
    let out = []
    try{
      for(const e of fs.readdirSync(dir, { withFileTypes: true })){
        const full = path.join(dir, e.name)
        if(e.isDirectory()) out.push(...walk(full))
        else if(e.name.endsWith('.js') || e.name.endsWith('.cjs')) out.push(full)
      }
    }catch{}
    return out
  }
  try{
    const files = walk(path.join(__dirname, commandFolder))
    for(const full of files){
      const f = path.basename(full)
      try{
        let mod = null
        if(f.endsWith('.cjs')){
          try{ delete require.cache[require.resolve(full)] }catch{}
          mod = require(full)
        }else{
          const url = pathToFileURL(full).href + `?t=${Date.now()}-${Math.random()}`
          mod = await import(url)
        }
        const cmd = mod?.default || mod
        if(cmd?.name && typeof cmd.execute === 'function'){
          global.commands.set(String(cmd.name).toLowerCase(), cmd)
          if(Array.isArray(cmd.aliases)) cmd.aliases.forEach(a=>global.commands.set(String(a).toLowerCase(), cmd))
          else if(Array.isArray(cmd.alias)) cmd.alias.forEach(a=>global.commands.set(String(a).toLowerCase(), cmd))
        } else {
          failed.push(`${f}: no name/execute`)
        }
      }catch(e){ failed.push(`${f}: ${e.message}`) }
    }
  }catch(e){ console.log('Command load error '+e.message) }
  console.log(C+`Loaded ${global.commands.size} WhatsApp commands`+R)
  if(failed.length) console.log(Y+`Failed ${failed.length} commands: ${failed.slice(0,10).join(' | ')}`+R)
  if(global.commands.size === 0) console.log(Rd+`⚠️ 0 COMMANDS LOADED - check src/commands/ format!`+R)
  return global.commands
}
global.loadCommands = loadCommands

function createMessageHandler(sock, isSubBotSession = false){
  const msgCache = new Map()
  return async ({messages})=>{
    // FIXED: run messages in parallel, don't let one slow .menu block others
    for(const msg of messages){
      handleOneMessage(sock, msg, isSubBotSession, msgCache).catch(e=>console.log('upsert per-msg error', e.message))
    }
  }
}

async function handleOneMessage(sock, msg, isSubBotSession, msgCache){
      try{
        if(!msg.message) return
        if(msg.key.remoteJid=='status@broadcast') return
        let remoteJid=msg.key.remoteJid
        let isGroup=remoteJid.endsWith('@g.us')
        let sender=isGroup? (msg.key.participant || msg.participant || remoteJid) : (msg.key.remoteJid)
        if(msg.key.fromMe){
          sender = sock.user?.id?.split(':')[0]+'@s.whatsapp.net'
        }
        let senderNum=sender.split('@')[0]
        let botIdNum=(sock.user?.id?.split(':')[0].split('@')[0])||""

        const delHandled = await handleAntidelete(sock, msg, remoteJid, botIdNum, msgCache)
        if(delHandled) return
        await saveMessageCache(msg, remoteJid, sender, msgCache, sock)

        // FIXED: use cache, no readFileSync every message
        let dynamicPrefix=prefix
        try{
          let j = readJsonCached(`./database/prefix_${botIdNum}.json`)
          if(j?.prefix) dynamicPrefix=j.prefix
        }catch(e){ console.log('prefix load err', e.message) }
        let mode="public"
        try{
          let j = readJsonCached(`./database/mode_${botIdNum}.json`)
          if(j){
            if(j.mode) mode=j.mode
            else if(typeof j==="string") mode=j
          } else if(!isSubBotSession){
            let alt = readJsonCached('./src/database/mode.json')
            if(alt){
              if(typeof alt==="string") mode=alt
              else if(alt.mode) mode=alt.mode
            }
          }
        }catch(e){ console.log('mode load err', e.message) }
        if(mode==="self" || mode==="inbox"){
          if(senderNum!==botIdNum) return
        }
        if(mode==="private"){
          let sudoList=[]
          try{
            let a = readJsonCached(`./database/sudo_${botIdNum}.json`)
            if(Array.isArray(a)) sudoList=[...sudoList,...a]
            else if(a?.sudo) sudoList=[...sudoList,...a.sudo]
            let g = readJsonCached('./database/sudo.json')
            if(Array.isArray(g)) sudoList=[...sudoList,...g]
            else if(g?.sudo) sudoList=[...sudoList,...g.sudo]
            let s2 = readJsonCached('./src/database/sudo.json')
            if(Array.isArray(s2)) sudoList=[...sudoList,...s2]
          }catch(e){ console.log('sudo load err', e.message) }
          let isSudo=sudoList.includes(senderNum) || sudoList.includes(sender) || sudoList.includes(senderNum+"@s.whatsapp.net")
          if(senderNum!==botIdNum &&!isSudo) return
        }
        // FIXED: don't await 1200ms delay, just fire typing and continue
        try{
          let at = readJsonCached(`./database/autotyping_${botIdNum}.json`)
          if(at?.enabled){
            if(!(global.ghostMode && isSubBotSession)){
              sock.sendPresenceUpdate('composing', remoteJid).catch(()=>{})
            }
          }
        }catch(e){ console.log('autotyping err', e.message) }
        let body=msg.message.conversation||msg.message.extendedTextMessage?.text||msg.message.imageMessage?.caption||msg.message.videoMessage?.caption||''

        try{
          let mForTrack = {
            chat: remoteJid,
            sender: sender,
            isGroup: isGroup,
            body: body,
            type: Object.keys(msg.message)[0]
          };
          trackAdmin(mForTrack);
        }catch(e){ console.log('trackAdmin err', e.message) }

        if(isGroup){
          await handleAntibot(sock, remoteJid, sender, body, botIdNum)
        }
        if(isGroup){
          await handleAntigroupmention(sock, remoteJid, sender, body, botIdNum, msg, isGroup)
        }
        if(isGroup){
          const handled = await handleAntilink(sock, remoteJid, sender, body, botIdNum, msg)
          if(handled) return
        }
        if(isGroup){
          const bugHandled = await handleAntibug(sock, remoteJid, sender, body, botIdNum, msg, dynamicPrefix)
          if(bugHandled) return
        }
        if(isGroup){
          await handleWarnReminder(sock, remoteJid, sender, body, botIdNum, msg, dynamicPrefix, isGroup)
        }

        if(!body) return
        if(!body.startsWith(dynamicPrefix)) return
        let args=body.slice(dynamicPrefix.length).trim().split(/ +/)
        let name=args.shift().toLowerCase()
        let cmd=global.commands.get(name)
        if(!cmd){ console.log(`[CMD] Unknown: .${name} from ${senderNum} | loaded=${global.commands.size} | mode=${mode} | prefix=${dynamicPrefix}`); return }
        let mObj={}
        mObj.key=msg.key
        mObj.chat=remoteJid
        mObj.sender=sender
        mObj.isGroup=isGroup
        mObj.pushName=msg.pushName||""
        mObj.mentionedJid=msg.message.extendedTextMessage?.contextInfo?.mentionedJid||[]
        mObj.mtype=Object.keys(msg.message)[0]
        mObj.isSubBot = isSubBotSession
        mObj.isSubBotOwner = isSubBotSession && (senderNum === botIdNum)
        mObj.isOwner = (senderNum === botIdNum)
        mObj.botNumber = botIdNum
        mObj.senderNum = senderNum
        let ctxInfo=msg.message.extendedTextMessage?.contextInfo || msg.message.imageMessage?.contextInfo || msg.message.videoMessage?.contextInfo
        if(ctxInfo && ctxInfo.quotedMessage){
          mObj.quoted={}
          mObj.quoted.message=ctxInfo.quotedMessage
          mObj.quoted.key={id:ctxInfo.stanzaId, remoteJid:remoteJid, participant:ctxInfo.participant}
          mObj.quoted.sender=ctxInfo.participant||remoteJid
          mObj.quoted.participant=ctxInfo.participant
          mObj.quoted.pushName=""
          mObj.quoted.mtype=Object.keys(ctxInfo.quotedMessage)[0]
          mObj.quoted.msg=mObj.quoted.message[mObj.quoted.mtype]
        }
        console.log(`[CMD] .${name} from ${senderNum} on ${isSubBotSession?'SUBBOT':'MAIN'} ${botIdNum}`)
        // FIXED: don't await here - fire and return, so next message isn't blocked
        cmd.execute(sock,mObj,args).catch(e=>console.log('cmd error', name, e.message))
      }catch(e){
        console.log('upsert per-msg error', e.message)
        return
      }
}

global.createMessageHandler = createMessageHandler;
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
    if(global.subbots.has(phone)){ global.subbots.delete(phone); syncConnectedCount() }
    setMeta(phone,{disconnectedAt:Date.now(),isConnected:false})
    console.log(Rd+`❌ SUBBOT ${phone} logged out`+R)
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
  try{ await startPairServer() }catch(e){ console.log(Rd+'PairServer start failed: '+e.message+R) }
  try{ await startWhatsApp() }catch(e){ console.log(Rd+'WhatsApp start failed: '+e.message+R); setTimeout(startWhatsApp,5000) }
}
safeStart()
