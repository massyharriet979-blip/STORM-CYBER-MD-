import { Telegraf, Markup } from 'telegraf'
import fs from 'fs'
import pino from 'pino'
import { Browsers, useMultiFileAuthState, makeWASocket, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'

const R="\x1b[0m", B="\x1b[1m", C="\x1b[36m", G="\x1b[32m", Y="\x1b[33m"

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

// globals
if(!global.subbots) global.subbots = new Map()
if(!global.subbotOwners) global.subbotOwners = []
if(!global.pairingInProgress) global.pairingInProgress = new Set()
if(!global.sessionMeta) global.sessionMeta = new Map()
let startTime = Date.now()

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
function fmtTime(ts){
  if(!ts) return 'unknown'
  let d=new Date(ts)
  return d.toLocaleString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
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
      }catch(e){
        console.log('GROUP CHECK ERROR:', e.message)
        groupOk = true
      }
    }

    if(CHANNEL_ID){
      try{
        const c = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id)
        channelOk = ['member','administrator','creator'].includes(c.status)
      }catch(e){
        console.log('CHANNEL CHECK ERROR:', e.message)
        channelOk = true
      }
    }

    return groupOk && channelOk
  }catch(e){
    console.log('JOIN CHECK ERROR:', e.message)
    return true
  }
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
┃━━━━━━━━━━━━━━━━━━━━━━━━❐
┃╔══『CYBER ADVANCED MD』══❒
┃║ ★┏━━━━『 BOT INFO 』━━━━━
┃║ ★│ ➣ ${toSmallCaps('BOT : STORM CYBER MD')}
┃║ ★│ ➣ ${toSmallCaps('VERSION : V3.0.0')}
┃║ ★│ ➣ ${toSmallCaps('DEV : STORM X')}
┃║ ★│ ➣ ${toSmallCaps(`DATE : ${dateStr}`)}
┃║ ★└─────
┃║ ★┌─── ( COMMANDS )
┃║ ★│ ➣ /pair - ${toSmallCaps('CONNECT A NUMBER')}
┃║ ★│ ➣ /session - ${toSmallCaps('CHECK YOUR SESSION')}
┃║ ★│ ➣ /disconnect - ${toSmallCaps('DISCONNECT')}
┃║ ★│ ➣ /list - ${toSmallCaps('VIEW SESSIONS')}
┃║ ★│ ➣ /dev - ${toSmallCaps('CONTACT DEV')}
┃║ ★│ ➣ /creator - ${toSmallCaps('CONTACT CREATOR')}
┃║ ★│ ➣ /users - ${toSmallCaps('SEE NO. OF USERS')}
┃║ ★│ ➣ /runtime - ${toSmallCaps('CHECK BOT UPTIME')}
┃║ ★╰═══════════════════●○◇
┃╚═══════════════════════❒
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━❐
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
    let number = raw.replace(/[^0-9]/g,'')
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
    if(global.subbots.has(number)){
      return ctx.reply(toSmallCaps(`✅ ${number} IS ALREADY CONNECTED NO NEED TO PAIR AGAIN`), doReply(ctx))
    }
    const sessPath='./sessions/'+number
    if(fs.existsSync(sessPath+'/creds.json')){
      try{
        const c=JSON.parse(fs.readFileSync(sessPath+'/creds.json','utf8'))
        if(c.registered){
          saveTgSession(String(ctx.from.id), number)
          return ctx.reply(toSmallCaps(`✅ ${number} WAS PAIRED BEFORE AND IS REGISTERED. RESTART YOUR MAIN SERVER TO RECONNECT IT.`), doReply(ctx))
        }
      }catch(e){ console.log('SESSION READ ERROR:',e.message) }
    }
    if(global.pairingInProgress.has(number)){
      return ctx.reply(toSmallCaps(`⏳ ${number} is already pairing, wait for the current request to finish...`), doReply(ctx))
    }
    global.pairingInProgress.add(number)
    let sMsg=await ctx.reply(toSmallCaps(`🔍 requesting server information...`), doReply(ctx))
    await delay(500)
    try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`🖥️ looking for a ready server...`)) }catch{}
    await delay(600)
    try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`🔗 opening socket for ${number}...`)) }catch{}
    let pairingSock=null
    let pairingOpened=false
    let pairingTimeout=null
    try{
      const { version } = await fetchLatestBaileysVersion()
      const { state, saveCreds } = await useMultiFileAuthState(sessPath)
      const sock = makeWASocket({
        version, logger:pino({level:'silent'}),
        auth:{ creds:state.creds, keys:makeCacheableSignalKeyStore(state.keys,pino({level:'silent'})) },
        browser:Browsers.ubuntu('Chrome'), printQRInTerminal:false, syncFullHistory:false, markOnlineOnConnect:false,
        connectTimeoutMs:60000, keepAliveIntervalMs:15000, defaultQueryTimeoutMs:60000, emitOwnEvents:false, generateHighQualityLinkPreview:false
      })
      pairingSock=sock
      sock.ev.on('creds.update', saveCreds)

      sock.ev.on('connection.update', async (u)=>{
        if(u.connection === 'open'){
          if(pairingOpened) return
          pairingOpened=true
          clearTimeout(pairingTimeout)
          global.pairingInProgress.delete(number)
          if(!global.subbots.has(number)){
            global.subbots.set(number, sock)
            if(!global.subbotOwners.includes(number)) global.subbotOwners.push(number)
            if(typeof global.createMessageHandler === 'function'){
              try{
                const handler=global.createMessageHandler(sock,true)
                if(typeof handler === 'function') sock.ev.on('messages.upsert',handler)
              }catch(e){ console.log('MESSAGE HANDLER ERROR:',e.message) }
            }
          }
          saveTgSession(String(ctx.from.id), number)
          setMeta(number,{ connectedAt:Date.now(), pairedAt:Date.now(), isConnected:true })
          ctx.reply(toSmallCaps(`✅ ${number} connected! session saved on server.`), doReply(ctx)).catch(()=>{})
        }
        if(u.connection === 'close'){
          clearTimeout(pairingTimeout)
          global.pairingInProgress.delete(number)
          if(!global.subbots.has(number)){
            try{
              const credsFile=sessPath+'/creds.json'
              if(fs.existsSync(credsFile)){
                const creds=JSON.parse(fs.readFileSync(credsFile,'utf8'))
                if(!creds.registered) fs.rmSync(sessPath,{recursive:true,force:true})
              }
            }catch(e){ console.log('PAIR CLEANUP ERROR:',e.message) }
          }else{
            setMeta(number,{ disconnectedAt:Date.now(), isConnected:false })
          }
        }
      })

      await new Promise((resolve,reject)=>{
        let resolved=false
        const timeout=setTimeout(()=>{ if(!resolved){ resolved=true; reject(new Error('Socket timeout while connecting')) } },25000)
        const listener=(u)=>{
          if((u.connection === 'connecting' || u.connection === 'open') && !resolved){
            resolved=true; clearTimeout(timeout); resolve()
          }
        }
        sock.ev.on('connection.update',listener)
      })

      await delay(1500)
      const code=await sock.requestPairingCode(number)
      const clean=code.replace(/[^A-Z0-9]/gi,'').toUpperCase()
      const formatted=clean.match(/.{1,4}/g).join('-')

      setMeta(number,{ pairedAt:Date.now(), isConnected:false })

      const pairMsg = `✅ ${toSmallCaps('pairing code generated')}\n\n📱 ${toSmallCaps('number:')} ${number}\n\n${formatted}\n\n${toSmallCaps('open whatsapp > linked devices > link with phone number, and enter this code.')}`

      const copyBtn = Markup.inlineKeyboard([[Markup.button.callback(`📋 ${toSmallCaps('copy code')}`, `copy_${formatted}`)]])
      await ctx.reply(pairMsg, {...copyBtn, ...doReply(ctx)})

      try{ await ctx.telegram.deleteMessage(ctx.chat.id, sMsg.message_id) }catch{}

      pairingTimeout=setTimeout(()=>{
        if(!pairingOpened){
          global.pairingInProgress.delete(number)
          try{ pairingSock?.end?.() }catch{}
          try{ pairingSock?.ws?.close?.() }catch{}
          console.log('PAIRING TIMEOUT:',number)
        }
      },120000)

    }catch(e){
      clearTimeout(pairingTimeout)
      global.pairingInProgress.delete(number)
      try{ pairingSock?.end?.() }catch{}
      try{ pairingSock?.ws?.close?.() }catch{}
      console.log('PAIR ERROR',e.message)
      await ctx.reply(toSmallCaps(`❌ ғᴀɪʟᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ᴄᴏᴅᴇ ғᴏʀ ${number}. try again after 2 mins. make sure number is on whatsapp.`), doReply(ctx))
    }
  })

  bot.command('session', async (ctx)=>{
    if(ctx.chat.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
    let db=loadTgSessions()
    let myNums=db[String(ctx.from.id)]||[]
    let photo=await getBotPhoto(ctx)
    if(myNums.length===0){
      let txt0=toSmallCaps(`you dont have any active session in the server, use the pair button bellow to get connected ❌`)
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt0,...doReply(ctx)})
      else await ctx.reply(txt0, doReply(ctx))
      return
    }
    let onlineNums=myNums.filter(n=>global.subbots.has(n))
    let pairedCount=myNums.length
    if(onlineNums.length>0){
      let meta=global.sessionMeta.get(onlineNums[0])||{}
      let txt=toSmallCaps(`you have an active session in the server right now ✅️\n\nrun time: ${fmtTime(meta.pairedAt||meta.connectedAt)}\npaired: ${pairedCount}\nstatus: online 🟢`)
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...doReply(ctx)})
      else await ctx.reply(txt, doReply(ctx))
    }else{
      let meta=global.sessionMeta.get(myNums[0])||{}
      let txt=toSmallCaps(`you paired your number but its temporarily saved on the server\n\ndisconnected when: ${fmtTime(meta.disconnectedAt)}\npaired: ${pairedCount}\nstatus: stopped / offline 🔴`)
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...doReply(ctx)})
      else await ctx.reply(txt, doReply(ctx))
    }
  })

  bot.command('list', async (ctx)=>{
    if(ctx.chat.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
    if(ctx.chat.type!== 'private'){
      try{
        const mem=await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id)
        if(!['administrator','creator'].includes(mem.status)){
          return ctx.reply(toSmallCaps('only admins can use list command in group'), doReply(ctx))
        }
      }catch{
        return ctx.reply(toSmallCaps('only admins can use list command in group'), doReply(ctx))
      }
    }
    const chk=await ctx.reply(toSmallCaps(`🔎 requesting server information...`), doReply(ctx))
    await delay(800)
    try{
      let dirs=fs.readdirSync('./sessions').filter(d=>{
        try{
          const file='./sessions/'+d+'/creds.json'
          if(!fs.existsSync(file)) return false
          const creds=JSON.parse(fs.readFileSync(file,'utf8'))
          return creds.registered === true
        }catch{ return false }
      })
      if(ctx.chat.type==='private'){
        let myDb=loadTgSessions()
        let myNums=myDb[String(ctx.from.id)]||[]
        dirs=dirs.filter(d=>myNums.includes(d))
      }
      const total=dirs.length
      const connNow=dirs.filter(n=>global.subbots.has(n)).length
      let listText=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connNow}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connNow)}\n\n`
      if(dirs.length>0){
        listText+=`📋 ${toSmallCaps('connected numbers list:')}\n`
        dirs.forEach((n,i)=>{
          let status=global.subbots.has(n)?'🟢 online':'🔴 offline'
          listText+=`${i+1}. ${n} - ${status}\n`
        })
      }else{
        listText+=toSmallCaps('⚠️ no sessions found')
      }
      listText+=`\n\n𝚂𝙴𝚁𝚅𝙴𝚁(𝚂) 𝚁𝙴𝙰𝙳𝚈`
      await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,listText)
    }catch(e){
      const total=countUsers()
      const connNow=global.subbots.size
      const txt=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connNow}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connNow)}\n\n𝚂𝙴𝚁𝚅𝙴𝚁(𝚂) 𝚁𝙴𝙰𝙳𝚈`
      await ctx.reply(txt, doReply(ctx))
    }
  })

  bot.command('users', async (ctx)=>{
    if(ctx.chat.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
    const chk=await ctx.reply(toSmallCaps(`🔎 requesting server information...`), doReply(ctx))
    await delay(700)
    const total=countUsers()
    const connNow=getConnected()
    const txt=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connNow}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connNow)}`
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,txt) }catch{ await ctx.reply(txt, doReply(ctx)) }
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
    const txt=`🧑‍💻 𝐁𝐎𝐓 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑\n\n𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐓𝐇𝐄 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑\n𝐅𝐎𝐑 𝐀𝐍𝐘 𝐇𝐄𝐋𝐏 𝐎𝐑 𝐈𝐒𝐔𝐄`
    const kb=Markup.inlineKeyboard([[Markup.button.url('💬 Developer - STORM X',OWNER_LINK)]])
    await ctx.reply(txt,{...kb,...doReply(ctx)})
  }
  const creatorHandler=async (ctx)=>{
    if(ctx.chat.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
    const txt=`👑 𝐁𝐎𝐓 𝐂𝐑𝐄𝐀𝐓𝐎𝐑\n\n𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐓𝐇𝐄 𝐂𝐑𝐄𝐀𝐓𝐎𝐑\n𝐅𝐎𝐑 𝐁𝐔𝐒𝐈𝐍𝐄𝐒 & 𝐂𝐎𝐋𝐋𝐀𝐁`
    const kb=Markup.inlineKeyboard([[Markup.button.url('💬 Creator - STX',CREATOR_LINK)]])
    await ctx.reply(txt,{...kb,...doReply(ctx)})
  }

  bot.command('dev', devHandler)
  bot.command('owner', devHandler)
  bot.command('creator', creatorHandler)

  bot.command('disconnect', async (ctx)=>{
    if(ctx.chat.type === 'private' && !await isJoined(ctx)) return sendJoinLock(ctx)
    const n=ctx.message.text.split(' ')[1]?.replace(/[^0-9]/g,'')
    if(!n) return ctx.reply(`ℹ️ 𝚄𝚂𝙰𝙶𝙴\n\n/disconnect <number>`, doReply(ctx))
    let myDb=loadTgSessions()
    let myNums=myDb[String(ctx.from.id)]||[]
    if(!myNums.includes(n)) return ctx.reply(toSmallCaps(`❌ this number is not yours.`), doReply(ctx))
    const chk=await ctx.reply(toSmallCaps(`🔎 requesting server information...`), doReply(ctx))
    await delay(800)
    const exists=fs.existsSync('./sessions/'+n)
    if(!exists){
      try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,toSmallCaps(`⚠️ ɴᴏ sᴇssɪᴏɴ ғᴏᴜɴᴅ.`)) }catch{}
      return
    }
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,toSmallCaps(`✅️ session for ${n} found`)) }catch{}
    const kb=Markup.inlineKeyboard([[Markup.button.callback('✅ Confirm',`del_confirm_${n}`), Markup.button.callback('❌ Cancel',`del_cancel_${n}`)]])
    await ctx.reply(toSmallCaps(`do you want to disconnect ${n}?`),{...kb,...doReply(ctx)})
  })

  bot.action(/del_confirm_(.*)/, async (ctx)=>{
    const n=ctx.match[1]
    let myDb=loadTgSessions()
    let myNums=myDb[String(ctx.from.id)]||[]
    if(!myNums.includes(n)){
      await ctx.answerCbQuery(toSmallCaps('not your session'))
      return ctx.reply(toSmallCaps(`❌ you cannot delete another user's session.`), doReply(ctx))
    }
    try{
      if(global.subbots.has(n)){
        let s=global.subbots.get(n)
        try{ await s.logout() }catch{}
        try{ s.end?.() }catch{}
        try{ s.ws?.close?.() }catch{}
        global.subbots.delete(n)
        global.pairingInProgress.delete(n)
        await delay(1000)
      }
    }catch{}
    try{ fs.rmSync('./sessions/'+n,{recursive:true,force:true}) }catch{}
    try{
      let db=loadTgSessions()
      let arr=db[String(ctx.from.id)]||[]
      db[String(ctx.from.id)]=arr.filter(x=>x!==n)
      fs.mkdirSync('./database',{recursive:true})
      fs.writeFileSync(getTgSessionFile(), JSON.stringify(db,null,2))
    }catch{}
    global.sessionMeta.delete(n)
    await ctx.answerCbQuery(toSmallCaps('deleted'))
    try{ await ctx.deleteMessage() }catch{}
    await ctx.reply(toSmallCaps(`✅ session ${n} disconnected.`), doReply(ctx))
  })

  bot.action(/del_cancel_(.*)/, async (ctx)=>{
    await ctx.answerCbQuery(toSmallCaps('cancelled'))
    try{ await ctx.deleteMessage() }catch{}
    await ctx.reply(toSmallCaps(`❌ cancelled.`), doReply(ctx))
  })

  bot.action(/copy_(.*)/, async (ctx)=>{
    const code=ctx.match[1]
    await ctx.answerCbQuery(`📋 ${code} - ${toSmallCaps('long press the message to copy')}`, {show_alert:true})
  })

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
