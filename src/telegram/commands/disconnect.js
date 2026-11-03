import fs from 'fs'
import { Markup } from 'telegraf'

function getTgSessionFile(){ return './database/telegram_sessions.json' }
function loadTgSessions(){
  try{
    if(!fs.existsSync(getTgSessionFile())) return {}
    return JSON.parse(fs.readFileSync(getTgSessionFile(),'utf8'))
  }catch{ return {} }
}
function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return text.toLowerCase().split('').map(c=>map[c]||c).join('')
}
function doReply(ctx){
  try{ if(ctx.message) return { reply_parameters: { message_id: ctx.message.message_id } } }catch{}
  return {}
}
const delay = (ms) => new Promise(r=>setTimeout(r,ms))

export async function disconnectCommand(ctx){
  const n=ctx.message.text.split(' ')[1]?.replace(/[^0-9]/g,'')
  if(!n) return ctx.reply(`ℹ️ 𝚄𝚂𝙰𝙶𝙴\n\n/disconnect <number>`, doReply(ctx))

  // check server first - does folder exist?
  const sessPath='./sessions/'+n
  const exists=fs.existsSync(sessPath)

  let db=loadTgSessions()
  let myNums=db[String(ctx.from.id)]||[]

  // check if number belongs to someone else
  let claimedByOther=false
  let claimedBy=null
  for(let uid in db){
    if(uid!==String(ctx.from.id) && db[uid].includes(n)){
      claimedByOther=true
      claimedBy=uid
      break
    }
  }

  // Ownership logic: allow if it's yours OR if not claimed by anyone and folder exists on server (covers json reset case)
  if(!myNums.includes(n)){
    if(claimedByOther){
      return ctx.reply(toSmallCaps(`❌ this number is not yours.`), doReply(ctx))
    }
    if(!exists){
      return ctx.reply(toSmallCaps(`❌ this number is not yours.`), doReply(ctx))
    }
    // if folder exists on server and not claimed, allow to proceed (json was lost)
  }

  const chk=await ctx.reply(toSmallCaps(`🔎 requesting server information...`), doReply(ctx))
  await delay(800)

  if(!exists){
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,toSmallCaps(`⚠️ ɴᴏ sᴇssɪᴏɴ ғᴏᴜɴᴅ.`)) }catch{}
    return
  }

  try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,toSmallCaps(`✅️ session for ${n} found`)) }catch{}
  const kb=Markup.inlineKeyboard([[Markup.button.callback('✅ Confirm',`del_confirm_${n}`), Markup.button.callback('❌ Cancel',`del_cancel_${n}`)]])
  await ctx.reply(toSmallCaps(`do you want to disconnect ${n}?`),{...kb,...doReply(ctx)})
}

export async function disconnectConfirm(ctx){
  const n=ctx.match[1]
  let db=loadTgSessions()
  let myNums=db[String(ctx.from.id)]||[]

  let claimedByOther=false
  for(let uid in db){
    if(uid!==String(ctx.from.id) && db[uid].includes(n)){
      claimedByOther=true
      break
    }
  }
  if(!myNums.includes(n) && claimedByOther){
    await ctx.answerCbQuery(toSmallCaps('not your session'))
    return ctx.reply(toSmallCaps(`❌ you cannot delete another user's session.`), doReply(ctx))
  }

  try{
    if(global.subbots?.has(n)){
      let s=global.subbots.get(n)
      try{ await s.logout() }catch{}
      try{ s.end?.() }catch{}
      try{ s.ws?.close?.() }catch{}
      global.subbots.delete(n)
      if(global.subbotOwners) global.subbotOwners=global.subbotOwners.filter(x=>x!==n)
      global.pairingInProgress?.delete(n)
      await delay(1000)
    }
  }catch{}

  try{ fs.rmSync('./sessions/'+n,{recursive:true,force:true}) }catch{}

  try{
    let db2=loadTgSessions()
    for(let uid in db2){
      db2[uid]=db2[uid].filter(x=>x!==n)
    }
    fs.mkdirSync('./database',{recursive:true})
    fs.writeFileSync(getTgSessionFile(), JSON.stringify(db2,null,2))
  }catch{}

  try{ global.sessionMeta?.delete(n) }catch{}

  await ctx.answerCbQuery(toSmallCaps('deleted'))
  try{ await ctx.deleteMessage() }catch{}
  await ctx.reply(toSmallCaps(`✅ session ${n} disconnected and deleted from server.`), doReply(ctx))
}

export async function disconnectCancel(ctx){
  await ctx.answerCbQuery(toSmallCaps('cancelled'))
  try{ await ctx.deleteMessage() }catch{}
  await ctx.reply(toSmallCaps(`❌ cancelled.`), doReply(ctx))
}
