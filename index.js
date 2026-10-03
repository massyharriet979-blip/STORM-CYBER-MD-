import makeWASocket, { useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import { Telegraf, Markup } from 'telegraf'
import pino from 'pino'
import fs from 'fs'
import readline from 'readline'

// ========= CONFIG =========
const BOT_TOKEN = process.env.TELEGRAM_TOKEN || ''
const GROUP_LINK = 'https://t.me/+Tbb5cGyYLJBhMWI0'
const CHANNEL_LINK = 'https://t.me/+oNa3ORe_1I9lMzFk'
const OWNER_LINK = 'https://t.me/STORMX666'
const GROUP_ID = ''
const CHANNEL_ID = ''
const prefix = '.'
const commandFolder = './src/commands'
// ==========================

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise(res => rl.question(q, res))
const R="\x1b[0m", B="\x1b[1m", C="\x1b[36m", G="\x1b[32m", Y="\x1b[33m", Rd="\x1b[31m"

if(!fs.existsSync('./src/database/session')) fs.mkdirSync('./src/database/session',{recursive:true})
if(!fs.existsSync('./sessions')) fs.mkdirSync('./sessions',{recursive:true})
if(!fs.existsSync(commandFolder)) fs.mkdirSync(commandFolder,{recursive:true})

let startTime = Date.now()
let connectedCount = 0
function runtime(){ let s=Math.floor((Date.now()-startTime)/1000); let d=Math.floor(s/86400); s%=86400; let h=Math.floor(s/3600); s%=3600; let m=Math.floor(s/60); return {d,h,m,s:s%60} }
function countUsers(){ try{return fs.readdirSync('./sessions').length}catch{return 0} }
const delay = (ms) => new Promise(r=>setTimeout(r,ms))

function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return text.toLowerCase().split('').map(c=>map[c]||c).join('')
}

async function isJoined(ctx){
  if(!GROUP_ID ||!CHANNEL_ID) return true
  try{
    const g = await ctx.telegram.getChatMember(GROUP_ID, ctx.from.id)
    const c = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id)
    return ['member','administrator','creator'].includes(g.status) && ['member','administrator','creator'].includes(c.status)
  }catch{ return true }
}

async function startTelegram(){
  if(!BOT_TOKEN){ console.log(Y+'⚠️ TELEGRAM_TOKEN not set in ENV - Telegram bot disabled'+R); return }
  const bot = new Telegraf(BOT_TOKEN)
  bot.start(async (ctx)=>{
    if(!await isJoined(ctx)){
      return ctx.reply(toSmallCaps('❌ You must join group and channel first!'), Markup.inlineKeyboard([[Markup.button.url('Join Group', GROUP_LINK), Markup.button.url('Join Channel', CHANNEL_LINK)],[Markup.button.callback('✅ I Joined','check_join')]]))
    }
    const now = new Date()
    const dateStr = `${now.getDate()} ${now.getMonth()+1} ${now.getFullYear()}`
    const user = ctx.from.first_name || 'User'
    const userId = ctx.from.id

    const msg = `╭━─━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 ❱─━─━─━╮
┃${toSmallCaps(`HEY 👋 ${user}`)}
┃${toSmallCaps('WELCOME TO STORM CYBER MD')}
┃${toSmallCaps('V3 VERSION')}
┃${toSmallCaps(`USER ID: ${userId}`)}
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━❐
┃╔══『 🛡️ CYBER PAIR SYSTEM 🛡️ 』══❒
┃║ ★★★★★★★★★★★★★★★★★★★★★
┃║ ★┏━━━━━━『 BOT INFO 』━━━━━━
┃║ ★│ ➣ ${toSmallCaps('BOT : STORM CYBER MD')}
┃║ ★│ ➣ ${toSmallCaps('VERSION : v2.0.0')}
┃║ ★│ ➣ ${toSmallCaps('DEV : STORM X')}
┃║ ★│ ➣ ${toSmallCaps(`ONLINE : ${connectedCount}`)}
┃║ ★│ ➣ ${toSmallCaps(`DATE : ${dateStr}`)}
┃║ ★│ ➣ ${toSmallCaps('PREFIX : /')}
┃║ ★└─────
┃║
┃║ ★┌─── ( COMMANDS )
┃║ ★│ ➣ /pair - ${toSmallCaps('CONNECT A NUMBER')}
┃║ ★│ ➣ /disconnect - ${toSmallCaps('DISCONNECT')}
┃║ ★│ ➣ /list - ${toSmallCaps('VIEW SESSIONS')}
┃║ ★│ ➣ /dev - ${toSmallCaps('CONTACT OWNER')}
┃║ ★│ ➣ /runtime - ${toSmallCaps('UPTIME')}
┃║ ★│ ➣ /creator - ${toSmallCaps('CONTACT CREATOR')}
┃║ ★│ ➣ /users - ${toSmallCaps('SEE NO. OF USERS')}
┃║ ★╰═══════════════════●○◇
┃╚═══════════════════════❒
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━❐
@STORM 𝐗 𖤍`

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

  bot.action('check_join', async (ctx)=>{
    if(await isJoined(ctx)){ ctx.deleteMessage(); ctx.reply(toSmallCaps('✅ Joined! Now use /pair')) }
    else ctx.answerCbQuery(toSmallCaps('❌ You haven\'t joined yet!'))
  })

  // ===== PAIR COMMAND - FIXED TO TAKE ITS TIME =====
  bot.command('pair', async (ctx)=>{
    if(!await isJoined(ctx)) return ctx.reply(toSmallCaps('❌ Join Group and Channel first!'), Markup.inlineKeyboard([[Markup.button.url('Join Group', GROUP_LINK), Markup.button.url('Join Channel', CHANNEL_LINK)]]))
    let number = ctx.message.text.split(' ')[1]?.replace(/[^0-9]/g,'')
    if(!number) return ctx.reply(toSmallCaps('Usage: /pair 2567xxxxxxx'))

    let sMsg = await ctx.reply(toSmallCaps('🔍 Looking for available servers...'))
    await delay(800)
    try{ await ctx.telegram.editMessageText(ctx.chat.id, sMsg.message_id, null, toSmallCaps(`🖥️ Server found: storm-server-0${Math.floor(Math.random()*9)+1} | Connecting to ${number}...`)) }catch{}

    let codeGenerated = false
    let lastError = 'Unknown error'

    for(let attempt = 1; attempt <= 3; attempt++){
      try{
        try{ await ctx.telegram.editMessageText(ctx.chat.id, sMsg.message_id, null, toSmallCaps(`🔗 Opening socket for ${number}... Attempt ${attempt}/3`)) }catch{}

        const { version } = await fetchLatestBaileysVersion()
        const { state, saveCreds } = await useMultiFileAuthState('./sessions/'+number)

        const sock = makeWASocket({
          version,
          logger: pino({ level: 'silent' }),
          auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
          browser: Browsers.macOS('Safari'),
          printQRInTerminal:false,
          syncFullHistory:false,
          markOnlineOnConnect:false,
          connectTimeoutMs: 60000,
          keepAliveIntervalMs: 15000,
          defaultQueryTimeoutMs: 60000,
          emitOwnEvents: false,
          generateHighQualityLinkPreview: false
        })
        sock.ev.on('creds.update', saveCreds)

        await delay(5000)

        const code = await sock.requestPairingCode(number)
        if(!code) throw new Error('No code returned')

        const clean = code.replace(/-/g,'').toUpperCase()
        codeGenerated = true

        const pairMsg = `${toSmallCaps('🔥 Pairing code generated')}\n\n📲 ${toSmallCaps(`NUM: ${number}`)}\n\n>> ${clean} <<\n\n${toSmallCaps('Open whatsapp >')} \n${toSmallCaps('Linked devices >')} \n${toSmallCaps('Link with phone number,')} \n${toSmallCaps('And enter the code.')}\n> ${toSmallCaps('CODE EXPIRES IN 60 SECONDS')}\n@STORM X 𖤍`

        try{
          const me = await ctx.telegram.getMe()
          const photos = await ctx.telegram.getUserProfilePhotos(me.id)
          if(photos.total_count>0){
            await ctx.replyWithPhoto(photos.photos[0][0].file_id, { caption: pairMsg,...Markup.inlineKeyboard([ [Markup.button.callback(`📋 ${clean}`, `copy_${clean}`)], [Markup.button.url('📢 Group', GROUP_LINK), Markup.button.url('📣 Channel', CHANNEL_LINK)], [Markup.button.url('👑 Creator', OWNER_LINK)] ]) })
          }else throw 'no photo'
        }catch{
          await ctx.reply(pairMsg, Markup.inlineKeyboard([ [Markup.button.callback(`📋 COPY CODE: ${clean}`, `copy_${clean}`)], [Markup.button.url('📢 Group', GROUP_LINK), Markup.button.url('📣 Channel', CHANNEL_LINK)], [Markup.button.url('👑 Creator', OWNER_LINK)] ]))
        }
        sock.ev.on('connection.update', u=>{ if(u.connection==='open'){ connectedCount++; ctx.reply(toSmallCaps(`✅ ${number} Connected!`)) } })
        break

      }catch(e){
        lastError = e.message || 'Connection Closed'
        console.log(`Attempt ${attempt} failed: ${lastError}`)
        if(attempt < 3){
          try{ await ctx.telegram.editMessageText(ctx.chat.id, sMsg.message_id, null, toSmallCaps(`⏳ Attempt ${attempt} failed (${lastError}), retrying in 3s...`)) }catch{}
          await delay(3000)
        }
      }
    }

    if(!codeGenerated){
      await ctx.reply(toSmallCaps(`❌ FAILED TO GENERATE YOUR PAIRING CODE for ${number}. Please wait 2 minutes and try again. (${lastError})`))
    }
  })

  bot.command('list', ctx=> ctx.reply(toSmallCaps(`📂 Sessions: ${countUsers()} | Online: ${connectedCount}`)))
  bot.command('users', ctx=> ctx.reply(toSmallCaps(`👥 Total users: ${countUsers()} | Online now: ${connectedCount}`)))
  bot.command('runtime', ctx=>{ const {d,h,m,s}=runtime(); ctx.reply(toSmallCaps(`⏱️ ${d}d ${h}h ${m}m ${s}s`)) })
  bot.command('dev', ctx=> ctx.reply(toSmallCaps('👑 Owner'), Markup.inlineKeyboard([[Markup.button.url('Contact', OWNER_LINK)]])))
  bot.command('creator', ctx=> ctx.reply(toSmallCaps('👑 STORM X - CREATOR'), Markup.inlineKeyboard([[Markup.button.url('Contact Creator', OWNER_LINK)]])))
  bot.command('disconnect', ctx=>{ const n=ctx.message.text.split(' ')[1]?.replace(/[^0-9]/g,''); if(!n) return ctx.reply(toSmallCaps('Usage: /disconnect 2567...')); try{ fs.rmSync('./sessions/'+n,{recursive:true,force:true}); ctx.reply(toSmallCaps(`✅ ${n} deleted`))}catch{ctx.reply(toSmallCaps('❌ Not found'))} })
  bot.on('callback_query', async (ctx)=>{ const data = ctx.callbackQuery.data; if(data.startsWith('copy_')){ const code = data.replace('copy_',''); await ctx.answerCbQuery(toSmallCaps(`Code: ${code}`)); await ctx.reply(`\`${code}\``, {parse_mode:'Markdown'}) } })
  bot.launch()
  console.log(G+B+'✅ TELEGRAM PAIR BOT ONLINE'+R)
}

async function startWhatsApp(){
  console.log(C+B+`\n █ STORM CYBER MD - WHATSAPP BOT █\n`+R)
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState('./src/database/session')
  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
    browser: Browsers.ubuntu('Chrome'),
    printQRInTerminal:false,
    syncFullHistory:false,
    markOnlineOnConnect:false,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 15000,
    defaultQueryTimeoutMs: 60000
  })
  sock.ev.on('creds.update', saveCreds)
  if(!state.creds.registered){
    let num = (process.env.MAIN_NUMBER || '').replace(/[^0-9]/g,'')
    if(!num){
      if(process.stdin.isTTY){
        num = await ask(C+B+'📱 Enter main bot number (2567xxxxxxx): '+R)
        num = num.replace(/[^0-9]/g,'')
      } else {
        console.log(Y+'⚠️ No session found! Set MAIN_NUMBER in Railway Variables to pair once, or upload src/database/session folder'+R)
        console.log(Y+'Bot will wait 10s and retry...'+R)
        await delay(10000)
        return startWhatsApp()
      }
    }
    if(num){
      console.log(Y+'⏳ Requesting pairing code for '+num+'...'+R)
      await delay(4000)
      try{
        let code
        try { code = await sock.requestPairingCode(num) } catch { await delay(3000); code = await sock.requestPairingCode(num) }
        console.log(G+B+`\n CODE FOR ${num}: ${code} \n`+R)
      }catch(e){ console.log(Rd+e.message+R) }
    }
  }
  sock.ev.on('connection.update', u=>{
    if(u.connection==='open'){ console.log(G+B+'\n✅ WHATSAPP BOT CONNECTED!\n'+R); connectedCount++; try{ rl.close() }catch{} }
    if(u.connection==='close'){ console.log(Rd+'WhatsApp closed, restarting 3s...'+R); setTimeout(startWhatsApp,3000) }
  })
  const commands = new Map()
  try{
    const files = fs.readdirSync(commandFolder)
    for(const f of files){ if(!f.endsWith('.js')) continue; try{ const mod=await import(commandFolder+'/'+f+'?v='+Date.now()); if(mod.default?.name){ commands.set(mod.default.name.toLowerCase(), mod.default); if(mod.default.alias) mod.default.alias.forEach(a=> commands.set(a.toLowerCase(), mod.default)) } }catch(e){ console.log(`Failed ${f}: ${e.message}`) } } }
  catch(e){ console.log('Command load error '+e.message) }
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
startTelegram()
startWhatsApp()
