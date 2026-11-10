import { Telegraf, Markup } from 'telegraf'
import fs from 'fs'
import { sessionCommand, sessionActions } from './commands/session.js'
import { disconnectCommand, disconnectActions, disconnectConfirm, disconnectCancel } from './commands/disconnect.js'
import { listCommand, listActions } from './commands/list.js'
import { usersCommand, usersActions } from './commands/users.js'

const R="\x1b[0m", B="\x1b[1m", C="\x1b[36m", G="\x1b[32m", Y="\x1b[33m", Rd="\x1b[31m"

try{
  if(!process.env.TELEGRAM_TOKEN && fs.existsSync('./.env')){
    let envText = fs.readFileSync('./.env','utf8')
    for(let line of envText.split('\n')){
      line=line.trim()
      if(!line || line.startsWith('#')) continue
      let idx=line.indexOf('=')
      if(idx>-1){
        let k=line.slice(0,idx).trim()
        let v=line.slice(idx+1).trim().replace(/^["']|["']$/g,'')
        if(k && v) process.env[k]=v
      }
    }
  }
}catch(e){}

const BOT_TOKEN = process.env.TELEGRAM_TOKEN || ''
const GROUP_LINK = 'https://t.me/+8XJN9NgIoPM1MmQ0'
const CHANNEL_LINK = 'https://t.me/storm_cyber_md_channel'
const OWNER_LINK = 'https://t.me/STORMXSYRIX'
const CREATOR_LINK = 'https://t.me/STORMXSYRIX'
const GROUP_ID = '-1004481999858'
const CHANNEL_ID = '-1004422840019'

const delay = (ms) => new Promise(r=>setTimeout(r,ms))

if(!global.subbots) global.subbots = new Map()
if(!global.subbotOwners) global.subbotOwners = []
if(!global.sessionMeta) global.sessionMeta = new Map()
let startTime = Date.now()

const digits = (s) => String(s || '').replace(/[^0-9]/g, '')
function cleanPhone(n) {
  let id = digits(n)
  if (id.startsWith('0')) id = id.slice(1)
  return id
}

const pendingTelegramPairs = new Map()
function watchPendingPair(number, tgId){
  if(pendingTelegramPairs.has(number)){
    clearTimeout(pendingTelegramPairs.get(number).timer)
  }
  const timer = setTimeout(async ()=>{
    pendingTelegramPairs.delete(number)
    console.log(`[Telegram] Pair expired for ${number} - pending cleared, SESSION KEPT (not deleted)`)
  }, 5 * 60 * 1000)
  if(timer.unref) timer.unref()
  pendingTelegramPairs.set(number, { timer, tgId })
}
function finishPendingPair(number){
  const p = pendingTelegramPairs.get(number)
  if(p) clearTimeout(p.timer)
  pendingTelegramPairs.delete(number)
}

function isReallyConnected(number){
  if(global.activeSessions?.get(number)?.connected && global.activeSessions?.get(number)?.sock) return true
  if(global.subbots?.has(number)) return true
  return false
}
function isRegistered(number){
  try{
    const clean = cleanPhone(number)
    const c = JSON.parse(fs.readFileSync('./sessions/'+clean+'/creds.json','utf8'))
    return c.registered === true
  }catch{ return false }
}

function syncConnectedCount(){ return global.subbots.size }
function getConnected(){ return global.subbots.size }
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
  }catch{ return 0 }
}
function runtime(){
  let total = Math.floor((Date.now()-startTime)/1000)
  let d = Math.floor(total/86400)
  total %= 86400
  let h = Math.floor(total/3600)
  total %= 3600
  let m = Math.floor(total/60)
  let s = total % 60
  return {d,h,m,s}
}
function setMeta(n,d){
  let o=global.sessionMeta?.get(n)||{}
  global.sessionMeta?.set(n,{...o,...d})
}
function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return text.toLowerCase().split('').map(c=>map[c]||c).join('')
}
function getTgSessionFile(){ return './database/telegram_sessions.json' }
function loadTgSessions(){
  try{
    if(!fs.existsSync(getTgSessionFile())) return {}
    return JSON.parse(fs.readFileSync(getTgSessionFile(),'utf8'))
  }catch{ return {} }
}
function saveTgSession(tgId, number){
  let db=loadTgSessions()
  if(!db[tgId]) db[tgId]=[]
  if(!db[tgId].includes(number)) db[tgId].push(number)
  fs.mkdirSync('./database',{recursive:true})
  fs.writeFileSync(getTgSessionFile(), JSON.stringify(db,null,2))
}
async function isJoined(ctx){
  try{
    if(ctx.chat && ctx.chat.type !== 'private') return true
    if(!ctx.from) return false
    let groupOk = true
    let channelOk = true
    if(GROUP_ID){
      try{
        const m = await ctx.telegram.getChatMember(GROUP_ID, ctx.from.id)
        groupOk = ['member','administrator','creator'].includes(m.status)
      }catch(e){ groupOk = true }
    }
    if(CHANNEL_ID){
      try{
        const c = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id)
        channelOk = ['member','administrator','creator'].includes(c.status)
      }catch(e){ channelOk = true }
    }
    return groupOk && channelOk
  }catch(e){ return true }
}
async function getBotPhoto(ctx){
  try{
    const me=await ctx.telegram.getMe()
    const p=await ctx.telegram.getUserProfilePhotos(me.id)
    if(p.total_count>0) return p.photos[0][0].file_id
  }catch{}
  return null
}
function doReply(ctx){
  try{ if(ctx.message) return { reply_parameters: { message_id: ctx.message.message_id } } }catch{}
  return {}
}
async function sendMainMenu(ctx){
  const now=new Date()
  const dateStr=`${now.getDate()} ${now.getMonth()+1} ${now.getFullYear()}`
  const user=ctx.from.first_name||'User'
  const msg=`<blockquote>╭━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 ❱─━─━╮
┃${toSmallCaps(`HEY 👋 ${user}`)}
┃${toSmallCaps('WELCOME TO STORM CYBER MD')}
┃━━━━━━━━━━━━━━━━━━━━━━━❐
┃╔═══『 𝐃𝐀𝐑𝐊 𝐍𝐎𝐕𝐀 𝐋𝐀𝐁𝐒 』═══❒
┃║ ★┏━━━━『 ʙᴏᴛ ɪɴғᴏ 』━━━━━
┃║ ★│ ➣ ${toSmallCaps('BOT : STORM CYBER MD')}
┃║ ★│ ➣ ${toSmallCaps('VERSION : V3.0.0')}
┃║ ★│ ➣ ${toSmallCaps('DEV : STORM X')}
┃║ ★│ ➣ ${toSmallCaps(`DATE : ${dateStr}`)}
┃║ ★└─────
┃║ ★┌─── ( ᴄᴏᴍᴍᴀɴᴅs )
┃║ ★│ ➣ /pair - ${toSmallCaps('CONNECT A NUMBER')}
┃║ ★│ ➣ /session - ${toSmallCaps('CHECK YOUR SESSION')}
┃║ ★│ ➣ /disconnect - ${toSmallCaps('DISCONNECT')}
┃║ ★│ ➣ /list - ${toSmallCaps('VIEW SESSIONS')}
┃║ ★│ ➣ /dev - ${toSmallCaps('CONTACT DEV')}
┃║ ★│ ➣ /owner - ${toSmallCaps('CONTACT CREATOR')}
┃║ ★│ ➣ /users - ${toSmallCaps('SEE NO. OF USERS')}
┃║ ★│ ➣ /runtime - ${toSmallCaps('CHECK BOT UPTIME')}
┃║ ★╰═══════════════════●○◇
┃╚══════════════════════❒
┗━━━━━━━━━━━━━━━━━━━━━━━━━━❐
© STORM 𝐗</blockquote>`
  const photo=await getBotPhoto(ctx)
  const kb=Markup.inlineKeyboard([[Markup.button.url('👥 Group', GROUP_LINK), Markup.button.url('📢 Channel', CHANNEL_LINK)],[Markup.button.url('👑 Owner', OWNER_LINK)]])
  if(photo) await ctx.replyWithPhoto(photo,{caption:msg, parse_mode: 'HTML', ...kb,...doReply(ctx)})
 else await ctx.reply(msg,{parse_mode: 'HTML', ...kb,...doReply(ctx)})
}
async function sendJoinLock(ctx){
  const photo=await getBotPhoto(ctx)
  const txt=toSmallCaps(`🚫 YOU HAVEN'T JOINED THE GROUP AND CHANNEL, JOIN TO UNLOCK MORE BOT FEATURES`)
  const kb=Markup.inlineKeyboard([[Markup.button.url('📢 Channel', CHANNEL_LINK), Markup.button.url('👥 Group', GROUP_LINK)],[Markup.button.callback('✅ Verify','verify_join')]])
  if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...kb,...doReply(ctx)})
  else await ctx.reply(txt,{...kb,...doReply(ctx)})
}

async function startTelegram(){
  if(!BOT_TOKEN){
    console.log(Y+'⚠️ TELEGRAM_TOKEN not set'+R)
    return
  }
  const bot=new Telegraf(BOT_TOKEN)

  bot.use(async (ctx,next)=>{
    if(ctx.chat?.type === 'private' && ctx.from){
      const text=ctx.message?.text || ''
      if(text.startsWith('/start')) return next()
      if(ctx.callbackQuery?.data === 'verify_join') return next()
      if(ctx.callbackQuery?.data === 'start_menu') return next()
      if(!await isJoined(ctx)){ return sendJoinLock(ctx) }
    }
    return next()
  })

  bot.start(async (ctx)=>{
    if(ctx.chat.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
    await sendMainMenu(ctx)
  })

  bot.action('verify_join', async (ctx)=>{
    const joined=await isJoined(ctx)
    if(!joined){
      try{ await ctx.deleteMessage() }catch{}
      const photo=await getBotPhoto(ctx)
      const txt=toSmallCaps(`🚫 YOU STILL HAVE TO JOIN THE CHANNEL OR GROUP TO UNLOCK THE BOT`)
      const kb=Markup.inlineKeyboard([[Markup.button.url('📢 Channel', CHANNEL_LINK), Markup.button.url('👥 Group', GROUP_LINK)],[Markup.button.callback('✅ Verify','verify_join')]])
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...kb,...doReply(ctx)})
      else await ctx.reply(txt,{...kb,...doReply(ctx)})
      return ctx.answerCbQuery(toSmallCaps('still not joined'))
    }else{
      try{ await ctx.deleteMessage() }catch{}
      const photo=await getBotPhoto(ctx)
      const txt=toSmallCaps(`✅ ACCESS GRANTED,BOT UNLOCKED USE ANY COMMAND.`)
      const kb=Markup.inlineKeyboard([[Markup.button.callback('🚀 Start','start_menu')]])
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...kb,...doReply(ctx)})
      else await ctx.reply(txt,{...kb,...doReply(ctx)})
    }
  })

  bot.action('start_menu', async (ctx)=>{
    try{ await ctx.deleteMessage() }catch{}
    if(ctx.chat?.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
    await sendMainMenu(ctx)
  })

  bot.command('pair', async (ctx)=>{
    if(ctx.chat.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
    let raw = ctx.message.text.split(' ')[1] || ''
    let number = cleanPhone(raw)
    const validExample = '256766233041'

    if(!number || number.length < 10 || number.length > 15){
      return ctx.reply(`${toSmallCaps('❌ invalid number! use country code, no +, no spaces.')}\n\nℹ️ /pair ${validExample}\n${toSmallCaps('examples:')} 2567xxxxxxxx, 2547xxxxxxxx, 23480xxxxxxxx, 1212xxxxxxx, 9198xxxxxxxx`, doReply(ctx))
    }
    if(/(\d)\1{7,}/.test(number) || /12345678|00000000|11111111|xxxx/i.test(raw)){
      return ctx.reply(toSmallCaps(`❌ ғᴀᴋᴇ ɴᴜᴍʙᴇʀ ᴅᴇᴛᴇᴄᴛᴇᴅ. ᴇx: /ᴘᴀɪʀ ${validExample}`), doReply(ctx))
    }
    if(number.startsWith('256') && number.length!==12){
      return ctx.reply(toSmallCaps(`❌ ᴜɢ ɴᴜᴍʙᴇʀ ᴍᴜsᴛ ʙᴇ 12 ᴅɪɢɪᴛs. ᴇx: /ᴘᴀɪʀ ${validExample}`), doReply(ctx))
    }

    if(isReallyConnected(number)){
      return ctx.reply(toSmallCaps(`✅ ${number} IS ALREADY CONNECTED NO NEED TO PAIR AGAIN`), doReply(ctx))
    }

    if(isRegistered(number)){
      saveTgSession(String(ctx.from.id), number)
      return ctx.reply(toSmallCaps(`ℹ️ ${number} HAS A SAVED SESSION BUT IS OFFLINE (LOGGED OUT / DISCONNECTED). SESSION IS KEPT, NOT DELETED. USE /session TO CHECK IT. IF YOU WANT A NEW CODE, USE /disconnect ${number} FIRST, THEN /pair ${number} AGAIN.`), doReply(ctx))
    }

    if(pendingTelegramPairs.has(number)){
      return ctx.reply(toSmallCaps(`⏳ ${number} is already pairing, wait for the current request to finish...`), doReply(ctx))
    }
    if(typeof global.requestPairFromEngine !== 'function'){
      return ctx.reply(toSmallCaps(`❌ engine not ready. restart bot in panel and try again.`), doReply(ctx))
    }
    let sMsg=await ctx.reply(toSmallCaps(`🔍 requesting server information...`), doReply(ctx))
    await delay(500)
    try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`🖥️ looking for a ready server...`)) }catch{}
    await delay(600)
    try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`🔗 opening socket for ${number}...`)) }catch{}
    try{
      const formatted = await global.requestPairFromEngine(number, {
        onConnected: () => {
          finishPendingPair(number)
          saveTgSession(String(ctx.from.id), number)
          setMeta(number,{ connectedAt:Date.now(), pairedAt:Date.now(), isConnected:true })
          ctx.reply(toSmallCaps(`✅ ${number} connected! session saved on server.`), doReply(ctx)).catch(()=>{})
        }
      })
      setMeta(number,{ pairedAt:Date.now(), isConnected:false })
      watchPendingPair(number, String(ctx.from.id))
      const pairMsg = `✅ ${toSmallCaps('pairing code generated')}\n\n📲 ${toSmallCaps('number:')} ${number}\n\n<code>${formatted}</code>\n\n${toSmallCaps('tap and hold the code to copy')}\n${toSmallCaps('open whatsapp > linked devices > link with phone number, and enter this code.')}\n\n${toSmallCaps('⚡ code expires in 5 minutes')}`
      const copyBtn = Markup.inlineKeyboard([[Markup.button.callback(`📋 ${toSmallCaps('copy code')}`, `copy_${formatted}`)]])
      await ctx.reply(pairMsg, { parse_mode:'HTML', ...copyBtn, ...doReply(ctx) })
      try{ await ctx.telegram.deleteMessage(ctx.chat.id, sMsg.message_id) }catch{}
    }catch(e){
      finishPendingPair(number)
      console.log('PAIR ERROR',e.message)
      try{ await ctx.telegram.deleteMessage(ctx.chat.id, sMsg.message_id) }catch{}
      const msg = String(e.message || '').toLowerCase()
      if(msg.includes('already pairing')){
        await ctx.reply(toSmallCaps(`⏳ ${number} is already pairing, wait for the current request to finish...`), doReply(ctx))
      } else if(msg.includes('already registered') || msg.includes('already connected')){
        await ctx.reply(toSmallCaps(`✅ ${number} is already registered / connected. use /session to check.`), doReply(ctx))
      } else if(msg.includes('socket closed') || msg.includes('socket timeout') || msg.includes('timed out')){
        await ctx.reply(toSmallCaps(`❌ socket closed while connecting for ${number}. whatsapp server was busy. wait 2 mins and try /pair again - do not spam.`), doReply(ctx))
      } else {
        await ctx.reply(toSmallCaps(`❌ ғᴀɪʟᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ᴄᴏᴅᴇ ғᴏʀ ${number}. try again after 2 mins. make sure number is on whatsapp.`), doReply(ctx))
      }
    }
  })

  bot.command('session', sessionCommand)
  bot.command('list', listCommand)
  bot.command('users', usersCommand)
  bot.command('disconnect', disconnectCommand)

  // OLD - KEEP FOR BACKWARD COMPAT
  bot.action(/del_confirm_(.*)/, disconnectConfirm)
  bot.action(/del_cancel_(.*)/, disconnectCancel)

  // FIX - THIS WAS MISSING, THIS IS WHY BUTTONS WERE DEAD
  // Real info comes from server via global.activeSessions in index.js,
  // but buttons must be registered HERE or Telegram callback never reaches the files
  bot.action(/^disc_/, disconnectActions)
  bot.action(/^users_/, usersActions)
  bot.action(/^sess_/, async (ctx) => {
    const d = ctx.callbackQuery?.data || ''
    // sess_view_ / sess_refresh_ / sess_back belong to /session
    if(d.startsWith('sess_view_') || d.startsWith('sess_refresh_') || d === 'sess_back'){
      return sessionActions(ctx)
    }
    // anything else starting with sess_ belongs to /list
    return listActions(ctx)
  })
  bot.action('back_list', async (ctx) => {
    try{ return await listActions(ctx) }catch{ return await sessionActions(ctx) }
  })
  bot.action(/^list_/, listActions)
  bot.action(/^reconnect_/, listActions)

  bot.action(/copy_(.*)/, async (ctx)=>{
    const code=ctx.match[1]
    await ctx.answerCbQuery(`📋 ${code} - ${toSmallCaps('long press the code to copy')}`, {show_alert:true})
  })

  bot.command('runtime', async (ctx)=>{
    if(ctx.chat.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
    const chk=await ctx.reply(toSmallCaps(`🔍 requesting server info...`), doReply(ctx))
    await delay(600)
    const {d,h,m,s}=runtime()
    const txt=toSmallCaps(`✅️ ᴛʜᴇ ʙᴏᴛ ʜᴀs ʙᴇᴇɴ\nrunning for ${d}d ${h}h ${m}m ${s}s`)
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,txt) }catch{ await ctx.reply(txt, doReply(ctx)) }
  })

  const devHandler=async (ctx)=>{
    if(ctx.chat.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
    const txt=`🧑‍💻 𝐁𝐎𝐓 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑\n\n𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐓𝐇𝐄 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑\n𝐅𝐎𝐑 𝐀𝐍𝐘 𝐇𝐄𝐋𝐏 𝐎𝐑 𝐈𝐒𝐒𝐔𝐄`
    const kb=Markup.inlineKeyboard([[Markup.button.url('💬 Developer - STORM X',OWNER_LINK)]])
    await ctx.reply(txt,{...kb,...doReply(ctx)})
  }
  const creatorHandler=async (ctx)=>{
    if(ctx.chat.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
    const txt=`👑 𝐁𝐎𝐓 𝐂𝐑𝐄𝐀𝐓𝐎𝐑\n\n𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐓𝐇𝐄 𝐂𝐑𝐄𝐀𝐓𝐎𝐑\n𝐅𝐎𝐑 𝐁𝐔𝐒𝐈𝐍𝐄 & 𝐂𝐎𝐋𝐋𝐀𝐁`
    const kb=Markup.inlineKeyboard([[Markup.button.url('💬 Creator - STX',CREATOR_LINK)]])
    await ctx.reply(txt,{...kb,...doReply(ctx)})
  }

  bot.command('dev', devHandler)
  bot.command('owner', devHandler)
  bot.command('creator', creatorHandler)

  bot.on('text', async (ctx)=>{
    if(ctx.message.text.startsWith('/')) return
    if(ctx.chat.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
  })

  try{
    await bot.launch()
    console.log(G+B+'✅ TELEGRAM PAIR BOT ONLINE'+R)
  }catch(e){
    console.log('TELEGRAM START ERROR:',e.message)
  }
}

export { startTelegram }
