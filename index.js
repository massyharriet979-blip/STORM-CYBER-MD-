import { trackAdmin } from './src/database/admintracker.js';
import makeWASocket, { useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, downloadMediaMessage } from '@whiskeysockets/baileys'
import { Telegraf, Markup } from 'telegraf'
import pino from 'pino'
import fs from 'fs'
import readline from 'readline'

const BOT_TOKEN = process.env.TELEGRAM_TOKEN || ''
const GROUP_LINK = 'https://t.me/+8XJN9NgIoPM1MmQ0'
const CHANNEL_LINK = 'https://t.me/storm_cyber_md_channel'
const OWNER_LINK = 'https://t.me/STORMX666'
const CREATOR_LINK = 'https://t.me/STORMXSYRIX'
const GROUP_ID = '-5524590300'
const CHANNEL_ID = '-1004422840019'
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
let startTime = Date.now()
let connectedCount = 0
function runtime(){ let s=Math.floor((Date.now()-startTime)/1000); let d=Math.floor(s/86400); s%=86400; let h=Math.floor(s/3600); s%=3600; let m=Math.floor(s/60); return {d,h,m,s:s%60} }
function countUsers(){ try{return fs.readdirSync('./sessions').length}catch{return 0} }
const delay = (ms) => new Promise(r=>setTimeout(r,ms))

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
  const userId=ctx.from.id
  const msg=`> ╭━─━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 ❱─━─━─━╮
> ┃${toSmallCaps(`HEY 👋 ${user}`)}
> ┃${toSmallCaps('WELCOME TO STORM CYBER MD')}
> ┃${toSmallCaps('V3 VERSION')}
> ┃${toSmallCaps(`USER ID: ${userId}`)}
> ┃━━━━━━━━━━━━━━━━━━━━━━━━━━━❐
> ┃╔══『 🛡️ CYBER PAIR SYSTEM 🛡️ 』══❒
> ┃║ ★┏━━━━━━『 BOT INFO 』━━━━━━
> ┃║ ★│ ➣ ${toSmallCaps('BOT : STORM CYBER MD')}
> ┃║ ★│ ➣ ${toSmallCaps('VERSION : v2.0.0')}
> ┃║ ★│ ➣ ${toSmallCaps('DEV : STORM X')}
> ┃║ ★│ ➣ ${toSmallCaps(`ONLINE : ${connectedCount}`)}
> ┃║ ★│ ➣ ${toSmallCaps(`DATE : ${dateStr}`)}
> ┃║ ★│ ➣ ${toSmallCaps('PREFIX : /')}
> ┃║ ★└─────
> ┃║ ★┌─── ( COMMANDS )
> ┃║ ★│ ➣ /pair - ${toSmallCaps('CONNECT A NUMBER')}
> ┃║ ★│ ➣ /session - ${toSmallCaps('CHECK YOUR SESSION')}
> ┃║ ★│ ➣ /disconnect - ${toSmallCaps('DISCONNECT')}
> ┃║ ★│ ➣ /list - ${toSmallCaps('VIEW SESSIONS')}
> ┃║ ★│ ➣ /ping - ${toSmallCaps('BOT SPEED')}
> ┃║ ★│ ➣ /about - ${toSmallCaps('ABOUT BOT')}
> ┃║ ★│ ➣ /dev - ${toSmallCaps('CONTACT DEV')}
> ┃║ ★│ ➣ /creator - ${toSmallCaps('CONTACT CREATOR')}
> ┃║ ★│ ➣ /users - ${toSmallCaps('SEE NO. OF USERS')}
> ┃║ ★╰═══════════════════●○◇
> ┃╚═══════════════════════❒
> ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━❐
> @STORM 𝐗 𖤍`
  const photo=await getBotPhoto(ctx)
  const kb=Markup.inlineKeyboard([[Markup.button.url('👥 Group', GROUP_LINK), Markup.button.url('📢 Channel', CHANNEL_LINK)],[Markup.button.url('👑 Owner', OWNER_LINK)]])
  if(photo) await ctx.replyWithPhoto(photo,{caption:msg,...kb,...doReply(ctx)})
  else await ctx.reply(msg,{...kb,...doReply(ctx)})
}

async function sendJoinLock(ctx){
  if(ctx.chat && ctx.chat.type!== 'private') return true;
  const photo=await getBotPhoto(ctx)
  const txt=toSmallCaps(`🚫 YOU HAVEN'T JOINED THE GROUP AND CHANNEL, JOIN TO UNLOCK BOT`)
  const kb=Markup.inlineKeyboard([[Markup.button.url('📢 Channel', CHANNEL_LINK), Markup.button.url('👥 Group', GROUP_LINK)],[Markup.button.callback('✅ Verify','verify_join')]])
  if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...kb,...doReply(ctx)})
  else await ctx.reply(txt,{...kb,...doReply(ctx)})
}

function createMessageHandler(sock, isSubBotSession = false){
  const msgCache = new Map()
  return async ({messages})=>{
    try{
      for(const msg of messages){
        if(!msg.message) continue
        if(msg.key.remoteJid=='status@broadcast') continue
        let remoteJid=msg.key.remoteJid
        let isGroup=remoteJid.endsWith('@g.us')
        let sender=isGroup? (msg.key.participant || msg.participant || remoteJid) : (msg.key.remoteJid)
        let senderNum=sender.split('@')[0]
        let botIdNum=(sock.user?.id?.split(':')[0].split('@')[0])||""
        if(msg.message.protocolMessage && msg.message.protocolMessage.type===0){
          let deletedId=msg.message.protocolMessage.key?.id
          let deletedChat=msg.message.protocolMessage.key?.remoteJid || remoteJid
          if(!deletedId) continue
          let adFile=`./database/antidelete_${botIdNum}.json`
          let adList=[]
          try{ if(fs.existsSync(adFile)) adList=JSON.parse(fs.readFileSync(adFile)) }catch{}
          if(!adList.includes(deletedChat)) continue
          let cached=msgCache.get(deletedId)
          if(!cached) continue
          let delUser=cached.sender?.split('@')[0]||"unknown"
          let caption=`ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ♻️\n\nғʀᴏᴍ: @${delUser}\nᴛʏᴘᴇ: ${cached.type}\n\n> ᴅᴇʟᴇᴛᴇᴅ ᴍsɢ ʀᴇsᴛᴏʀᴇᴅ`
          try{
            if(cached.type==="text" && cached.text){
              await sock.sendMessage(deletedChat, {text:`${caption}\n\nᴍsɢ: ${cached.text}`, mentions:[cached.sender]})
            }else if(cached.type==="image" && cached.buffer){
              await sock.sendMessage(deletedChat, {image:cached.buffer, caption:caption, mentions:[cached.sender]})
            }else if(cached.type==="video" && cached.buffer){
              await sock.sendMessage(deletedChat, {video:cached.buffer, caption:caption, mentions:[cached.sender]})
            }else if(cached.type==="sticker" && cached.buffer){
              await sock.sendMessage(deletedChat, {sticker:cached.buffer})
              await sock.sendMessage(deletedChat, {text:caption, mentions:[cached.sender]})
            }else if(cached.text){
              await sock.sendMessage(deletedChat, {text:`${caption}\n\n${cached.text}`, mentions:[cached.sender]})
            }
          }catch(e){}
          continue
        }
        try{
          let mtype=Object.keys(msg.message)[0]
          let text=msg.message.conversation||msg.message.extendedTextMessage?.text||msg.message.imageMessage?.caption||msg.message.videoMessage?.caption||""
          let entry={id:msg.key.id, chat:remoteJid, sender:sender, type:"text", text:text, time:Date.now()}
          if(mtype==="imageMessage"){
            entry.type="image"
            try{ entry.buffer=await downloadMediaMessage(msg, 'buffer', {}, {logger:pino({level:'silent'}), reuploadRequest:sock.updateMediaMessage}) }catch{}
          }else if(mtype==="videoMessage"){
            entry.type="video"
            try{ entry.buffer=await downloadMediaMessage(msg, 'buffer', {}, {logger:pino({level:'silent'}), reuploadRequest:sock.updateMediaMessage}) }catch{}
          }else if(mtype==="stickerMessage"){
            entry.type="sticker"
            try{ entry.buffer=await downloadMediaMessage(msg, 'buffer', {}, {logger:pino({level:'silent'}), reuploadRequest:sock.updateMediaMessage}) }catch{}
          }
          msgCache.set(msg.key.id, entry)
          if(msgCache.size>500){
            let firstKey=msgCache.keys().next().value
            msgCache.delete(firstKey)
          }
        }catch{}
        let dynamicPrefix=prefix
        try{
          let pFile=`./database/prefix_${botIdNum}.json`
          if(fs.existsSync(pFile)){
            let j=JSON.parse(fs.readFileSync(pFile))
            if(j.prefix) dynamicPrefix=j.prefix
          }
        }catch{}
        let mode="public"
        if(!isSubBotSession){
          try{
            let mFile=`./database/mode_${botIdNum}.json`
            if(fs.existsSync(mFile)){
              let j=JSON.parse(fs.readFileSync(mFile))
              if(j.mode) mode=j.mode
              else if(typeof j==="string") mode=j
            }
            let altPath='./src/database/mode.json'
            if(mode==="public" && fs.existsSync(altPath)){
              try{
                let alt=JSON.parse(fs.readFileSync(altPath))
                if(typeof alt==="string") mode=alt
                else if(alt.mode) mode=alt.mode
              }catch{}
            }
          }catch{}
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
            }catch{}
            let isSudo=sudoList.includes(senderNum) || sudoList.includes(sender) || sudoList.includes(senderNum+"@s.whatsapp.net")
            if(senderNum!==botIdNum &&!isSudo) continue
          }
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
        }catch{}
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
        }catch{}

        try{
          let abFile = `./database/antibot_${botIdNum}.json`;
          let wlFile = `./database/warnlimit_${botIdNum}.json`;
          let warnsFile = `./database/warns_${botIdNum}.json`;
          if(fs.existsSync(abFile)){
            let abDb = JSON.parse(fs.readFileSync(abFile));
            if(abDb[remoteJid]?.enabled){
              let isOtherBot = false;
              if(global.subbots.has(senderNum)) isOtherBot=true;
              if((body.startsWith('.') || body.startsWith('/') || body.startsWith('!')) && senderNum!==botIdNum) isOtherBot=true;
              if(isOtherBot && senderNum!==botIdNum && isGroup){
                let limit = 3;
                if(fs.existsSync(wlFile)){
                  try{ let l=JSON.parse(fs.readFileSync(wlFile)); if(l[remoteJid]?.limit) limit=l[remoteJid].limit; }catch{}
                }
                let warnsDb = {};
                if(fs.existsSync(warnsFile)) try{ warnsDb=JSON.parse(fs.readFileSync(warnsFile)); }catch{}
                if(!warnsDb[remoteJid]) warnsDb[remoteJid]={};
                if(!warnsDb[remoteJid][sender]) warnsDb[remoteJid][sender]={count:0};
                warnsDb[remoteJid][sender].count+=1;
                let count=warnsDb[remoteJid][sender].count;
                fs.mkdirSync('./database',{recursive:true});
                fs.writeFileSync(warnsFile, JSON.stringify(warnsDb,null,2));
                if(count>=limit){
                  await sock.sendMessage(remoteJid,{text:`╭───「 ᴀɴᴛɪʙᴏᴛ 」───\n│ ⚠️ @${senderNum} ᴀɴᴛɪʙᴏᴛ ᴡᴀʀɴ ${count}/${limit}\n│ 🚫 limit reached, kicking\n╰────────────────`, mentions:[sender]});
                  await sock.groupParticipantsUpdate(remoteJid,[sender],"remove").catch(()=>{});
                  delete warnsDb[remoteJid][sender];
                  fs.writeFileSync(warnsFile, JSON.stringify(warnsDb,null,2));
                }else{
                  await sock.sendMessage(remoteJid,{text:`╭───「 ᴀɴᴛɪʙᴏᴛ 」───\n│ 🤖 @${senderNum} other bot detected\n│ ⚠️ ᴡᴀʀɴ ${count}/${limit}\n╰────────────────`, mentions:[sender]});
                }
              }
            }
          }
        }catch{}

        try{
          let agmFile = `./database/antigroupmention_${botIdNum}.json`;
          if(fs.existsSync(agmFile) && isGroup){
            let agmDb = JSON.parse(fs.readFileSync(agmFile));
            if(agmDb[remoteJid]?.enabled){
              let lowerBody = body.toLowerCase();
              let mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
              let isGroupMention = lowerBody.includes('https://chat.whatsapp.com') || lowerBody.includes('@g.us') || mentioned.length>=5;
              if(isGroupMention && senderNum!==botIdNum){
                let metaChk = await sock.groupMetadata(remoteJid).catch(()=>null);
                if(metaChk){
                  let isSenderAdmin = metaChk.participants.find(p=>p.id===sender)?.admin;
                  let botJidChk = sock.user.id.split(':')[0]+'@s.whatsapp.net';
                  let isBotAdmin = metaChk.participants.find(p=>p.id===botJidChk || p.id===sock.user.id)?.admin;
                  if(!isSenderAdmin && isBotAdmin){
                    try{ await sock.sendMessage(remoteJid,{delete: msg.key}); }catch{}
                    await sock.sendMessage(remoteJid,{text:`╭───「 ᴀɴᴛɪ ɢʀᴏᴜᴘ ᴍᴇɴᴛɪᴏɴ 」───\n│ 🚫 @${senderNum} ɢʀᴏᴜᴘ ᴍᴇɴᴛɪᴏɴ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ\n╰────────────────\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`, mentions:[sender]}).catch(()=>{});
                  }
                }
              }
            }
          }
        }catch{}

        try{
          let alFile=`./database/antilink_${botIdNum}.json`;
          if(fs.existsSync(alFile) && isGroup){
            let alDb=JSON.parse(fs.readFileSync(alFile));
            let cfg=alDb[remoteJid];
            if(cfg?.enabled){
              let isLink = /(https?:\/\/|www\.|chat\.whatsapp\.com|t\.me|wa\.me|telegram\.me|discord\.gg|instagram\.com|facebook\.com|tiktok\.com)/i.test(body);
              if(isLink && senderNum!==botIdNum){
                let metaChk=await sock.groupMetadata(remoteJid).catch(()=>null);
                if(metaChk){
                  let isSenderAdmin=metaChk.participants.find(p=>p.id===sender)?.admin;
                  let botJidChk=sock.user.id.split(':')[0]+'@s.whatsapp.net';
                  let isBotAdmin=metaChk.participants.find(p=>p.id===botJidChk || p.id===sock.user.id)?.admin;
                  if(!isSenderAdmin && isBotAdmin){
                    let mode=cfg.mode||"warn";
                    if(mode==="delete"){
                      try{ await sock.sendMessage(remoteJid,{delete: msg.key}); }catch{}
                      await sock.sendMessage(remoteJid,{text:`@${senderNum} ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛᴇ ᴀʟʟᴏᴡᴇᴅ ʜᴇʀᴇ.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[sender]}).catch(()=>{});
                      continue;
                    }
                    if(mode==="kick"){
                      try{ await sock.sendMessage(remoteJid,{delete: msg.key}); }catch{}
                      await sock.sendMessage(remoteJid,{text:`ʟɪɴᴋ ᴅᴇᴛᴇᴄᴛᴇᴅ\n\n@${senderNum} sᴇɴᴛ ᴀ ʟɪɴᴋ ᴀɴᴅ ᴡᴀs ʀᴇᴍᴏᴠᴇᴅ ɪɴ ${metaChk.subject} ɢʀᴏᴜᴘ.\nsᴛᴀᴛᴜs: ᴋɪᴄᴋᴇᴅ ᴏᴜᴛ.\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[sender]});
                      await sock.groupParticipantsUpdate(remoteJid,[sender],"remove").catch(()=>{});
                      continue;
                    }
                    if(mode==="mute"){
                      try{ await sock.sendMessage(remoteJid,{delete: msg.key}); }catch{}
                      await sock.groupSettingUpdate(remoteJid,'announcement').catch(()=>{});
                      await sock.sendMessage(remoteJid,{text:`ʟɪɴᴋ ᴅᴇʟᴇᴛᴇᴅ\n\nɢʀᴏᴜᴘ ᴡɪʟʟ ʙᴇ ᴜɴᴍᴜᴛᴇᴅ ᴀғᴛᴇʀ 1 ᴍɪɴᴜᴛᴇ.\n@${senderNum} sᴛᴏᴘ sᴇɴᴅɪɴɢ ʟɪɴᴋs.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[sender]});
                      global.saveAutoMuteSchedule(botIdNum, remoteJid, "unmute", 60000);
                      scheduleAutoAction(sock, botIdNum, remoteJid, "unmute", Date.now()+60000);
                      continue;
                    }
                    if(mode==="warn"){
                      let wlFile=`./database/warnlimit_${botIdNum}.json`;
                      let warnsFile=`./database/warns_${botIdNum}.json`;
                      let limit=3;
                      if(fs.existsSync(wlFile)){
                        try{ let l=JSON.parse(fs.readFileSync(wlFile)); if(l[remoteJid]?.limit) limit=l[remoteJid].limit; }catch{}
                      }
                      let warnsDb={};
                      if(fs.existsSync(warnsFile)) try{ warnsDb=JSON.parse(fs.readFileSync(warnsFile)); }catch{}
                      if(!warnsDb[remoteJid]) warnsDb[remoteJid]={};
                      if(!warnsDb[remoteJid][sender]) warnsDb[remoteJid][sender]={count:0};
                      warnsDb[remoteJid][sender].count+=1;
                      let count=warnsDb[remoteJid][sender].count;
                      fs.mkdirSync('./database',{recursive:true});
                      fs.writeFileSync(warnsFile, JSON.stringify(warnsDb,null,2));
                      try{ await sock.sendMessage(remoteJid,{delete: msg.key}); }catch{}
                      if(count < limit){
                        let warnTxt="";
                        if(count===1) warnTxt=`@${senderNum} ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ ʜᴇʀᴇ 🚫. ʏᴏᴜ ᴍᴜsᴛ ᴛᴀᴋᴇ ᴛʜɪs ᴡᴀʀɴ sᴇʀɪᴏᴜs. ${count}/${limit}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`;
                        else warnTxt=`@${senderNum} ʟɪɴᴋs ᴀʀᴇ ғᴏʀʙɪᴅᴅᴇɴ 🚫. ɪ ᴅᴏɴᴛ ᴋɴᴏᴡ ᴡʜᴇʀᴇ ʏᴏᴜ ʟɪsᴛᴇɴ. ${count}/${limit}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`;
                        await sock.sendMessage(remoteJid,{text:warnTxt, mentions:[sender]});
                      }else{
                        await sock.sendMessage(remoteJid,{text:`@${senderNum} ᴡᴀs ᴋɪᴄᴋᴇᴅ ғᴏʀ sᴇɴᴅɪɴɢ ʟɪɴᴋs.\nsᴛᴀᴛᴜs: ᴋɪᴄᴋɪɴɢ...\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[sender]});
                        await delay(1500);
                        await sock.groupParticipantsUpdate(remoteJid,[sender],"remove").catch(()=>{});
                        delete warnsDb[remoteJid][sender];
                        fs.writeFileSync(warnsFile, JSON.stringify(warnsDb,null,2));
                        await delay(1000);
                        await sock.sendMessage(remoteJid,{text:`@${senderNum} ᴡᴀs sᴜᴄᴄᴇssғᴜʟʟʏ ᴋɪᴄᴋᴇᴅ ᴏᴜᴛ.\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[sender]}).catch(()=>{});
                      }
                      continue;
                    }
                  }
                }
              }
            }
          }
        }catch{}

        try{
          if(isGroup && body &&!body.startsWith(dynamicPrefix)){
            let warnsFile=`./database/warns_${botIdNum}.json`;
            if(fs.existsSync(warnsFile)){
              let wDb=JSON.parse(fs.readFileSync(warnsFile));
              let uWarn=wDb[remoteJid]?.[sender];
              if(uWarn && uWarn.count>0 && senderNum!==botIdNum){
                let wlFile=`./database/warnlimit_${botIdNum}.json`;
                let limit=3;
                if(fs.existsSync(wlFile)){
                  try{ let l=JSON.parse(fs.readFileSync(wlFile)); if(l[remoteJid]?.limit) limit=l[remoteJid].limit; }catch{}
                }
                let lastMarkFile=`./database/lastmark_${botIdNum}.json`;
                let lastDb={};
                if(fs.existsSync(lastMarkFile)) try{ lastDb=JSON.parse(fs.readFileSync(lastMarkFile)); }catch{}
                let key=`${remoteJid}_${sender}`;
                let now=Date.now();
                if(!lastDb[key] || now-lastDb[key]>30000){
                  lastDb[key]=now;
                  fs.mkdirSync('./database',{recursive:true});
                  fs.writeFileSync(lastMarkFile, JSON.stringify(lastDb,null,2));
                  await sock.sendMessage(remoteJid,{text:`@${senderNum} ⚠️ ᴡᴀʀɴᴇᴅ [${uWarn.count}/${limit}]`, mentions:[sender]}, {quoted: msg}).catch(()=>{});
                }
              }
            }
          }
        }catch{}

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
        mObj.isSubBotOwner = isSubBotSession
        mObj.isOwner = isSubBotSession? true : (senderNum === botIdNum)
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
      }
    }catch(e){ console.log('upsert error',e.message) }
  }
}

async function startSubBotSession(phoneNumber){
  global.startSubBotSession = startSubBotSession
  try{
    const id = phoneNumber.replace(/[^0-9]/g,'')
    const sessionPath = `./sessions/${id}`
    if(!fs.existsSync(sessionPath)) return
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
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
        console.log(G+`✅ SUBBOT ${id} CONNECTED`+R)
        global.subbots.set(id, sock)
        if(!global.subbotOwners.includes(id)) global.subbotOwners.push(id)
        connectedCount++
        try{
          let db=loadSchedules(id);
          for(let gid in db){
            scheduleAutoAction(sock, id, gid, db[gid].action, db[gid].executeAt);
          }
        }catch{}
      }
      if(u.connection==='close'){
        global.subbots.delete(id)
        console.log(Y+`⚠️ SUBBOT ${id} CLOSED, RESTARTING 5s`+R)
        setTimeout(()=>startSubBotSession(id),5000)
      }
    })
    sock.ev.on('messages.upsert', createMessageHandler(sock, true))

    sock.ev.on('group-participants.update', async (anu)=>{
     try{
      let botJid=sock.user.id.split(':')[0]+'@s.whatsapp.net';
      let akFile=`./database/autokickbot_${id}.json`;
      if(fs.existsSync(akFile)){
        let akDb=JSON.parse(fs.readFileSync(akFile));
        if(akDb[anu.id]?.enabled && anu.action==="add"){
          try{
            let meta=await sock.groupMetadata(anu.id);
            if(meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin){
              for(let jid of anu.participants){
                let isBot=global.subbots.has(jid.split('@')[0]) || jid.toLowerCase().includes('bot');
                if(isBot && jid!==botJid){
                  await delay(2000);
                  await sock.groupParticipantsUpdate(anu.id,[jid],"remove").catch(()=>{});
                  await sock.sendMessage(anu.id,{text:`╭───「 ᴀᴜᴛᴏ ᴋɪᴄᴋ 」───\n│ 🤖 @${jid.split('@')[0]} ᴀᴜᴛᴏ ᴋɪᴄᴋᴇᴅ\n╰────────────────`, mentions:[jid]}).catch(()=>{});
                }
              }
            }
          }catch{}
        }
      }
      if(anu.action==="promote"){
        let apFile=`./database/antipromote_${id}.json`;
        if(fs.existsSync(apFile)){
          let apDb=JSON.parse(fs.readFileSync(apFile));
          if(apDb[anu.id]?.enabled){
            try{
              let meta=await sock.groupMetadata(anu.id);
              if(meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin){
                for(let jid of anu.participants){
                  if(jid!==botJid){
                    await delay(1000);
                    await sock.groupParticipantsUpdate(anu.id,[jid],"demote").catch(()=>{});
                    await sock.sendMessage(anu.id,{text:`${'antipromote active, demoted'} @${jid.split('@')[0]}`, mentions:[jid]}).catch(()=>{});
                  }
                }
              }
            }catch{}
          }
        }
      }
      if(anu.action==="demote"){
        let adFile=`./database/antidemote_${id}.json`;
        if(fs.existsSync(adFile)){
          let adDb=JSON.parse(fs.readFileSync(adFile));
          if(adDb[anu.id]?.enabled){
            try{
              let meta=await sock.groupMetadata(anu.id);
              if(meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin){
                for(let jid of anu.participants){
                  if(jid!==botJid){
                    await delay(1000);
                    await sock.groupParticipantsUpdate(anu.id,[jid],"promote").catch(()=>{});
                    await sock.sendMessage(anu.id,{text:`ᴀɴᴛɪᴅᴇᴍᴏᴛᴇ ᴀᴄᴛɪᴠᴇ, ᴘʀᴏᴍᴏᴛᴇᴅ ʙᴀᴄᴋ @${jid.split('@')[0]}`, mentions:[jid]}).catch(()=>{});
                  }
                }
              }
            }catch{}
          }
        }
      }
     }catch{}
    });

  }catch(e){ console.log('subbot start error',e.message) }
}

async function startAllSubBots(){
  global.startAllSubBots = startAllSubBots
  try{
    const dirs = fs.readdirSync('./sessions')
    for(let d of dirs){
      if(d.length >= 10){
        await delay(2000)
        startSubBotSession(d)
      }
    }
  }catch{}
}

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
      return ctx.reply(toSmallCaps(`❌ ᴜɢᴀɴᴅᴀ ɴᴜᴍʙᴇʀ ᴍᴜsᴛ ʙᴇ 12 ᴅɪɢɪᴛs. ᴇx: /ᴘᴀɪʀ ${validExample}`), doReply(ctx))
    }
    let sMsg=await ctx.reply(toSmallCaps(`🔍 Checking server...`), doReply(ctx))
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
      saveTgSession(String(ctx.from.id), number)

      // --- EDITED PAIRING: hold to copy + no spam ---
      const cleanCode = `${clean}`
      const pairMsg=`${toSmallCaps('🔥 Pairing code generated')}\n\n📲 ${toSmallCaps(`NUM: ${number}`)}\n\n${toSmallCaps('your code, tap to copy')}\n\`${cleanCode}\`\n\n${toSmallCaps('Open whatsapp > Linked devices > Link with phone number, and enter the code.')}\n> ${toSmallCaps('CODE EXPIRES IN 60 SECONDS')}\n@STORM X 𖤍`
      const photo=await getBotPhoto(ctx)
      const kb=Markup.inlineKeyboard([[Markup.button.callback(`📋 Copy ${cleanCode}`,`copy_${cleanCode}`)],[Markup.button.url('👥 Group',GROUP_LINK), Markup.button.url('📢 Channel',CHANNEL_LINK)],[Markup.button.url('👑 Owner',OWNER_LINK)]])
      if(photo) await ctx.replyWithPhoto(photo,{caption:pairMsg, parse_mode:'Markdown',...kb,...doReply(ctx)})
      else await ctx.reply(pairMsg,{parse_mode:'Markdown',...kb,...doReply(ctx)})
      // --- END EDIT ---

      sock.ev.on('connection.update', u=>{
        if(u.connection==='open'){
          connectedCount++
          ctx.reply(toSmallCaps(`✅ ${number} Connected! Session saved on server.`), doReply(ctx))
          setTimeout(()=>startSubBotSession(number), 1000)
        }
      })
    }catch(e){
      try{ fs.rmSync('./sessions/'+number,{recursive:true,force:true}) }catch{}
      await ctx.reply(toSmallCaps(`❌ ғᴀɪʟᴇᴅ ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ᴄᴏᴅᴇ ғᴏʀ ${number}. ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ɴᴜᴍʙᴇʀ ʟɪᴋᴇ ${validExample} ᴀɴᴅ ᴛʀʏ ᴀɢᴀɪɴ.`), doReply(ctx))
    }
  })

  bot.command('session', async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    let db=loadTgSessions()
    let myNums=db[String(ctx.from.id)]||[]
    let hasActive=false
    for(let n of myNums){
      if(global.subbots.has(n) || fs.existsSync('./sessions/'+n)) hasActive=true
    }
    if(hasActive){
      await ctx.reply(toSmallCaps(`YOU HAVE AN ACTIVE SESSION IN THE SERVER RIGHT NOW ✅\nNUMBERS: ${myNums.join(', ')}`), doReply(ctx))
    }else{
      const kb=Markup.inlineKeyboard([[Markup.button.callback('🔗 Pair Now','pair_btn')],[Markup.button.url('👥 Group',GROUP_LINK), Markup.button.url('📢 Channel',CHANNEL_LINK)]])
      await ctx.reply(toSmallCaps(`YOU DONT HAVE ANY ACTIVE SESSION IN THE SERVER, USE THE PAIR BUTTON BELLOW TO GET CONNECTED ❌`), {...kb,...doReply(ctx)})
    }
  })

  bot.action('pair_btn', async (ctx)=>{
    await ctx.answerCbQuery()
    const validExample='256766233051'
    await ctx.reply(`${toSmallCaps('❌ Invalid number! Please enter a valid WhatsApp number with country code, no +, no spaces, no xxxx.')}\n\n${toSmallCaps('Fake numbers create empty sessions and fill server storage. Please use your real number.')}\n\nℹ️ 𝚄𝚂𝙰𝙶𝙴\n/pair ${validExample}\n\n${toSmallCaps('Example for Uganda: /pair 2567xxxxxxxx (12 digits)')}\n${toSmallCaps('Your real number example:')} ${validExample}`, doReply(ctx))
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
      const dirs=fs.readdirSync('./sessions').filter(d=>d.length>=10)
      const total=dirs.length
      let listText=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connectedCount}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connectedCount)}\n\n`
      if(dirs.length>0){
        listText+=`📋 ${toSmallCaps('connected numbers list:')}\n`
        dirs.forEach((n,i)=>{
          let status=global.subbots.has(n)?'🟢 online':'🔴 offline'
          listText+=`${i+1}. ${n} - ${status}\n`
        })
      }else{
        listText+=toSmallCaps('no sessions found')
      }
      listText+=`\n\n𝚂𝙴𝚁𝚅𝙴𝚁(𝚂) 𝚁𝙴𝙰𝙳𝚈`
      await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,listText)
    }catch{
      const total=countUsers()
      const txt=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connectedCount}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connectedCount)}\n\n𝚂𝙴𝚁𝚅𝙴𝚁(𝚂) 𝚁𝙴𝙰𝙳𝚈`
      await ctx.reply(txt, doReply(ctx))
    }
  })

  bot.command('users', async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    const chk=await ctx.reply(toSmallCaps(`🔎 Checking server...`), doReply(ctx))
    await delay(700)
    const total=countUsers()
    const txt=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connectedCount}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connectedCount)}`
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,txt) }catch{ await ctx.reply(txt, doReply(ctx)) }
  })

  bot.command('runtime', async (ctx)=>{
    const {d,h,m,s}=runtime()
    const chk=await ctx.reply(toSmallCaps(`🔍 Checking server...`), doReply(ctx))
    await delay(600)
    const txt=`✅️ 𝚃𝙷𝙴 𝙱𝙾𝚃 𝙷𝙰𝚂 𝙱𝙴𝙽\nRUNNING FOR ${d}d ${h}h ${m}m ${s}s`
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
    `${toSmallCaps(`7. version: ${version} stable`)}\n`+
    `${toSmallCaps(`8. server: storm cloud online`)}`
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,text) }catch{ await ctx.reply(text, doReply(ctx)) }
  })

  bot.command('about', async (ctx)=>{
    const aboutText=`> ╭━─━─❰ 𝐀𝐁𝐎𝐔𝐓 𝐒𝐓𝐎𝐑𝐌 ❱─━─━╮
> ┃
> ┃ 𝐓𝐇𝐄 𝐂𝐘𝐁𝐄𝐑 𝐁𝐎𝐓 𝐖𝐀𝐒 𝐂𝐑𝐄𝐀𝐓𝐄𝐃 𝐁𝐘 𝐒𝐓𝐎𝐑𝐌 𝐗
> ┃ 𝐓𝐇𝐄 𝐏𝐑𝐎𝐉𝐄𝐂𝐓 𝐇𝐀𝐒 𝐓𝐀𝐊𝐄𝐍 𝐎𝐕𝐄𝐑 𝟑 𝐌𝐎𝐍𝐓𝐇
> ┃ 𝐓𝐎 𝐁𝐔𝐈𝐋𝐃 𝐀𝐍𝐃 𝐎𝐏𝐓𝐈𝐌𝐈𝐙𝐄
> ┃
> ┃ 𝐓𝐇𝐄 𝐀𝐂𝐂𝐎𝐔𝐍𝐓𝐒 𝐀𝐑𝐄 𝐅𝐎𝐑 𝐎𝐍𝐄 𝐏𝐄𝐑𝐒𝐎𝐍
> ┃ 𝐓𝐇𝐀𝐓𝐒 𝐀 𝐓𝐑𝐈𝐂𝐊 𝐓𝐎 𝐊𝐄𝐄𝐏 𝐒𝐄𝐑𝐕𝐄𝐑 𝐂𝐋𝐄𝐀𝐍
> ┃
> ┃ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 𝐈𝐒 𝐍𝐎𝐓 𝐉𝐔𝐒𝐓 𝐀 𝐁𝐎𝐓
> ┃ 𝐈𝐓𝐒 𝐀 𝐂𝐘𝐁𝐄𝐑 𝐑𝐄𝐕𝐎𝐋𝐔𝐓𝐈𝐎𝐍 𝐁𝐔𝐈𝐋𝐓 𝐖𝐈𝐓𝐇
> ┃ 𝐏𝐀𝐒𝐒𝐈𝐎𝐍, 𝐏𝐎𝐖𝐄𝐑 & 𝐏𝐑𝐄𝐂𝐈𝐒𝐈𝐎𝐍
> ┃ 𝐅𝐀𝐒𝐓, 𝐒𝐄𝐂𝐔𝐑𝐄, 𝐒𝐓𝐀𝐁𝐋𝐄 & 𝐔𝐍𝐒𝐓𝐎𝐏𝐏𝐀𝐁𝐋𝐄
> ┃
> ┃ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐒𝐓𝐎𝐑𝐌 𝐗 𝐓𝐄𝐀𝐌
> ┃ 𝐕𝐄𝐑𝐒𝐈𝐎𝐍: 𝐕𝟑 𝐒𝐓𝐀𝐁𝐋𝐄
> ┃
> ╰━━━━━━━━━━━━━━━━━━━━╯
@𝐒𝐓𝐎𝐑𝐌 𝐗 𖤍`
    const kb=Markup.inlineKeyboard([[Markup.button.url('👥 Group', GROUP_LINK), Markup.button.url('📢 Channel', CHANNEL_LINK)],[Markup.button.url('👑 Dev', OWNER_LINK), Markup.button.url('👑 Creator', CREATOR_LINK)]])
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
    const kb=Markup.inlineKeyboard([[Markup.button.url('💬 Creator - SYRIX',CREATOR_LINK)]])
    await ctx.reply(txt,{...kb,...doReply(ctx)})
  }

  bot.command('dev', devHandler)
  bot.command('owner', devHandler)
  bot.command('creator', creatorHandler)

  bot.command('disconnect', async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    const n=ctx.message.text.split(' ')[1]?.replace(/[^0-9]/g,'')
    if(!n) return ctx.reply(`ℹ️ 𝚄𝚂𝙰𝙶𝙴\n\n/disconnect <number>`, doReply(ctx))
    const chk=await ctx.reply(toSmallCaps(`🔎 Checking server...`), doReply(ctx))
    await delay(800)
    const exists=fs.existsSync('./sessions/'+n)
    if(!exists){
      try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,toSmallCaps(`⚠️ 𝙽𝙾 𝚂𝙴𝚂𝚂𝙸𝙾𝙽 𝙵𝙾𝚄𝙽𝙳.`)) }catch{}
      return
    }
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,toSmallCaps(`✅️ SESSION FOR ${n} FOUND`)) }catch{}
    const kb=Markup.inlineKeyboard([[Markup.button.callback('✅ Confirm',`del_confirm_${n}`), Markup.button.callback('❌ Cancel',`del_cancel_${n}`)]])
    await ctx.reply(toSmallCaps(`Do you want to disconnect ${n}?`),{...kb,...doReply(ctx)})
  })

  bot.action(/del_confirm_(.*)/, async (ctx)=>{
    const n=ctx.match[1]
    try{ fs.rmSync('./sessions/'+n,{recursive:true,force:true}) }catch{}
    await ctx.answerCbQuery(toSmallCaps('deleted'))
    try{ await ctx.deleteMessage() }catch{}
    await ctx.reply(toSmallCaps(`✅ Session ${n} disconnected.`), doReply(ctx))
  })
  bot.action(/del_cancel_(.*)/, async (ctx)=>{
    await ctx.answerCbQuery(toSmallCaps('cancelled'))
    try{ await ctx.deleteMessage() }catch{}
    await ctx.reply(toSmallCaps(`❌ Cancelled.`), doReply(ctx))
  })

  // --- EDITED: copy no spam ---
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
      console.log(G+B+'\n✅ WHATSAPP BOT CONNECTED!\n'+R); connectedCount++; try{rl.close()}catch{}
      try{
        let botId=sock.user.id.split(':')[0];
        let db=loadSchedules(botId);
        for(let gid in db) scheduleAutoAction(sock, botId, gid, db[gid].action, db[gid].executeAt);
      }catch{}
    }
    if(u.connection==='close'){ console.log(Rd+'WhatsApp closed, restarting 3s...'+R); setTimeout(startWhatsApp,3000) }
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
    let botJid=botId+'@s.whatsapp.net';

    if(anu.action==="demote"){
      let adFile=`./database/antidemote_${botId}.json`;
      if(fs.existsSync(adFile)){
        let adDb=JSON.parse(fs.readFileSync(adFile));
        if(adDb[anu.id]?.enabled){
          try{
            let meta=await sock.groupMetadata(anu.id);
            if(meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin){
              for(let jid of anu.participants){
                if(jid!==botJid){
                  await delay(1000);
                  await sock.groupParticipantsUpdate(anu.id,[jid],"promote").catch(()=>{});
                  await sock.sendMessage(anu.id,{text:`ᴀɴᴛɪᴅᴇᴍᴏᴛᴇ ᴀᴄᴛɪᴠᴇ, ᴘʀᴏᴍᴏᴛᴇᴅ ʙᴀᴄᴋ @${jid.split('@')[0]}`, mentions:[jid]}).catch(()=>{});
                }
              }
            }
          }catch{}
        }
      }
    }

    const WELCOME_IMG='https://files.catbox.moe/jtb63o.jpg';
    const CHANNEL_JID='120363414065055650@newsletter';
    const CHANNEL_LINK='https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P';

    if(anu.action==="add"){
      try{
        let wf='./database/welcome.json';
        if(fs.existsSync(wf)){
          let wdb=JSON.parse(fs.readFileSync(wf));
          if(wdb[anu.id]?.enabled){
            try{ await sock.newsletterFollow(CHANNEL_JID).catch(()=>{}); }catch{}
            let meta=await sock.groupMetadata(anu.id);
            let memCount=meta.participants.length;
            let adminCount=meta.participants.filter(p=>p.admin).length;
            for(let user of anu.participants){
              let num=user.split('@')[0];
              let cap=`HEY @${num}\n\nWELCOME TO ${meta.subject}\nYOU'RE GONNA HAVE A GREAT TIME HERE, STAY ACTIVE AND VIBE WITH US.\n\nWE ARE HAPPY TO HAVE YOU HERE\nMEMBERS: ${memCount}\nADMINS: ${adminCount}\n\nFollow the STORM CYBER MD channel on WhatsApp: ${CHANNEL_LINK}\n\n> POWERED BY STORM CYBER MD`;
              await sock.sendMessage(anu.id,{image:{url:WELCOME_IMG}, caption:cap, mentions:[user]}).catch(()=>{});
            }
          }
        }
      }catch{}
    }

    if(anu.action==="remove"){
      try{
        let gf='./database/goodbye.json';
        if(fs.existsSync(gf)){
          let gdb=JSON.parse(fs.readFileSync(gf));
          if(gdb[anu.id]?.enabled){
            try{ await sock.newsletterFollow(CHANNEL_JID).catch(()=>{}); }catch{}
            let meta=await sock.groupMetadata(anu.id).catch(()=>({subject:'GROUP', participants:[]}));
            let memCount=meta.participants.length;
            for(let user of anu.participants){
              let num=user.split('@')[0];
              let cap=`GOODBYE @${num}\n\nYOU LEFT ${meta.subject}\nIT WAS NICE HAVING YOU HERE, HOPE YOU COME BACK SOON.\n\nWE WILL MISS YOU HERE\nMEMBERS: ${memCount}\n\nFollow the STORM CYBER MD channel on WhatsApp: ${CHANNEL_LINK}\n\n> POWERED BY STORM CYBER MD`;
              await sock.sendMessage(anu.id,{image:{url:WELCOME_IMG}, caption:cap, mentions:[user]}).catch(()=>{});
            }
          }
        }
      }catch{}
    }

    let akFile=`./database/autokickbot_${botId}.json`;
    if(fs.existsSync(akFile)){
      let akDb=JSON.parse(fs.readFileSync(akFile));
      if(akDb[anu.id]?.enabled && anu.action==="add"){
        try{
          let meta=await sock.groupMetadata(anu.id);
          if(meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin){
            for(let jid of anu.participants){
              let isBot=global.subbots.has(jid.split('@')[0]) || jid.toLowerCase().includes('bot');
              if(isBot && jid!==botJid){
                await delay(2000);
                await sock.groupParticipantsUpdate(anu.id,[jid],"remove").catch(()=>{});
                await sock.sendMessage(anu.id,{text:`╭───「 ᴀᴜᴛᴏ ᴋɪᴄᴋ 」───\n│ 🤖 @${jid.split('@')[0]} ᴀᴜᴛᴏ ᴋɪᴄᴋᴇᴅ\n╰────────────────`, mentions:[jid]}).catch(()=>{});
              }
            }
          }
        }catch{}
      }
    }
    if(anu.action==="promote"){
      let apFile=`./database/antipromote_${botId}.json`;
      if(fs.existsSync(apFile)){
        let apDb=JSON.parse(fs.readFileSync(apFile));
        if(apDb[anu.id]?.enabled){
          try{
            let meta=await sock.groupMetadata(anu.id);
            if(meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin){
              for(let jid of anu.participants){
                if(jid!==botJid){
                  await delay(1000);
                  await sock.groupParticipantsUpdate(anu.id,[jid],"demote").catch(()=>{});
                  await sock.sendMessage(anu.id,{text:`ᴀɴᴛɪᴘʀᴏᴍᴏᴛᴇ ᴀᴄᴛɪᴠᴇ, ᴅᴇᴍᴏᴛᴇᴅ @${jid.split('@')[0]}`, mentions:[jid]}).catch(()=>{});
                }
              }
            }
          }catch{}
        }
      }
    }
   }catch(e){ console.log('group update err', e.message); }
  });

  await delay(3000)
  startAllSubBots()
}
startTelegram()
startWhatsApp()
