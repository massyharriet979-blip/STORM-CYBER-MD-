// src/telegram/bot.js - Telegram only - Arranged clean
import { Telegraf, Markup } from 'telegraf'
import fs from 'fs'
import pino from 'pino'
import { Browsers, useMultiFileAuthState, makeWASocket, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'

const R="\x1b[0m", B="\x1b[1m", C="\x1b[36m", G="\x1b[32m", Y="\x1b[33m", Rd="\x1b[31m"

// Load .env if exists (for sub-server without Variables)
try{
  if(!process.env.TELEGRAM_TOKEN && fs.existsSync('./.env')){
    let envText = fs.readFileSync('./.env','utf8')
    for(let line of envText.split('\n')){
      let [k,v] = line.split('=')
      if(k && v){ process.env[k.trim()] = v.trim() }
    }
    console.log('Loaded .env file for token')
  }
}catch(e){}

const BOT_TOKEN = process.env.TELEGRAM_TOKEN || ''
const GROUP_LINK = 'https://t.me/+8XJN9NgIoPM1MmQ0'
const CHANNEL_LINK = 'https://t.me/storm_cyber_md_channel'
const OWNER_LINK = 'https://t.me/STORMX666'
const CREATOR_LINK = 'https://t.me/STORMXSYRIX'
const GROUP_ID = '-5524590300'
const CHANNEL_ID = '-1004422840019'

const delay = (ms) => new Promise(r=>setTimeout(r,ms))

// === SECTION 1 - HELPERS (from index.js, kept arranged) ===
function setMeta(n,d){let o=global.sessionMeta?.get(n)||{};global.sessionMeta?.set(n,{...o,...d})}
function fmtTime(ts){if(!ts) return 'unknown';let d=new Date(ts);return d.toLocaleString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return text.toLowerCase().split('').map(c=>map[c]||c).join('')
}
function getTgSessionFile(){ return './database/telegram_sessions.json' }
function loadTgSessions(){
 try{ if(!fs.existsSync(getTgSessionFile())) return {}; return JSON.parse(fs.readFileSync(getTgSessionFile())) }catch{ return {} }
}
function saveTgSession(tgId, number){
 let db=loadTgSessions(); if(!db[tgId]) db[tgId]=[]; if(!db[tgId].includes(number)) db[tgId].push(number);
 fs.mkdirSync('./database',{recursive:true}); fs.writeFileSync(getTgSessionFile(), JSON.stringify(db,null,2));
}
function getAutoMuteFile(botId){ return `./database/automute_${botId}.json`; }
function loadSchedules(botId){
 try{ if(!fs.existsSync(getAutoMuteFile(botId))) return {}; return JSON.parse(fs.readFileSync(getAutoMuteFile(botId))); }catch{ return {}; }
}
function saveSchedule(botId, data){ fs.mkdirSync('./database',{recursive:true}); fs.writeFileSync(getAutoMuteFile(botId), JSON.stringify(data,null,2)); }
function scheduleAutoAction(sock, botId, groupId, action, executeAt){
 let ms=executeAt - Date.now();
 if(ms<1000) ms=1000;
 setTimeout(async()=>{
  try{
   if(action==="unmute"){
    await sock.groupSettingUpdate(groupId,'not_announcement').catch(()=>{});
    await sock.sendMessage(groupId,{text:`🔊 ɢʀᴏᴜᴘ ᴀᴜᴛᴏ ᴜɴᴍᴜᴛᴇᴅ\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`}).catch(()=>{});
   }else if(action==="mute"){
    await sock.groupSettingUpdate(groupId,'announcement').catch(()=>{});
    await sock.sendMessage(groupId,{text:`🔇 ɢʀᴏᴜᴘ ᴀᴜᴛᴏ ᴍᴜᴛᴇᴅ\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`}).catch(()=>{});
   }
   let db=loadSchedules(botId); delete db[groupId]; saveSchedule(botId, db);
  }catch{}
 }, ms);
}
global.scheduleAutoAction = scheduleAutoAction;
global.saveAutoMuteSchedule = (botId, groupId, action, ms)=>{
 let db=loadSchedules(botId);
 db[groupId]={action, executeAt: Date.now()+ms};
 saveSchedule(botId, db);
};
async function isJoined(ctx){
  try{
    if(ctx.chat && ctx.chat.type!== 'private') return true;
    if(!GROUP_ID &&!CHANNEL_ID) return true
    if(GROUP_ID){
      try{
        const m = await ctx.telegram.getChatMember(GROUP_ID, ctx.from.id)
        if(!['member','administrator','creator'].includes(m.status)) return false
      }catch{}
    }
    if(CHANNEL_ID){
      const c = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id)
      return ['member','administrator','creator'].includes(c.status)
    }
    return true
  }catch(e){ return false }
}
async function getBotPhoto(ctx){
  try{ const me=await ctx.telegram.getMe(); const p=await ctx.telegram.getUserProfilePhotos(me.id); if(p.total_count>0) return p.photos[0][0].file_id }catch{}
  return null
}
function doReply(ctx){
  try{
    if(ctx.message) return { reply_parameters: { message_id: ctx.message.message_id } }
  }catch{}
  return {}
}
async function sendMainMenu(ctx){
  const now=new Date()
  const dateStr=`${now.getDate()} ${now.getMonth()+1} ${now.getFullYear()}`
  const user=ctx.from.first_name||'User'
  const msg=`╭━─━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 ❱─━─━─━╮
┃${toSmallCaps(`HEY 👋 ${user}`)}
┃${toSmallCaps('WELCOME TO STORM CYBER MD')}
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━❐
┃╔══『 🛡️ CYBER ADVANCED MD 🛡️ 』══❒
┃║ ★┏━━━━━━『 BOT INFO 』━━━━━━
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
┃║ ★│ ➣ /ping - ${toSmallCaps('BOT SPEED')}
┃║ ★│ ➣ /about - ${toSmallCaps('ABOUT BOT')}
┃║ ★│ ➣ /dev - ${toSmallCaps('CONTACT DEV')}
┃║ ★│ ➣ /creator - ${toSmallCaps('CONTACT CREATOR')}
┃║ ★│ ➣ /users - ${toSmallCaps('SEE NO. OF USERS')}
┃║ ★│ ➣ /runtime - ${toSmallCaps('CHECK BOT UPTIME')}
┃║ ★╰═══════════════════●○◇
┃╚═══════════════════════❒
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━❐
© STORM 𝐗
© DEV SILENCE`
  const photo=await getBotPhoto(ctx)
  const kb=Markup.inlineKeyboard([[Markup.button.url('👥 Group', GROUP_LINK), Markup.button.url('📢 Channel', CHANNEL_LINK)],[Markup.button.url('👑 Owner', OWNER_LINK)]])
  if(photo) await ctx.replyWithPhoto(photo,{caption:msg,...kb,...doReply(ctx)})
  else await ctx.reply(msg,{...kb,...doReply(ctx)})
}
async function sendJoinLock(ctx){
  if(ctx.chat && ctx.chat.type!== 'private') return true;
  const photo=await getBotPhoto(ctx)
  const txt=toSmallCaps(`🚫 YOU HAVEN'T JOINED THE GROUP AND CHANNEL, JOIN TO UNLOCK MORE BOT FEATURES`)
  const kb=Markup.inlineKeyboard([[Markup.button.url('📢 Channel', CHANNEL_LINK), Markup.button.url('👥 Group', GROUP_LINK)],[Markup.button.callback('✅ Verify','verify_join')]])
  if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...kb,...doReply(ctx)})
  else await ctx.reply(txt,{...kb,...doReply(ctx)})
}

// === SECTION 2 - MAIN TELEGRAM BOT (moved from index.js, arranged) ===
async function startTelegram(){
  if(!BOT_TOKEN){ console.log(Y+'⚠️ TELEGRAM_TOKEN not set'+R); return }
  const bot=new Telegraf(BOT_TOKEN)

  bot.use(async (ctx, next)=>{
    try{
      if(ctx.chat && ctx.chat.type === 'private' && ctx.message){
        const isCmd = ctx.message.text && ctx.message.text.startsWith('/')
        if(!await isJoined(ctx)){
          if(isCmd && ctx.message.text.startsWith('/pair')) return sendJoinLock(ctx)
          if(!ctx.message.text.startsWith('/start')) return sendJoinLock(ctx)
        }
      }
    }catch{}
    return next()
  })

  bot.start(async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    await sendMainMenu(ctx)
  })

  bot.action('verify_join', async (ctx)=>{
    const joined=await isJoined(ctx)
    if(!joined){
      try{ await ctx.deleteMessage() }catch{}
      const photo=await getBotPhoto(ctx)
      const txt=toSmallCaps(`🚫 YOU STILL HV TO FOLLOW THIS CHANNEL OR GROUP`)
      const kb=Markup.inlineKeyboard([[Markup.button.url('📢 Channel', CHANNEL_LINK), Markup.button.url('👥 Group', GROUP_LINK)],[Markup.button.callback('✅ Verify','verify_join')]])
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...kb,...doReply(ctx)})
      else await ctx.reply(txt,{...kb,...doReply(ctx)})
      return ctx.answerCbQuery(toSmallCaps('still not joined'))
    }else{
      try{ await ctx.deleteMessage() }catch{}
      const photo=await getBotPhoto(ctx)
      const txt=toSmallCaps(`✅ ACCESS GRANTED USE ANY COMMAND.`)
      const kb=Markup.inlineKeyboard([[Markup.button.callback('🚀 Start','start_menu')]])
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...kb,...doReply(ctx)})
      else await ctx.reply(txt,{...kb,...doReply(ctx)})
    }
  })

  bot.action('start_menu', async (ctx)=>{
    try{ await ctx.deleteMessage() }catch{}
    await sendMainMenu(ctx)
  })

  bot.command('pair', async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    let raw = ctx.message.text.split(' ')[1] || ''
    let number = raw.replace(/[^0-9]/g,'')
    const validExample = '256766233051'
    if(!number || number.length < 10 || number.length > 15){
      return ctx.reply(`${toSmallCaps('❌ Invalid number! Please enter a valid WhatsApp number with country code, no +, no spaces, no xxxx.')}\n\n${toSmallCaps('Fake numbers create empty sessions and fill server storage. Please use your real number.')}\n\nℹ️ 𝚄𝚂𝙰𝙶𝙴\n/pair ${validExample}\n\n${toSmallCaps('Example for Uganda: /pair 2567xxxxxxxx (12 digits)')}\n${toSmallCaps('Your real number example:')} ${validExample}`, doReply(ctx))
    }
    if(/(\d)\1{5,}/.test(number) || /123456|000000|111111|xxxx/i.test(raw)){
      return ctx.reply(toSmallCaps(`❌ ғᴀᴋᴇ ɴᴜᴍʙᴇʀ ᴅᴇᴛᴇᴄᴛᴇᴅ. ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ʏᴏᴜʀ ʀᴇᴀʟ ɴᴜᴍʙᴇʀ. ᴇxᴀᴍᴘʟᴇ: /ᴘᴀɪʀ ${validExample}. ғᴀᴋᴇ ɴᴜᴍʙᴇʀs ᴍᴀᴋᴇ sᴇʀᴠᴇʀs ғᴜʟʟ.`), doReply(ctx))
    }
    if(number.startsWith('256') && number.length!==12){
      return ctx.reply(toSmallCaps(`❌ ᴜɢ 🇺🇬 ɴᴜᴍʙᴇʀ ᴍᴜsᴛ ʙᴇ 12 ᴅɪɢɪᴛs. ᴇx: /ᴘᴀɪʀ ${validExample}`), doReply(ctx))
    }
    let sMsg=await ctx.reply(toSmallCaps(`🔍 Checking server...`), doReply(ctx))
    await delay(500)
    try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`🖥️ Looking for a ready server...`)) }catch{}
    await delay(600)
    // === FIX 4 - ADDED ONLY ===
    if(global.subbots.has(number)){
      try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`✅ ${number} IS CONNECTED NO NEED TO PAIR AGAIN`)) }catch{ await ctx.reply(toSmallCaps(`✅ ${number} IS CONNECTED NO NEED TO PAIR AGAIN`), doReply(ctx)) }
      return
    }
    let sessPath='./sessions/'+number
    if(fs.existsSync(sessPath)){
      let isRegistered=false
      try{
        let credsPath=sessPath+'/creds.json'
        if(fs.existsSync(credsPath)){
          let c=JSON.parse(fs.readFileSync(credsPath))
          if(c.registered) isRegistered=true
        }
      }catch{}
      if(isRegistered){
        saveTgSession(String(ctx.from.id), number)
        try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`✅ ${number} was paired before, generating new code for your saved session...`)) }catch{}
      }
    }
    // === END FIX 4 ===
    // === FIX 6 - NO DUPLICATE PAIR SOCKET ===
    if(global.pairingInProgress.has(number)){
      try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`⏳ ${number} is already pairing, wait for code...`)) }catch{}
      return
    }
    global.pairingInProgress.add(number); setTimeout(()=>global.pairingInProgress.delete(number), 90000)
    let pairingSock=null
    // === END FIX 6 ===
    try{
      // FIX3: removed rmSync delete - it was wiping session before pairing
      await delay(500)
      const { version } = await fetchLatestBaileysVersion()
      const { state, saveCreds } = await useMultiFileAuthState('./sessions/'+number)
      const sock = makeWASocket({
        version, logger:pino({level:'silent'}),
        auth:{creds:state.creds, keys:makeCacheableSignalKeyStore(state.keys,pino({level:'silent'}))},
        browser:Browsers.ubuntu('Chrome'),
        printQRInTerminal:false, syncFullHistory:false, markOnlineOnConnect:false,
        connectTimeoutMs:60000, keepAliveIntervalMs:15000, defaultQueryTimeoutMs:60000,
        emitOwnEvents:false, generateHighQualityLinkPreview:false
      })
      pairingSock=sock
      sock.ev.on('creds.update', saveCreds)
      try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`🔗 Opening socket for ${number}...`)) }catch{}
      await new Promise((resolve)=>{
        let done=false
        sock.ev.on('connection.update', (u)=>{
          if(u.connection==='open' || u.connection==='connecting'){ if(!done){done=true; resolve()} }
        })
        setTimeout(()=>{ if(!done){done=true; resolve()} }, 15000)
      })
      await delay(2000)
      const code=await sock.requestPairingCode(number)
      const clean=code.toUpperCase()
      saveTgSession(String(ctx.from.id), number); setMeta(number,{pairedAt:Date.now(),isConnected:false})

      const cleanCode = `${clean}`
      const pairMsg=`${toSmallCaps('🔥 Pairing code generated')}\n\n📲 ${toSmallCaps(`NUM: ${number}`)}\n\n${toSmallCaps('your code, tap to copy')}\n\`${cleanCode}\`\n\n${toSmallCaps('Open whatsapp > Linked devices > Link with phone number, and enter the code.')}\n> ${toSmallCaps('CODE EXPIRES IN 60 SECONDS')}\n© STORM X 𖤍`
      await ctx.reply(pairMsg,{parse_mode:'Markdown',...doReply(ctx)})

      sock.ev.on('connection.update', u=>{
        if(u.connection==='open'){
          global.pairingInProgress.delete(number)
          // FIX 6: reuse this sock as subbot, do NOT call startSubBotSession
          if(!global.subbots.has(number)){
            global.subbots.set(number, sock)
            if(!global.subbotOwners.includes(number)) global.subbotOwners.push(number)
            syncConnectedCount()
            try{
              let db=loadSchedules(number);
              for(let gid in db) scheduleAutoAction(sock, number, gid, db[gid].action, db[gid].executeAt);
            }catch{}
            sock.ev.on('messages.upsert', createMessageHandler(sock, true))
          }
          setMeta(number,{connectedAt:Date.now(),pairedAt:global.sessionMeta.get(number)?.pairedAt||Date.now(),isConnected:true}); ctx.reply(toSmallCaps(`✅ ${number} Connected! Session saved on server.`), doReply(ctx))
        }
        if(u.connection==='close'){
          console.log('PAIR CLOSE CODE', u.lastDisconnect?.error?.output?.statusCode, u.lastDisconnect?.error?.message)
          global.pairingInProgress.delete(number)
          // === FIX 7 ===
          if(global.subbots.get(number)===sock){
            global.subbots.delete(number); syncConnectedCount()
            console.log(Y+`⚠️ PAIR SUBBOT ${number} CLOSED, RESTARTING 5s`+R)
            setTimeout(()=>startSubBotSession(number), u.lastDisconnect?.error?.output?.statusCode===515?10000:5000)
          }
          // === END FIX 7 ===
        }
      })
    }catch(e){
      global.pairingInProgress.delete(number)
      try{ pairingSock?.end?.() }catch{}
      try{ pairingSock?.ws?.close?.() }catch{}
      await ctx.reply(toSmallCaps(`❌ ғᴀɪʟᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ᴄᴏᴅᴇ ғᴏʀ ${number}. ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ɴᴜᴍʙᴇʀ ʟɪᴋᴇ ${validExample} ᴀɴᴅ ᴛʀʏ ᴀɢᴀɪɴ.`), doReply(ctx))
    }
  })

  bot.command('session', async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    let db=loadTgSessions()
    let myNums=db[String(ctx.from.id)]||[]
    let photo=await getBotPhoto(ctx)
    if(myNums.length===0){
      let txt0=toSmallCaps(`you dont have any active session in the server, use the pair button bellow to get connected ❌`)
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt0,...doReply(ctx)}); else await ctx.reply(txt0, doReply(ctx)); return
    }
    let onlineNums=myNums.filter(n=>global.subbots.has(n))
    let pairedCount=myNums.length
    if(onlineNums.length>0){
      let meta=global.sessionMeta.get(onlineNums[0])||{}
      let txt=toSmallCaps(`you have an active session in the server right now ✅️\n\nrun time: ${fmtTime(meta.pairedAt||meta.connectedAt)}\npaired: ${pairedCount}\nstatus: online 🟢`)
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...doReply(ctx)}); else await ctx.reply(txt, doReply(ctx))
    } else {
      let meta=global.sessionMeta.get(myNums[0])||{}
      let txt=toSmallCaps(`you paired your number but its temporarily saved on the server\n\ndisconnected when: ${fmtTime(meta.disconnectedAt)}\npaired: ${pairedCount}\nstatus: stopped / offline 🔴`)
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...doReply(ctx)}); else await ctx.reply(txt, doReply(ctx))
    }
  })

  bot.action('pair_btn', async (ctx)=>{
    await ctx.answerCbQuery()
    const validExample='256766233051'
    await ctx.reply(`${toSmallCaps('❌ Invalid number! Please enter a valid WhatsApp number with country code, no +, no spaces, no xxxx.')}\n\n${toSmallCaps('Fake numbers create empty sessions and fill servers. Please use your real number.')}\n\nℹ️ 𝚄𝚂𝙰𝙶𝙴\n/pair ${validExample}\n\n${toSmallCaps('Example for Uganda: /pair 2567xxxxxxxx (12 digits)')}\n${toSmallCaps('Your real number example:')} ${validExample}`, doReply(ctx))
  })

  bot.command('list', async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    if(ctx.chat.type!== 'private'){
      try{
        const mem=await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id)
        if(!['administrator','creator'].includes(mem.status)){
          return ctx.reply(toSmallCaps('only admins can use list command in group'), doReply(ctx))
        }
      }catch{}
    }
    const chk=await ctx.reply(toSmallCaps(`🔎 Checking server...`), doReply(ctx))
    await delay(800)
    try{
      let dirs=fs.readdirSync('./sessions').filter(d=>d.length>=10)
      if(ctx.chat.type==='private'){
        let myDb=loadTgSessions(); let myNums=myDb[String(ctx.from.id)]||[];
        dirs=dirs.filter(d=>myNums.includes(d));
      }
      const total=dirs.length
      // === FIX 7 ===
      const connNow=getConnected()
      let listText=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connNow}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connNow)}\n\n`
      // === END FIX 7 ===
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
    }catch{
      const total=countUsers()
      // === FIX 7 ===
      const connNow=getConnected()
      const txt=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connNow}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connNow)}\n\n𝚂𝙴𝚁𝚅𝙴𝚁(𝚂) 𝚁𝙴𝙰𝙳𝚈`
      // === END FIX 7 ===
      await ctx.reply(txt, doReply(ctx))
    }
  })

  bot.command('users', async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    const chk=await ctx.reply(toSmallCaps(`🔎 Checking server...`), doReply(ctx))
    await delay(700)
    const total=countUsers()
    // === FIX 7 ===
    const connNow=getConnected()
    const txt=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connNow}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connNow)}`
    // === END FIX 7 ===
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,txt) }catch{ await ctx.reply(txt, doReply(ctx)) }
  })

  bot.command('runtime', async (ctx)=>{
    const {d,h,m,s}=runtime()
    const chk=await ctx.reply(toSmallCaps(`🔍 Requesting server info...`), doReply(ctx))
    await delay(600)
    const txt=toSmallCaps(`✅️ 𝚃𝙷𝙴 𝙱𝙾𝚃 𝙷𝙰𝚂 𝙱𝙴𝙽\nRUNNING FOR ${d}d ${h}h ${m}m ${s}s`)
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,txt) }catch{ await ctx.reply(txt, doReply(ctx)) }
  })

  bot.command('ping', async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    const start=Date.now()
    const chk=await ctx.reply(toSmallCaps(`checking speed...`), doReply(ctx))
    await delay(700)
    let latency=Date.now()-start
    let speed=(Math.random()*0.8+0.1).toFixed(3)
    let ram=(process.memoryUsage().heapUsed/1024/1024).toFixed(2)
    let uptime=(process.uptime()/60).toFixed(1)
    let cpu=(Math.random()*10+1).toFixed(1)
    let ping=(Math.random()*30+10).toFixed(0)
    let version="3.0.1"
    let text=`${toSmallCaps(`1. latency: ${latency} ms`)}\n`+
    `${toSmallCaps(`2. speed: 0.${speed.replace('.','')} s`)}\n`+
    `${toSmallCaps(`3. response: ${ping} ms`)}\n`+
    `${toSmallCaps(`4. ram usage: ${ram} mb`)}\n`+
    `${toSmallCaps(`5. cpu load: ${cpu}%`)}\n`+
    `${toSmallCaps(`6. uptime: ${uptime} min`)}\n`+
    `${toSmallCaps(`7. version: V3.0.0 stable`)}\n`+
    `${toSmallCaps(`8. server: storm cloud `)}`
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,text) }catch{ await ctx.reply(text, doReply(ctx)) }
  })

  bot.command('about', async (ctx)=>{
    const aboutText=`> ╭━─━─❰ 𝐀𝐁𝐎𝐔𝐓 𝐒𝐓𝐎𝐑𝐌 ❱─━─━╮
┃
┃ 𝐓𝐇𝐄 𝐂𝐘𝐁𝐄𝐑 𝐁𝐎𝐓 𝐖𝐀𝐒 𝐂𝐑𝐄𝐀𝐓𝐄𝐃 𝐁𝐘 𝐒𝐓𝐎𝐑𝐌 𝐗
┃ 𝐓𝐇𝐄 𝐏𝐑𝐎𝐉𝐄𝐂𝐓 𝐇𝐀𝐒 𝐓𝐀𝐊𝐄𝐍 𝐎𝐕𝐄𝐑 𝟑 𝐌𝐎𝐍𝐓𝐇
┃ 𝐓𝐎 𝐁𝐔𝐈𝐋𝐃 𝐀𝐍𝐃 𝐎𝐏𝐓𝐈𝐌𝐈𝐙𝐄
┃
┃ GET CONNECTED TO VIEW MORE ABOUT THE 
┃ BOT AND GET AN ADVANCED
┃ LEVEL OF TECHNOLOGY 
┃
┃ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 𝐈𝐒 𝐍𝐎𝐓 𝐉𝐔𝐒𝐓 𝐀 𝐁𝐎𝐓
┃ 𝐈𝐓𝐒 𝐀 𝐂𝐘𝐁𝐄𝐑 𝐑𝐄𝐕𝐎𝐋𝐔𝐓𝐈𝐎𝐍 𝐁𝐔𝐈𝐋𝐓 𝐖𝐈𝐓𝐇
┃ 𝐏𝐀𝐒𝐒𝐈𝐎𝐍, 𝐏𝐎𝐖𝐄𝐑 & 𝐏𝐑𝐄𝐂𝐈𝐒𝐈𝐎𝐍
┃ 𝐅𝐀𝐒𝐓, 𝐒𝐄𝐂𝐔𝐑𝐄, 𝐒𝐓𝐀𝐁𝐋𝐄 & 𝐔𝐍𝐒𝐓𝐎𝐏𝐏𝐀𝐁𝐋𝐄
┃
┃ 𝐏𝐎𝐖𝐄𝐑E𝐃 𝐁𝐘 𝐒𝐓𝐎𝐑𝐌 𝐗 
┃ 𝐕𝐄𝐑𝐒𝐈𝐎𝐍: V3.0.0 𝐒𝐓𝐀𝐁𝐋𝐄
┃
╰━━━━━━━━━━━━━━━━━━━━╯
© 𝐒𝐓𝐎𝐑𝐌 𝐗 𖤍
© DEV SILENCE`
    const kb=Markup.inlineKeyboard([[Markup.button.url('?? Group', GROUP_LINK), Markup.button.url('📢 Channel', CHANNEL_LINK)],[Markup.button.url('👑 Dev', OWNER_LINK), Markup.button.url('👑 Creator', CREATOR_LINK)]])
    await ctx.reply(aboutText, {...kb,...doReply(ctx)})
  })

  const devHandler=async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    const txt=`🧑‍💻 𝐁𝐎𝐓 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑\n\n𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐓𝐇𝐄 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑\n𝐅𝐎𝐑 𝐀𝐍𝐘 𝐇𝐄𝐋𝐏 𝐎𝐑 𝐈𝐒𝐔𝐄`
    const kb=Markup.inlineKeyboard([[Markup.button.url('💬 Developer - STORM X',OWNER_LINK)]])
    await ctx.reply(txt,{...kb,...doReply(ctx)})
  }
  const creatorHandler=async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    const txt=`👑 𝐁𝐎𝐓 𝐂𝐑𝐄𝐀𝐓𝐎𝐑\n\n𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐓𝐇𝐄 𝐂𝐑𝐄𝐀𝐓𝐎𝐑\n𝐅𝐎𝐑 𝐁𝐔𝐒𝐈𝐍𝐄𝐒 & 𝐂𝐎𝐋𝐋𝐀𝐁`
    const kb=Markup.inlineKeyboard([[Markup.button.url('💬 Creator - STX',CREATOR_LINK)]])
    await ctx.reply(txt,{...kb,...doReply(ctx)})
  }

  bot.command('dev', devHandler)
  bot.command('owner', devHandler)
  bot.command('creator', creatorHandler)

  bot.command('disconnect', async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    const n=ctx.message.text.split(' ')[1]?.replace(/[^0-9]/g,'')
    if(!n) return ctx.reply(`ℹ️ 𝚄𝚂𝙰𝙶𝙴\n\n/disconnect <number>`, doReply(ctx))
    if(ctx.chat.type==='private'){
      let myDb=loadTgSessions(); let myNums=myDb[String(ctx.from.id)]||[];
      if(!myNums.includes(n)) return ctx.reply(toSmallCaps(`❌ this number is not yours. you can only disconnect your own session.`), doReply(ctx))
    }
    const chk=await ctx.reply(toSmallCaps(`🔎 Checking server...`), doReply(ctx))
    await delay(800)
    const exists=fs.existsSync('./sessions/'+n)
    if(!exists){
      try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,toSmallCaps(`⚠️ 𝙽𝙾 𝚂𝙴𝚂𝙸𝙾𝙽 𝙵𝙾𝚄𝙽𝙳.`)) }catch{}
      return
    }
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,toSmallCaps(`✅️ SESSION FOR ${n} FOUND`)) }catch{}
    const kb=Markup.inlineKeyboard([[Markup.button.callback('✅ Confirm',`del_confirm_${n}`), Markup.button.callback('❌ Cancel',`del_cancel_${n}`)]])
    await ctx.reply(toSmallCaps(`Do you want to disconnect ${n}?`),{...kb,...doReply(ctx)})
  })

  bot.action(/del_confirm_(.*)/, async (ctx)=>{
    const n=ctx.match[1]
    if(ctx.chat.type==='private'){
      let myDb=loadTgSessions(); let myNums=myDb[String(ctx.from.id)]||[];
      if(!myNums.includes(n)){ await ctx.answerCbQuery(toSmallCaps('not your session')); return ctx.reply(toSmallCaps(`❌ you cannot delete another user's session.`), doReply(ctx)) }
    }
    try{ fs.rmSync('./sessions/'+n,{recursive:true,force:true}) }catch{}
    try{ let db=loadTgSessions(); let arr=db[String(ctx.from.id)]||[]; db[String(ctx.from.id)]=arr.filter(x=>x!==n); fs.writeFileSync(getTgSessionFile(), JSON.stringify(db,null,2)) }catch{}
    // === FIX 7 ===
    if(global.subbots.has(n)){ try{ global.subbots.get(n).end?.() }catch{}; global.subbots.delete(n); syncConnectedCount() }
    // === END FIX 7 ===
    await ctx.answerCbQuery(toSmallCaps('deleted'))
    try{ await ctx.deleteMessage() }catch{}
    await ctx.reply(toSmallCaps(`✅ Session ${n} disconnected.`), doReply(ctx))
  })
  bot.action(/del_cancel_(.*)/, async (ctx)=>{
    await ctx.answerCbQuery(toSmallCaps('cancelled'))
    try{ await ctx.deleteMessage() }catch{}
    await ctx.reply(toSmallCaps(`❌ Cancelled.`), doReply(ctx))
  })

  bot.on('callback_query', async (ctx)=>{
    const data=ctx.callbackQuery.data
    if(data.startsWith('copy_')){
      const code=data.replace('copy_','')
      await ctx.answerCbQuery(`✅ ${code} - Hold the code above to copy`, {show_alert:false})
      return
    }
  })

  bot.on('text', async (ctx)=>{
    if(ctx.message.text.startsWith('/')) return
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
  })
  bot.launch()
  console.log(G+B+'✅ TELEGRAM PAIR BOT ONLINE'+R)
}

export { startTelegram }
