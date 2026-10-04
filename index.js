import makeWASocket, { useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import { Telegraf, Markup } from 'telegraf'
import pino from 'pino'
import fs from 'fs'
import readline from 'readline'

const BOT_TOKEN = process.env.TELEGRAM_TOKEN || ''
const GROUP_LINK = 'https://t.me/+Tbb5cGyYLJBhMWI0'
const CHANNEL_LINK = 'https://t.me/+oNa3ORe_1I9lMzFk'
const OWNER_LINK = 'https://t.me/STORMX666'
const GROUP_ID = '-1003954880229'
const CHANNEL_ID = '-1003954880229'
const prefix = '.'
const commandFolder = './src/commands'

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

// FIXED isJoined - checks once if same ID, and doesn't block if bot not admin
async function isJoined(ctx){
  if(!GROUP_ID) return true
  try{
    // If same ID for both, check only once
    if(GROUP_ID === CHANNEL_ID){
      const m = await ctx.telegram.getChatMember(GROUP_ID, ctx.from.id)
      const ok = ['member','administrator','creator'].includes(m.status)
      console.log(`Check ${ctx.from.id} in ${GROUP_ID}: ${m.status} => ${ok}`)
      return ok
    }
    const g = await ctx.telegram.getChatMember(GROUP_ID, ctx.from.id)
    const okG = ['member','administrator','creator'].includes(g.status)
    if(!okG) return false
    if(CHANNEL_ID){
      const c = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id)
      return ['member','administrator','creator'].includes(c.status)
    }
    return okG
  }catch(e){
    console.log('isJoined error (bot must be admin):', e.message)
    return true // don't lock if bot not admin, to avoid forcing loop
  }
}

async function getBotPhoto(ctx){
  try{ const me=await ctx.telegram.getMe(); const p=await ctx.telegram.getUserProfilePhotos(me.id); if(p.total_count>0) return p.photos[0][0].file_id }catch{}
  return null
}

async function sendMainMenu(ctx){
  const now=new Date()
  const dateStr=`${now.getDate()} ${now.getMonth()+1} ${now.getFullYear()}`
  const user=ctx.from.first_name||'User'
  const userId=ctx.from.id
  const msg=`╭━─━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 ❱─━─━─━╮
┃${toSmallCaps(`HEY 👋 ${user}`)}
┃${toSmallCaps('WELCOME TO STORM CYBER MD')}
┃${toSmallCaps('V3 VERSION')}
┃${toSmallCaps(`USER ID: ${userId}`)}
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━❐
┃╔══『 🛡️ CYBER PAIR SYSTEM 🛡️ 』══❒
┃║ ★┏━━━━━━『 BOT INFO 』━━━━━━
┃║ ★│ ➣ ${toSmallCaps('BOT : STORM CYBER MD')}
┃║ ★│ ➣ ${toSmallCaps('VERSION : v2.0.0')}
┃║ ★│ ➣ ${toSmallCaps('DEV : STORM X')}
┃║ ★│ ➣ ${toSmallCaps(`ONLINE : ${connectedCount}`)}
┃║ ★│ ➣ ${toSmallCaps(`DATE : ${dateStr}`)}
┃║ ★│ ➣ ${toSmallCaps('PREFIX : /')}
┃║ ★└─────
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
  const photo=await getBotPhoto(ctx)
  const kb=Markup.inlineKeyboard([[Markup.button.url('👥 Group', GROUP_LINK), Markup.button.url('📢 Channel', CHANNEL_LINK)],[Markup.button.url('👑 Owner', OWNER_LINK)]])
  if(photo) await ctx.replyWithPhoto(photo,{caption:msg,...kb})
  else await ctx.reply(msg,kb)
}

async function sendJoinLock(ctx){
  const photo=await getBotPhoto(ctx)
  const txt=toSmallCaps(`🚫 YOU HAVEN'T JOINED THE GROUP AND CHANNEL`)
  const kb=Markup.inlineKeyboard([[Markup.button.url('📢 Channel', CHANNEL_LINK), Markup.button.url('👥 Group', GROUP_LINK)],[Markup.button.callback('✅ Verify','verify_join')]])
  if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...kb})
  else await ctx.reply(txt,kb)
}

async function startTelegram(){
  if(!BOT_TOKEN){ console.log(Y+'⚠️ TELEGRAM_TOKEN not set'+R); return }
  const bot=new Telegraf(BOT_TOKEN)
  bot.start(async (ctx)=>{
    if(!await isJoined(ctx)) return sendJoinLock(ctx)
    await sendMainMenu(ctx)
  })
  bot.action('verify_join', async (ctx)=>{
    const joined=await isJoined(ctx)
    if(!joined){
      try{ await ctx.deleteMessage() }catch{}
      const photo=await getBotPhoto(ctx)
      const txt=toSmallCaps(`🚫 YOU STILL HV TO FOLLOW THIS CHANNEL OR GROUP`)
      const kb=Markup.inlineKeyboard([[Markup.button.url('📢 Channel', CHANNEL_LINK), Markup.button.url('👥 Group', GROUP_LINK)],[Markup.button.callback('✅ Verify','verify_join')]])
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...kb})
      else await ctx.reply(txt,kb)
      return ctx.answerCbQuery(toSmallCaps('still not joined'))
    }else{
      try{ await ctx.deleteMessage() }catch{}
      const photo=await getBotPhoto(ctx)
      const txt=toSmallCaps(`✅ ACCESS GRANTED USE ANY COMMAND.`)
      const kb=Markup.inlineKeyboard([[Markup.button.callback('🚀 Start','start_menu')]])
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...kb})
      else await ctx.reply(txt,kb)
    }
  })
  bot.action('start_menu', async (ctx)=>{
    try{ await ctx.deleteMessage() }catch{}
    await sendMainMenu(ctx)
  })
  bot.command('pair', async (ctx)=>{
    if(!await isJoined(ctx)) return sendJoinLock(ctx)
    let number=ctx.message.text.split(' ')[1]?.replace(/[^0-9]/g,'')
    if(!number){
      return ctx.reply(`ℹ️ 𝚄𝚂𝙰𝙶𝙴\n\n/pair <number>\n\n𝙴𝙽𝚃𝙴𝚁 𝚈𝙾𝚄𝚁 𝙽𝚄𝙼𝙱𝙴𝚁 𝚆𝙸𝚃𝙷 𝙲𝙾𝚄𝙽𝚃𝚁𝚈 𝙲𝙾𝙳𝙴 — 𝙽𝙾 "+",\n\n𝙴𝚇𝙰𝙼𝙿𝙻𝙴 — /pair 2567662330xxx`)
    }
    let sMsg=await ctx.reply(toSmallCaps(`🔍 Checking server...`))
    await delay(500)
    try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`🖥️ Looking for server...`)) }catch{}
    await delay(600)
    try{
      const { version } = await fetchLatestBaileysVersion()
      const { state, saveCreds } = await useMultiFileAuthState('./sessions/'+number)
      const sock = makeWASocket({
        version, logger:pino({level:'silent'}),
        auth:{creds:state.creds, keys:makeCacheableSignalKeyStore(state.keys,pino({level:'silent'}))},
        browser:Browsers.macOS('Safari'),
        printQRInTerminal:false, syncFullHistory:false, markOnlineOnConnect:false,
        connectTimeoutMs:60000, keepAliveIntervalMs:15000, defaultQueryTimeoutMs:60000,
        emitOwnEvents:false, generateHighQualityLinkPreview:false
      })
      sock.ev.on('creds.update', saveCreds)
      try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`🔗 Opening socket for ${number}...`)) }catch{}
      await delay(3500)
      const code=await sock.requestPairingCode(number)
      const clean=code.replace(/-/g,'').toUpperCase()
      const pairMsg=`${toSmallCaps('🔥 Pairing code generated')}\n\n📲 ${toSmallCaps(`NUM: ${number}`)}\n\n>> ${clean} <<\n\n${toSmallCaps('Open whatsapp > Linked devices > Link with phone number, and enter the code.')}\n> ${toSmallCaps('CODE EXPIRES IN 60 SECONDS')}\n@STORM X 𖤍`
      const photo=await getBotPhoto(ctx)
      const kb=Markup.inlineKeyboard([[Markup.button.callback(`📋 ${clean}`,`copy_${clean}`)],[Markup.button.url('👥 Group',GROUP_LINK), Markup.button.url('📢 Channel',CHANNEL_LINK)],[Markup.button.url('👑 Owner',OWNER_LINK)]])
      if(photo) await ctx.replyWithPhoto(photo,{caption:pairMsg,...kb})
      else await ctx.reply(pairMsg,kb)
      sock.ev.on('connection.update', u=>{ if(u.connection==='open'){ connectedCount++; ctx.reply(toSmallCaps(`✅ ${number} Connected! Session saved on server.`)) } })
    }catch(e){
      await ctx.reply(toSmallCaps(`❌ ғᴀɪʟᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ.`))
    }
  })
  bot.command('list', async (ctx)=>{
    if(!await isJoined(ctx)) return sendJoinLock(ctx)
    const chk=await ctx.reply(toSmallCaps(`🔎 Checking server...`))
    await delay(800)
    const total=countUsers()
    const txt=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connectedCount}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connectedCount)}\n\n𝚂𝙴𝚁𝚅𝙴𝚁(𝚂) 𝚁𝙴𝙰𝙳𝚈`
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,txt) }catch{ await ctx.reply(txt) }
  })
  bot.command('users', async (ctx)=>{
    if(!await isJoined(ctx)) return sendJoinLock(ctx)
    const chk=await ctx.reply(toSmallCaps(`🔎 Checking server...`))
    await delay(700)
    const total=countUsers()
    const txt=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connectedCount}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connectedCount)}`
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,txt) }catch{ await ctx.reply(txt) }
  })
  bot.command('runtime', async (ctx)=>{
    const {d,h,m,s}=runtime()
    const chk=await ctx.reply(toSmallCaps(`🔍 Checking server...`))
    await delay(600)
    const txt=`✅️ 𝚃𝙷𝙴 𝙱𝙾𝚃 𝙷𝙰𝚂 𝙱𝙴𝙴𝙽\nRUNNING FOR ${d}d ${h}h ${m}m ${s}s`
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,txt) }catch{ await ctx.reply(txt) }
  })
  const ownerHandler=async (ctx)=>{
    const photo=await getBotPhoto(ctx)
    const txt=`🧑‍💻 𝙱𝙾𝚃 𝙾𝚆𝙽𝙴𝚁\n\n𝙲𝙾𝙽𝚃𝙰𝙲𝚃 𝚃𝙷𝙴 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁 \n𝚄𝚂𝙸𝙽𝙶 𝚃𝙷𝙴 𝙱𝚄𝚃𝚃𝙾𝙽.`
    const kb=Markup.inlineKeyboard([[Markup.button.url('💬 Developer',OWNER_LINK)]])
    if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...kb})
    else await ctx.reply(txt,kb)
  }
  bot.command('dev', ownerHandler)
  bot.command('owner', ownerHandler)
  bot.command('creator', ownerHandler)
  bot.command('disconnect', async (ctx)=>{
    if(!await isJoined(ctx)) return sendJoinLock(ctx)
    const n=ctx.message.text.split(' ')[1]?.replace(/[^0-9]/g,'')
    if(!n) return ctx.reply(`ℹ️ 𝚄𝚂𝙰𝙶𝙴\n\n/disconnect <number>`)
    const chk=await ctx.reply(toSmallCaps(`🔎 Checking server...`))
    await delay(800)
    const exists=fs.existsSync('./sessions/'+n)
    if(!exists){
      try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,toSmallCaps(`⚠️ 𝙽𝙾 𝚂𝙴𝚂𝚂𝙸𝙾𝙽 𝙵𝙾𝚄𝙽𝙳.`)) }catch{}
      return
    }
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,toSmallCaps(`✅️ SESSION FOR ${n} FOUND`)) }catch{}
    const kb=Markup.inlineKeyboard([[Markup.button.callback('✅ Confirm',`del_confirm_${n}`), Markup.button.callback('❌ Cancel',`del_cancel_${n}`)]])
    await ctx.reply(toSmallCaps(`Do you want to disconnect ${n}?`),kb)
  })
  bot.action(/del_confirm_(.*)/, async (ctx)=>{
    const n=ctx.match[1]
    try{ fs.rmSync('./sessions/'+n,{recursive:true,force:true}) }catch{}
    await ctx.answerCbQuery(toSmallCaps('deleted'))
    try{ await ctx.deleteMessage() }catch{}
    await ctx.reply(toSmallCaps(`✅ Session ${n} disconnected.`))
  })
  bot.action(/del_cancel_(.*)/, async (ctx)=>{
    await ctx.answerCbQuery(toSmallCaps('cancelled'))
    try{ await ctx.deleteMessage() }catch{}
    await ctx.reply(toSmallCaps(`❌ Cancelled.`))
  })
  bot.on('callback_query', async (ctx)=>{
    const data=ctx.callbackQuery.data
    if(data.startsWith('copy_')){
      const code=data.replace('copy_','')
      await ctx.answerCbQuery(toSmallCaps(`Code: ${code}`))
      await ctx.reply(`\`${code}\``, {parse_mode:'Markdown'})
    }
  })
  bot.launch()
  console.log(G+B+'✅ TELEGRAM PAIR BOT ONLINE'+R)
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
    if(u.connection==='open'){ console.log(G+B+'\n✅ WHATSAPP BOT CONNECTED!\n'+R); connectedCount++; try{rl.close()}catch{} }
    if(u.connection==='close'){ console.log(Rd+'WhatsApp closed, restarting 3s...'+R); setTimeout(startWhatsApp,3000) }
  })
  const commands=new Map()
  try{
    const files=fs.readdirSync(commandFolder)
    for(const f of files){ if(!f.endsWith('.js')) continue; try{ const mod=await import(commandFolder+'/'+f+'?v='+Date.now()); if(mod.default?.name){ commands.set(mod.default.name.toLowerCase(),mod.default); if(mod.default.alias) mod.default.alias.forEach(a=>commands.set(a.toLowerCase(),mod.default)) } }catch(e){ console.log(`Failed ${f}: ${e.message}`) } }
  }catch(e){ console.log('Command load error '+e.message) }
  console.log(C+`Loaded ${commands.size} WhatsApp commands`+R)
  sock.ev.on('messages.upsert', async m=>{
    try{
      const msg=m.messages[0]; if(!msg.message) return
      if(msg.key.remoteJid=='status@broadcast') return
      let body=msg.message.conversation||msg.message.extendedTextMessage?.text||msg.message.imageMessage?.caption||msg.message.videoMessage?.caption||''
      if(!body.startsWith(prefix)) return
      let name=body.slice(1).split(' ')[0].toLowerCase()
      let cmd=commands.get(name)
      if(cmd){ if(cmd.execute.length===3) await cmd.execute(sock,m.messages[0].key.remoteJid,msg); else await cmd.execute(sock,m.messages[0].key.remoteJid,msg,[],{isOwner:true}) }
    }catch{}
  })
}
startTelegram()
startWhatsApp()
