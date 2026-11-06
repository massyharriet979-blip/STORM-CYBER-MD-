import fs from 'fs'

function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return String(text||'').toLowerCase().split('').map(c=>map[c]||c).join('')
}
const delay = (ms) => new Promise(r=>setTimeout(r,ms))
function doReply(ctx){
  try{ if(ctx.message) return { reply_parameters: { message_id: ctx.message.message_id } } }catch{}
  return {}
}
function getTgSessionFile(){ return './database/telegram_sessions.json' }
function loadTgSessions(){
  try{ if(!fs.existsSync(getTgSessionFile())) return {}; return JSON.parse(fs.readFileSync(getTgSessionFile(),'utf8')) }catch{ return {} }
}
function saveTgSessions(db){
  fs.mkdirSync('./database',{recursive:true})
  fs.writeFileSync(getTgSessionFile(), JSON.stringify(db,null,2))
}
function removeTgSession(tgId, number){
  let db = loadTgSessions()
  if(db[tgId]) db[tgId] = db[tgId].filter(n => String(n) !== String(number))
  saveTgSessions(db)
}
function isSaved(number){
  try{ return fs.existsSync('./sessions/'+number+'/creds.json') }catch{ return false }
}
function isConnected(number){
  const s = global.activeSessions?.get(String(number))
  if(s?.connected && s?.sock) return true
  if(global.subbots?.has(String(number))) return true
  return false
}

// ---------- CONFIRM MESSAGE ----------
async function sendConfirm(ctx, number, isEdit = false){
  number = String(number).replace(/[^0-9]/g,'')
  const dot = isConnected(number) ? '🟢' : '🔴'
  const msg = `⚠️ ${toSmallCaps('are you sure you want to disconnect')}\n\n📲 +${number} ${dot}\n\n${toSmallCaps('this will disconnect the number and delete it from the server. you will need to pair again to use it.')}`
  const kb = { reply_markup: { inline_keyboard: [
    [{ text: `✅ ${toSmallCaps('confirm')}`, callback_data: `disc_confirm_${number}` }, { text: `❌ ${toSmallCaps('cancel')}`, callback_data: `disc_cancel_${number}` }]
  ] } }
  if(isEdit){
    try{ await ctx.editMessageText(msg, kb) }catch{ await ctx.reply(msg, kb) }
  } else {
    await ctx.reply(msg, { ...kb, ...doReply(ctx) })
  }
}

// ---------- /disconnect ----------
export async function disconnectCommand(ctx){
  const tgId = String(ctx.from.id)
  const arg = (ctx.message?.text?.split(' ')[1] || '').replace(/[^0-9]/g,'')

  // /disconnect 257... with number
  if(arg){
    if(!isSaved(arg)){
      const kb = { reply_markup: { inline_keyboard: [[{ text: `⬅️ ${toSmallCaps('back')}`, callback_data: `disc_back` }]] } }
      return ctx.reply(`${toSmallCaps('❌ no session found for')} +${arg}`, { ...kb, ...doReply(ctx) })
    }
    // Saved -> confirm texts FIRST, do not disconnect yet
    return sendConfirm(ctx, arg, false)
  }

  // /disconnect with no number -> list NOT disconnected numbers
  const db = loadTgSessions()
  let myNumbers = (db[tgId] || []).filter(n => isSaved(n))

  if(!myNumbers.length){
    const kb = { reply_markup: { inline_keyboard: [[{ text: `⬅️ ${toSmallCaps('back')}`, callback_data: `disc_back` }]] } }
    return ctx.reply(toSmallCaps(`❌ ʏᴏᴜ ʜᴀᴠᴇ ɴᴏ sᴇssɪᴏɴs ᴛᴏ ᴅɪsᴄᴏɴɴᴇᴄᴛ.`), { ...kb, ...doReply(ctx) })
  }

  const msg = `${toSmallCaps('sᴇʟᴇᴄᴛ ᴀ ɴᴜᴍʙᴇʀ ᴛᴏ ᴅɪsᴄᴏɴɴᴇᴄᴛ')}\n\n${myNumbers.map(n => `${isConnected(n)?'🟢':'🔴'} +${n}`).join('\n')}`
  const kb = { reply_markup: { inline_keyboard: [
    ...myNumbers.map(n => [{ text: `📱 +${n} ${isConnected(n)?'🟢':'🔴'}`, callback_data: `disc_view_${n}` }]),
    [{ text: `⬅️ ${toSmallCaps('back')}`, callback_data: `disc_back` }]
  ] } }
  return ctx.reply(msg, { ...kb, ...doReply(ctx) })
}

// ---------- BUTTON ACTIONS ----------
export async function disconnectActions(ctx){
  const data = ctx.callbackQuery?.data || ''
  if(!data.startsWith('disc_')) return
  try{ await ctx.answerCbQuery() }catch{}

  // BACK -> list again
  if(data === 'disc_back'){
    try{ await ctx.deleteMessage() }catch{}
    const tgId = String(ctx.from.id)
    const db = loadTgSessions()
    let myNumbers = (db[tgId] || []).filter(n => isSaved(n))
    if(!myNumbers.length) return ctx.reply(toSmallCaps(`❌ ʏᴏᴜ ʜᴀᴠᴇ ɴᴏ sᴇssɪᴏɴs ᴛᴏ ᴅɪsᴄᴏɴɴᴇᴄᴛ.`))
    const msg = `${toSmallCaps('sᴇʟᴇᴄᴛ ᴀ ɴᴜᴍʙᴇʀ ᴛᴏ ᴅɪsᴄᴏɴɴᴇᴄᴛ')}\n\n${myNumbers.map(n => `${isConnected(n)?'🟢':'🔴'} +${n}`).join('\n')}`
    const kb = { reply_markup: { inline_keyboard: [
      ...myNumbers.map(n => [{ text: `📱 +${n} ${isConnected(n)?'🟢':'🔴'}`, callback_data: `disc_view_${n}` }]),
      [{ text: `⬅️ ${toSmallCaps('back')}`, callback_data: `disc_back` }]
    ] } }
    return ctx.reply(msg, kb)
  }

  // PICK A NUMBER -> show confirm
  if(data.startsWith('disc_view_')){
    const number = data.replace('disc_view_','')
    try{ await ctx.deleteMessage() }catch{}
    return sendConfirm(ctx, number, false)
  }

  // CANCEL -> CANCELLING PROCESS... -> CANCELLED, no disconnect
  if(data.startsWith('disc_cancel_')){
    const number = data.replace('disc_cancel_','')
    try{ await ctx.editMessageText(toSmallCaps(`⏳ ᴄᴀɴᴄᴇʟʟɪɴɢ ᴘʀᴏᴄᴇss...`)) }catch{ await ctx.reply(toSmallCaps(`⏳ ᴄᴀɴᴄᴇʟʟɪɴɢ ᴘʀᴏᴄᴇss...`)) }
    await delay(800)
    try{ await ctx.editMessageText(toSmallCaps(`✅ ᴄᴀɴᴄᴇʟʟᴇᴅ`)) }catch{ await ctx.reply(toSmallCaps(`✅ ᴄᴀɴᴄᴇʟʟᴇᴅ`)) }
    return
  }

  // CONFIRM -> DISCONNECTING... -> DISCONNECTED + delete from server
  if(data.startsWith('disc_confirm_')){
    const number = data.replace('disc_confirm_','')
    try{ await ctx.editMessageText(toSmallCaps(`⏳ ᴅɪsᴄᴏɴɴᴇᴄᴛɪɴɢ +${number}...`)) }catch{ await ctx.reply(toSmallCaps(`⏳ ᴅɪsᴄᴏɴɴᴇᴄᴛɪɴɢ +${number}...`)) }
    await delay(800)
    try{
      // Try WhatsApp logout first so number unlinks cleanly, then delete folder
      const sess = global.activeSessions?.get(String(number))
      try{ await sess?.sock?.logout?.() }catch{}
      try{ await sess?.sock?.end?.() }catch{}
      if(typeof global.clearSession === 'function') await global.clearSession(number)
      else { try{ fs.rmSync('./sessions/'+number, { recursive:true, force:true }) }catch{} }
      removeTgSession(String(ctx.from.id), number)
      if(global.subbots?.has(number)) global.subbots.delete(number)
      if(global.sessionMeta?.has(number)) global.sessionMeta.delete(number)
    }catch(e){ console.log('disc confirm err', e.message) }
    try{ await ctx.editMessageText(`✅ +${number}\n\n${toSmallCaps('disconnected from the server.')}`) }catch{ await ctx.reply(`✅ +${number}\n\n${toSmallCaps('disconnected from the server.')}`) }
    return
  }
}

// ---------- BACKWARD COMPAT: old bot.js used del_confirm_ / del_cancel_ ----------
export async function disconnectConfirm(ctx){
  const number = ctx.match?.[1] || ''
  ctx.callbackQuery = { data: `disc_confirm_${number}` }
  return disconnectActions(ctx)
}
export async function disconnectCancel(ctx){
  const number = ctx.match?.[1] || ''
  ctx.callbackQuery = { data: `disc_cancel_${number}` }
  return disconnectActions(ctx)
}
