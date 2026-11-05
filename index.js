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
import makeWASocket, { useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs'
import readline from 'readline'

const prefix = '.'
const commandFolder = './src/commands'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(res => rl.question(q, res))
const R="\x1b[0m", B="\x1b[1m", C="\x1b[36m", G="\x1b[32m", Y="\x1b[33m", Rd="\x1b[31m"

if(!fs.existsSync('./src/database/session')) fs.mkdirSync('./src/database/session',{recursive:true})
if(!fs.existsSync('./sessions')) fs.mkdirSync('./sessions',{recursive:true})
if(!fs.existsSync('./database')) fs.mkdirSync('./database',{recursive:true})
if(!fs.existsSync(commandFolder)) fs.mkdirSync(commandFolder,{recursive:true})

global.subbots = new Map()
global.subbotOwners = []
global.commands = new Map()
global.pairingInProgress = new Set()
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

function createMessageHandler(sock, isSubBotSession = false){
  const msgCache = new Map()
  return async ({messages})=>{
    for(const msg of messages){
      try{
        if(!msg.message) continue
        if(msg.key.remoteJid=='status@broadcast') continue
        let remoteJid=msg.key.remoteJid
        let isGroup=remoteJid.endsWith('@g.us')
        let sender=isGroup? (msg.key.participant || msg.participant || remoteJid) : (msg.key.remoteJid)
        if(msg.key.fromMe){
          sender = sock.user.id.split(':')[0]+'@s.whatsapp.net'
        }
        let senderNum=sender.split('@')[0]
        let botIdNum=(sock.user?.id?.split(':')[0].split('@')[0])||""

        const delHandled = await handleAntidelete(sock, msg, remoteJid, botIdNum, msgCache)
        if(delHandled) continue
        await saveMessageCache(msg, remoteJid, sender, msgCache, sock)

        let dynamicPrefix=prefix
        try{
          let pFile=`./database/prefix_${botIdNum}.json`
          if(fs.existsSync(pFile)){
            let j=JSON.parse(fs.readFileSync(pFile))
            if(j.prefix) dynamicPrefix=j.prefix
          }
        }catch(e){ console.log('prefix load err', e.message) }
        let mode="public"
        try{
          let mFile=`./database/mode_${botIdNum}.json`
          if(fs.existsSync(mFile)){
            let j=JSON.parse(fs.readFileSync(mFile))
            if(j.mode) mode=j.mode
            else if(typeof j==="string") mode=j
          } else if(!isSubBotSession){
            let altPath='./src/database/mode.json'
            if(fs.existsSync(altPath)){
              try{
                let alt=JSON.parse(fs.readFileSync(altPath))
                if(typeof alt==="string") mode=alt
                else if(alt.mode) mode=alt.mode
              }catch(e){ console.log('alt mode err', e.message) }
            }
          }
        }catch(e){ console.log('mode load err', e.message) }
        if(mode==="self" || mode==="inbox"){
          if(senderNum!==botIdNum) continue
        }
        if(mode==="private"){
          let sudoList=[]
          try{
            if(fs.existsSync(`./database/sudo_${botIdNum}.json`)) sudoList=JSON.parse(fs.readFileSync(`./database/sudo_${botIdNum}.json`))
            if(fs.existsSync('./database/sudo.json')){
              let g=JSON.parse(fs.readFileSync('./database/sudo.json'))
              if(Array.isArray(g)) sudoList=[...sudoList,...g]
              else if(g.sudo) sudoList=[...sudoList,...g.sudo]
            }
            if(fs.existsSync('./src/database/sudo.json')){
              let g=JSON.parse(fs.readFileSync('./src/database/sudo.json'))
              if(Array.isArray(g)) sudoList=[...sudoList,...g]
            }
          }catch(e){ console.log('sudo load err', e.message) }
          let isSudo=sudoList.includes(senderNum) || sudoList.includes(sender) || sudoList.includes(senderNum+"@s.whatsapp.net")
          if(senderNum!==botIdNum &&!isSudo) continue
        }
        try{
          let atFile=`./database/autotyping_${botIdNum}.json`
          if(fs.existsSync(atFile)){
            let at=JSON.parse(fs.readFileSync(atFile))
            if(at.enabled){
              if(!(global.ghostMode && isSubBotSession)){
                await sock.sendPresenceUpdate('composing', remoteJid)
                await delay(1200)
              }
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
          if(handled) continue
        }
        if(isGroup){
          const bugHandled = await handleAntibug(sock, remoteJid, sender, body, botIdNum, msg, dynamicPrefix)
          if(bugHandled) continue
        }
        if(isGroup){
          await handleWarnReminder(sock, remoteJid, sender, body, botIdNum, msg, dynamicPrefix, isGroup)
        }

        if(!body) continue
        if(!body.startsWith(dynamicPrefix)) continue
        let args=body.slice(dynamicPrefix.length).trim().split(/ +/)
        let name=args.shift().toLowerCase()
        let cmd=global.commands.get(name)
        if(!cmd) continue
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
        await cmd.execute(sock,mObj,args)
      }catch(e){
        console.log('upsert per-msg error', e.message)
        continue
      }
    }
  }
}

global.createMessageHandler = createMessageHandler;
global.setMeta = setMeta;
global.getConnected = getConnected;
global.countUsers = countUsers;
global.delay = delay;
global.runtime = runtime;
global.fmtTime = fmtTime;

let mainRetries = 0
let mainReconnectTimer = null
async function startSubBotSession(phoneNumber){
  global.startSubBotSession = startSubBotSession
  try{
    const id = phoneNumber.replace(/[^0-9]/g,'')
    if(global.subbots.has(id)) return
    if(global.pairingInProgress.has(id)) return
    const sessionPath = `./sessions/${id}`
    if(!fs.existsSync(sessionPath)) return
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    // FIX: never auto-start an un-registered folder. That folder is still pairing.
    // Starting it here would create a 2nd socket for same number and kill the code.
    if(!state.creds.registered) return
    const { version } = await fetchLatestBaileysVersion()
    const sock = makeWASocket({
      version, logger:pino({level:'silent'}),
      auth:{creds:state.creds, keys:makeCacheableSignalKeyStore(state.keys,pino({level:'silent'}))},
      browser:Browsers.ubuntu('Chrome'),
      printQRInTerminal:false, syncFullHistory:false, markOnlineOnConnect:false,
      connectTimeoutMs:60000, keepAliveIntervalMs:15000
    })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (u)=>{
      if(u.connection==='open'){
        if(global.reconnectTimers.has(id)){
          clearTimeout(global.reconnectTimers.get(id))
          global.reconnectTimers.delete(id)
        }
        setMeta(id,{connectedAt:Date.now(),pairedAt:global.sessionMeta.get(id)?.pairedAt||Date.now(),disconnectedAt:null,isConnected:true})
        console.log(G+`✅ SUBBOT ${id} CONNECTED`+R)
        if(!global.subbots.has(id)) global.subbots.set(id, sock)
        if(!global.subbotOwners.includes(id)) global.subbotOwners.push(id)
        syncConnectedCount()
        try{
          restoreAutoActions(sock, id);
        }catch(e){ console.log('subbot restoreAutoActions err', e.message) }
      }
      if(u.connection==='close'){
        const statusCode = u.lastDisconnect?.error?.output?.statusCode
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401
        if(global.subbots.has(id)){ global.subbots.delete(id); syncConnectedCount() }
        setMeta(id,{disconnectedAt:Date.now(),isConnected:false})
        console.log(Y+`⚠️ SUBBOT ${id} CLOSED code:${statusCode} loggedOut:${isLoggedOut}`+R)
        if(isLoggedOut){
          console.log(Rd+`❌ SUBBOT ${id} logged out, not retrying. Delete ./sessions/${id} to re-pair`+R)
          if(global.reconnectTimers.has(id)){
            clearTimeout(global.reconnectTimers.get(id))
            global.reconnectTimers.delete(id)
          }
          return
        }
        if(global.reconnectTimers.has(id)) return
        let timer = setTimeout(()=>{ global.reconnectTimers.delete(id); startSubBotSession(id) },5000)
        global.reconnectTimers.set(id, timer)
      }
    })
    sock.ev.on('messages.upsert', createMessageHandler(sock, true))
    sock.ev.on('group-participants.update', async (anu)=>{
     try{
      await handleWelcomeGoodbye(sock, anu, id);
      await handleAutokick(sock, anu, id);
      await handleAntipromote(sock, anu, id);
      await handleAntidemote(sock, anu, id);
     }catch(e){ console.log('subbot group update err', e.message) }
    });

  }catch(e){ console.log('subbot start error',e.message) }
}

// ENGINE ONLY - called by Telegram helper (bot.js). Telegram never creates socket.
// FIX: Engine OWNS pairingInProgress. bot.js never adds/deletes it.
global.requestPairFromEngine = async (number, { onConnected } = {}) => {
  const id = String(number).replace(/[^0-9]/g,'')
  if(global.subbots.has(id)) throw new Error('already connected')
  if(global.pairingInProgress.has(id)) throw new Error('already pairing')
  global.pairingInProgress.add(id)

  const sessionPath = `./sessions/${id}`
  let opened = false
  let pairingTimeout = null
  let sock = null
  let cleaned = false
  const cleanup = () => {
    if(cleaned) return
    cleaned = true
    global.pairingInProgress.delete(id)
    if(pairingTimeout) clearTimeout(pairingTimeout)
  }

  try{
    // FIX: validate creds BEFORE reusing. Stale half-registered creds = WhatsApp rejects code.
    try{
      const oldFile = sessionPath+'/creds.json'
      if(fs.existsSync(oldFile)){
        const oc = JSON.parse(fs.readFileSync(oldFile,'utf8'))
        if(oc.registered) throw new Error('already registered')
        fs.rmSync(sessionPath, {recursive:true, force:true})
        console.log('CLEANED STALE SESSION FOR', id)
      }
    }catch(e){
      if(e.message === 'already registered') throw e
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    if(state.creds.registered) throw new Error('already registered')

    const { version } = await fetchLatestBaileysVersion()
    sock = makeWASocket({
      version, logger:pino({level:'silent'}),
      auth:{creds:state.creds, keys:makeCacheableSignalKeyStore(state.keys,pino({level:'silent'}))},
      // FIX: ONE browser everywhere - was macOS here, ubuntu elsewhere. Now ubuntu Chrome everywhere.
      browser: Browsers.ubuntu('Chrome'),
      printQRInTerminal:false, syncFullHistory:false, markOnlineOnConnect:false,
      connectTimeoutMs:60000, keepAliveIntervalMs:15000, defaultQueryTimeoutMs:60000, emitOwnEvents:false, generateHighQualityLinkPreview:false
    })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', async (u)=>{
      if(u.connection === 'open'){
        if(opened) return
        opened = true
        cleanup()
        if(global.reconnectTimers.has(id)){ clearTimeout(global.reconnectTimers.get(id)); global.reconnectTimers.delete(id) }
        if(!global.subbots.has(id)) global.subbots.set(id, sock)
        if(!global.subbotOwners.includes(id)) global.subbotOwners.push(id)
        syncConnectedCount()
        setMeta(id,{connectedAt:Date.now(),pairedAt:Date.now(),disconnectedAt:null,isConnected:true})
        try{ restoreAutoActions(sock, id) }catch(e){ console.log('pair restoreAutoActions err', e.message) }
        try{ if(typeof onConnected === 'function') await onConnected() }catch(e){ console.log('pair onConnected err', e.message) }
      }
      if(u.connection === 'close'){
        const statusCode = u.lastDisconnect?.error?.output?.statusCode
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401
        if(!opened){
          cleanup()
          console.log('PAIR SOCKET CLOSED BEFORE OPEN, KEEPING FOLDER:', id, 'code:', statusCode)
          return
        }
        if(global.subbots.has(id)){ global.subbots.delete(id); syncConnectedCount() }
        setMeta(id,{disconnectedAt:Date.now(),isConnected:false})
        console.log(Y+`⚠️ SUBBOT ${id} CLOSED code:${statusCode} loggedOut:${isLoggedOut}`+R)
        if(isLoggedOut){
          console.log(Rd+`❌ SUBBOT ${id} logged out, not retrying. Delete ./sessions/${id} to re-pair`+R)
          if(global.reconnectTimers.has(id)){ clearTimeout(global.reconnectTimers.get(id)); global.reconnectTimers.delete(id) }
          return
        }
        if(global.reconnectTimers.has(id)) return
        let timer = setTimeout(()=>{ global.reconnectTimers.delete(id); startSubBotSession(id) },5000)
        global.reconnectTimers.set(id, timer)
      }
    })
    sock.ev.on('messages.upsert', createMessageHandler(sock, true))
    sock.ev.on('group-participants.update', async (anu)=>{
      try{
        await handleWelcomeGoodbye(sock, anu, id);
        await handleAutokick(sock, anu, id);
        await handleAntipromote(sock, anu, id);
        await handleAntidemote(sock, anu, id);
      }catch(e){ console.log('pair group update err', e.message) }
    })

    // FIX: don't resolve on 'connecting' alone. Wait for connecting AND handshake settle.
    // And FIX: reject immediately on 'close', don't wait 25s doing nothing.
    await new Promise((resolve,reject)=>{
      let done=false
      const timeout=setTimeout(()=>{ if(!done){ done=true; reject(new Error('Socket timeout while connecting')) } },25000)
      const listener=(u)=>{
        if(done) return
        if(u.connection === 'close'){
          done=true; clearTimeout(timeout); reject(new Error('Socket closed before pairing'))
        }
        if(u.connection === 'connecting' || u.connection === 'open'){
          done=true; clearTimeout(timeout); resolve()
        }
      }
      sock.ev.on('connection.update',listener)
    })
    // FIX: 3s handshake settle, was 1s. Code requested too early = WhatsApp rejects it.
    await delay(3000)

    const code = await sock.requestPairingCode(id)
    const clean = String(code).replace(/[^A-Z0-9]/gi,'').toUpperCase()
    const formatted = clean.match(/.{1,4}/g).join('-')
    setMeta(id,{pairedAt:Date.now(),isConnected:false})

    // FIX: pairing timeout = one cleanup, same as connection timeout. Clears flag + closes socket.
    pairingTimeout = setTimeout(()=>{
      if(!opened){
        cleanup()
        try{ sock.end?.() }catch{}
        try{ sock.ws?.close?.() }catch{}
        console.log('PAIRING TIMEOUT:',id)
      }
    },180000)
    return formatted

  }catch(e){
    cleanup()
    try{ sock?.end?.() }catch{}
    try{ sock?.ws?.close?.() }catch{}
    throw e
  }
}

async function startAllSubBots(){
  global.startAllSubBots = startAllSubBots
  try{
    const dirs = fs.readdirSync('./sessions')
    for(let d of dirs){
      if(d.length >= 10){
        // FIX: skip un-registered folders - they are still pairing, don't start 2nd socket
        try{
          const cf = './sessions/'+d+'/creds.json'
          if(!fs.existsSync(cf)) continue
          const c = JSON.parse(fs.readFileSync(cf,'utf8'))
          if(!c.registered) continue
        }catch{ continue }
        await delay(2000)
        startSubBotSession(d)
      }
    }
  }catch(e){ console.log('startAllSubBots err', e.message) }
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
  try{
    const files=fs.readdirSync(commandFolder)
    for(const f of files){ if(!f.endsWith('.js')) continue; try{ const mod=await import(commandFolder+'/'+f+'?v='+Date.now()); if(mod.default?.name){ global.commands.set(mod.default.name.toLowerCase(),mod.default); if(mod.default.alias) mod.default.alias.forEach(a=>global.commands.set(a.toLowerCase(),mod.default)) } }catch(e){ console.log(`Failed ${f}: ${e.message}`) } }
  }catch(e){ console.log('Command load error '+e.message) }
  console.log(C+`Loaded ${global.commands.size} WhatsApp commands`+R)
  sock.ev.on('messages.upsert', createMessageHandler(sock, false))
  sock.ev.on('group-participants.update', async (anu)=>{
   try{
    let botId=sock.user.id.split(':')[0];
    await handleWelcomeGoodbye(sock, anu, botId);
    await handleAutokick(sock, anu, botId);
    await handleAntipromote(sock, anu, botId);
    await handleAntidemote(sock, anu, botId);
   }catch(e){ console.log('group update err', e.message); }
  });
  await delay(3000)
  startAllSubBots()
}

async function safeStart(){
  try{ await startTelegram() }catch(e){ console.log(Rd+'Telegram start failed: '+e.message+R) }
  try{ await startPairServer() }catch(e){ console.log(Rd+'PairServer start failed: '+e.message+R) }
  try{ await startWhatsApp() }catch(e){ console.log(Rd+'WhatsApp start failed: '+e.message+R); setTimeout(startWhatsApp,5000) }
}
safeStart()
