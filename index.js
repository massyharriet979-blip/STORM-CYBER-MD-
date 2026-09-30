import makeWASocket, { useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import { Telegraf, Markup } from 'telegraf'
import pino from 'pino'
import fs from 'fs'
import readline from 'readline'

// ========= CONFIG =========
const BOT_TOKEN = '8840483730:AAFx7jONckWiT9ntamanqTCGoQCecAYs4hg' // <--- PUT TELEGRAM TOKEN HERE
const GROUP_LINK = 'https://t.me/+Tbb5cGyYLJBhMWI0'
const CHANNEL_LINK = 'https://t.me/+oNa3ORe_1I9lMzFk'
const OWNER_LINK = 'https://t.me/STORMX666'
const GROUP_ID = '' // Leave empty until you get ID - then bot will NOT force join
const CHANNEL_ID = ''
const prefix = '.'
// ==========================

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(res => rl.question(q, res))
const R="\x1b[0m", B="\x1b[1m", C="\x1b[36m", G="\x1b[32m", Y="\x1b[33m", Rd="\x1b[31m"

if(!fs.existsSync('./src/database/session')) fs.mkdirSync('./src/database/session',{recursive:true})
if(!fs.existsSync('./sessions')) fs.mkdirSync('./sessions',{recursive:true})
if(!fs.existsSync('./src/commands')) fs.mkdirSync('./src/commands',{recursive:true})

let startTime = Date.now()
let connectedCount = 0
function runtime(){ let s=Math.floor((Date.now()-startTime)/1000); let d=Math.floor(s/86400); s%=86400; let h=Math.floor(s/3600); s%=3600; let m=Math.floor(s/60); return {d,h,m,s:s%60} }
function countUsers(){ try{return fs.readdirSync('./sessions').length}catch{return 0} }

async function isJoined(ctx){
  if(!GROUP_ID ||!CHANNEL_ID) return true // Skip check until you add IDs
  try{
    const g = await ctx.telegram.getChatMember(GROUP_ID, ctx.from.id)
    const c = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id)
    return ['member','administrator','creator'].includes(g.status) && ['member','administrator','creator'].includes(c.status)
  }catch{ return true }
}

// ===== TELEGRAM BOT =====
async function startTelegram(){
  if(BOT_TOKEN==='PUT_YOUR_TOKEN_HERE'){ console.log(Y+'⚠️ Telegram token not set - skipping Telegram bot'+R); return }
  const bot = new Telegraf(BOT_TOKEN)

  bot.start(async (ctx)=>{
    const {d,h,m}=runtime()
    const msg = `╭━─━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 ❱─━─━─━╮
┃
┃╔══『 🛡️ CYBER PAIR SYSTEM 🛡️ 』══❒
┃║
┃║ ★┏━━━━━━『 BOT INFO 』━━━━━━
┃║ ★│ ➣ BOT : STORM CYBER MD
┃║ ★│ ➣ VERSION : v2.0.0
┃║ ★│ ➣ DEV : STORM X
┃║ ★│ ➣ USERS : ${countUsers()}
┃║ ★│ ➣ ONLINE : ${connectedCount}
┃║ ★│ ➣ UPTIME : ${d} D ${h} h ${m} m
┃║ ★│ ➣ PREFIX : /
┃║ ★└─────
┃║
┃║ ★┌─── ( COMMAND {S} )
┃║ ★│ ➣ /pair - CONNECT A NUMBER
┃║ ★│ ➣ /disconnect - DISCONNECT
┃║ ★│ ➣ /list - VIEW SESSIONS
┃║ ★│ ➣ /dev - CONTACT OWNER
┃║ ★│ ➣ /runtime - UPTIME
┃║ ★│ ➣ /creator - CONTACT CREATOR
┃║ ★╰═══════════════════●○◇
┃╚═══════════════════════❒
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━❐`
    try{
      const me = await ctx.telegram.getMe()
      const photos = await ctx.telegram.getUserProfilePhotos(me.id)
      if(photos.total_count>0){
        await ctx.replyWithPhoto(photos.photos[0][0].file_id, {caption: msg,...Markup.inlineKeyboard([[Markup.button.url('📢 Group', GROUP_LINK), Markup.button.url('📣 Channel', CHANNEL_LINK)],[Markup.button.url('👑 Owner', OWNER_LINK)]])})
      }else throw 'no photo'
    }catch{
      await ctx.reply(msg, Markup.inlineKeyboard([[Markup.button.url('📢 Group', GROUP_LINK), Markup.button.url('📣 Channel', CHANNEL_LINK)],[Markup.button.url('👑 Owner', OWNER_LINK)]]))
    }
  })

  bot.command('pair', async (ctx)=>{
    if(!await isJoined(ctx)) return ctx.reply('❌ Join Group and Channel first!', Markup.inlineKeyboard([[Markup.button.url('Join Group', GROUP_LINK), Markup.button.url('Join Channel', CHANNEL_LINK)]]))
    let number = ctx.message.text.split(' ')[1]?.replace(/[^0-9]/g,'')
    if(!number) return ctx.reply('Usage: /pair 2567xxxxxxx')
    await ctx.reply(`⏳ Generating for ${number}... 8 sec`)
    try{
      const { version } = await fetchLatestBaileysVersion()
      const { state, saveCreds } = await useMultiFileAuthState('./sessions/'+number)
      const sock = makeWASocket({ version, logger: pino({ level: 'silent' }), auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) }, browser: Browsers.ubuntu('Chrome'), printQRInTerminal:false, syncFullHistory:false })
      sock.ev.on('creds.update', saveCreds)
      let r=0; while(sock.ws.readyState!==1 && r<12){ await new Promise(a=>setTimeout(a,1000)); r++ }
      const code = await sock.requestPairingCode(number)
      const clean = code.replace(/-/g,'').toUpperCase()
      const pairMsg = `🔥𝙿𝙰𝙸𝚁𝙸𝙽𝙶 𝙲𝙾𝙳𝙴 𝙶𝙴𝙽𝙴𝚁𝙰𝚃𝙴𝙳\n\n📲 𝙽𝚄𝙼: ${number}\n\n\`\`\`\n${clean}\n\`\`\`\n\n𝙾𝙿𝙴𝙽 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿 > \n𝙻𝙸𝙽𝙺𝙴𝙳 𝙳𝙴𝚅𝙸𝙲𝙴𝚂 > \n𝙻𝙸𝙽𝙺 𝚆𝙸𝚃𝙷 𝙿𝙷𝙾𝙽𝙴 𝙽𝚄𝙼𝙱𝙴𝚁, \n𝙰𝙽𝙳 𝙴𝙽𝚃𝙴𝚁 𝚃𝙷𝙴 𝙲𝙾𝙳𝙴.\n> 𝙲𝙾𝙳𝙴 𝚃𝙰𝙺𝙴𝚂 60 𝚂𝙴𝙲𝙾𝙽𝙳𝚂\n >> COPY CODE<<`
      await ctx.replyWithMarkdown(pairMsg, Markup.inlineKeyboard([[Markup.button.url('📢 Group', GROUP_LINK), Markup.button.url('📣 Channel', CHANNEL_LINK)],[Markup.button.url('👑 Owner', OWNER_LINK)]]))
      sock.ev.on('connection.update', u=>{ if(u.connection==='open'){ connectedCount++; ctx.reply(`✅ ${number} Connected!`)} })
    }catch(e){ ctx.reply('❌ Failed: '+e.message) }
  })

  bot.command('list', ctx=> ctx.reply(`📂 Sessions: ${countUsers()} | Online: ${connectedCount}`))
  bot.command('runtime', ctx=>{ const {d,h,m,s}=runtime(); ctx.reply(`⏱️ ${d}d ${h}h ${m}m ${s}s`) })
  bot.command('dev', ctx=> ctx.reply('👑 Owner', Markup.inlineKeyboard([[Markup.button.url('Contact', OWNER_LINK)]])))
  bot.command('creator', ctx=> ctx.reply('👑 STORM X', Markup.inlineKeyboard([[Markup.button.url('Contact', OWNER_LINK)]])))
  bot.command('disconnect', ctx=>{ const n=ctx.message.text.split(' ')[1]?.replace(/[^0-9]/g,''); if(!n) return ctx.reply('Usage: /disconnect 2567...'); try{ fs.rmSync('./sessions/'+n,{recursive:true,force:true}); ctx.reply(`✅ ${n} deleted`)}catch{ctx.reply('❌ Not found')} })

  bot.launch()
  console.log(G+B+'✅ TELEGRAM PAIR BOT ONLINE'+R)
}

// ===== WHATSAPP BOT =====
async function startWhatsApp(){
  console.log(C+B+`\n █ STORM CYBER MD - WHATSAPP BOT █\n`+R)
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState('./src/database/session')
  const sock = makeWASocket({ version, logger: pino({ level: 'silent' }), auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) }, browser: Browsers.ubuntu('Chrome'), printQRInTerminal:false, syncFullHistory:false })
  sock.ev.on('creds.update', saveCreds)

  if(!state.creds.registered){
    let num = await ask(C+B+'📱 Enter main bot number (2567xxxxxxx): '+R)
    num = num.replace(/[^0-9]/g,'')
    console.log(Y+'⏳ Connecting 8 sec...'+R)
    let r=0; while(sock.ws.readyState!==1 && r<12){ await new Promise(a=>setTimeout(a,1000)); r++ }
    try{ const code = await sock.requestPairingCode(num); console.log(G+B+`\n CODE: ${code} \n`+R) }catch(e){ console.log(Rd+e.message+R) }
  }

  sock.ev.on('connection.update', u=>{
    if(u.connection==='open'){ console.log(G+B+'\n✅ WHATSAPP BOT CONNECTED!\n'+R); connectedCount++ }
    if(u.connection==='close'){ console.log(Rd+'WhatsApp closed, restarting 3s...'+R); setTimeout(startWhatsApp,3000) }
  })

  // Load commands
  const commands = new Map()
  try{
    const files = fs.readdirSync('./src/commands')
    for(const f of files){ if(!f.endsWith('.js')) continue; try{ const mod=await import('./src/commands/'+f+'?v='+Date.now()); if(mod.default?.name){ commands.set(mod.default.name.toLowerCase(), mod.default); if(mod.default.alias) mod.default.alias.forEach(a=> commands.set(a.toLowerCase(), mod.default)) } }catch{} }
  }catch{}
  console.log(C+`Loaded ${commands.size} WhatsApp commands`+R)

  sock.ev.on('messages.upsert', async m=>{
    try{
      const msg=m.messages[0]; if(!msg.message) return
      if(msg.key.remoteJid=='status@broadcast') return
      let body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || ''
      if(!body.startsWith(prefix)) return
      let name=body.slice(1).split(' ')[0].toLowerCase()
      let cmd=commands.get(name)
      if(cmd){ if(cmd.execute.length===3) await cmd.execute(sock, m.messages[0].key.remoteJid, msg); else await cmd.execute(sock, m.messages[0].key.remoteJid, msg, [], {isOwner:true}) }
    }catch{}
  })
}

// START BOTH
startTelegram()
startWhatsApp()
