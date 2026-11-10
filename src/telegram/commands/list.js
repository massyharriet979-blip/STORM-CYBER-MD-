import fs from 'fs'
import path from 'path'

function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return String(text||'').toLowerCase().split('').map(c=>map[c]||c).join('')
}
function doReply(ctx){
  try{ if(ctx.message) return { reply_parameters: { message_id: ctx.message.message_id } } }catch{}
  return {}
}

// --- REAL INFO FROM SERVER, NEVER DELETE ---
function getSessions(){
  const dir = './sessions'
  if(!fs.existsSync(dir)) return []
  let out = []
  for(let folder of fs.readdirSync(dir)){
    let full = path.join(dir, folder)
    if(!fs.statSync(full).isDirectory()) continue
    let credsPath = path.join(full, 'creds.json')
    let metaPath = path.join(full, 'meta.json')
    let meta = {}
    if(fs.existsSync(metaPath)){
      try{ meta = JSON.parse(fs.readFileSync(metaPath,'utf8')) }catch{}
    }
    let num = folder.replace(/[^0-9]/g,'')
    let pairedAt = meta.pairedAt || null
    let disconnectedAt = meta.disconnectedAt || null
    let meId = ''
    if(fs.existsSync(credsPath)){
      try{
        let creds = JSON.parse(fs.readFileSync(credsPath,'utf8'))
        meId = creds.me?.id || ''
        if(meId) num = meId.split(':')[0].replace(/[^0-9]/g,'')
        let stat = fs.statSync(credsPath)
        if(!pairedAt) pairedAt = stat.birthtimeMs
      }catch{}
    }
    // ONLINE CHECK FROM SERVER SOCKETS - NOT FROM TELEGRAM
    let online = false
    try{
      if(global.activeSockets && global.activeSockets[num]) online = true
      if(global.subBots && global.subBots[num]) online = true
      if(global.sockets && global.sockets[num]) online = true
    }catch{}
    out.push({ folder, num, pairedAt, disconnectedAt, online, meta })
  }
  return out
}

function fmtDate(ts){
  if(!ts) return toSmallCaps('never')
  let d = new Date(Number(ts))
  if(isNaN(d.getTime())) return toSmallCaps('never')
  return toSmallCaps(d.toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}))
}

// --- /list ---
bot.command('list', async (ctx)=>{
  let list = getSessions()
  if(!list.length){
    return ctx.reply(toSmallCaps('📋 ʏᴏᴜʀ ʟɪsᴛ ɪs ᴇᴍᴘᴛʏ\n\nʏᴏᴜ ʜᴀᴠᴇ ɴᴏ sᴇssɪᴏɴs ʏᴇᴛ.\n\nᴜsᴇ /pair 2567... ᴛᴏ ᴄᴏɴɴᴇᴄᴛ ᴀ ɴᴜᴍʙᴇʀ'), doReply(ctx))
  }
  let text = toSmallCaps(`📋 ʏᴏᴜʀ sᴇssɪᴏɴs (${list.length})\n\n`)
  list.forEach((s,i)=>{
    text += toSmallCaps(`${i+1}. +${s.num} - ${s.online ? 'ᴏɴʟɪɴᴇ ✅' : 'ᴏғғʟɪɴᴇ ❌'}\n`)
  })
  text += '\n' + toSmallCaps('ᴛᴀᴘ ᴀ ɴᴜᴍʙᴇʀ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs 👇')
  let keyboard = list.map(s=>[
    { text: toSmallCaps(`+${s.num} - ${s.online ? 'ᴏɴʟɪɴᴇ' : 'ᴏғғʟɪɴᴇ'}`), callback_data: `sess_${s.num}` }
  ])
  return ctx.reply(text, { ...doReply(ctx), reply_markup: { inline_keyboard: keyboard } })
})

// --- TAP A NUMBER ---
bot.action(/^sess_(.+)$/, async (ctx)=>{
  try{ await ctx.answerCbQuery() }catch{}
  let num = ctx.match[1]
  let list = getSessions()
  let s = list.find(x=>x.num===num)
  if(!s){
    return ctx.reply(toSmallCaps('sᴇssɪᴏɴ ɴᴏᴛ ғᴏᴜɴᴅ ᴏɴ sᴇʀᴠᴇʀ'), doReply(ctx))
  }
  let text = toSmallCaps(`📱 sᴇssɪᴏɴ ᴅᴇᴛᴀɪʟs\n\n`)
  text += toSmallCaps(`ɴᴜᴍʙᴇʀ: +${s.num}\n`)
  text += toSmallCaps(`sᴛᴀᴛᴜs: ${s.online ? 'ᴄᴏɴɴᴇᴄᴛᴇᴅ ✅' : 'ᴅɪsᴄᴏɴɴᴇᴄᴛᴇᴅ ❌'}\n`)
  text += toSmallCaps(`ᴘᴀɪʀᴇᴅ ᴏɴ: ${fmtDate(s.pairedAt)}\n`)
  text += toSmallCaps(`ᴅɪsᴄᴏɴɴᴇᴄᴛᴇᴅ ᴏɴ: ${s.disconnectedAt ? fmtDate(s.disconnectedAt) : 'sᴛɪʟʟ ᴄᴏɴɴᴇᴄᴛᴇᴅ / ɴᴇᴠᴇʀ'}\n`)
  text += '\n' + toSmallCaps('sᴇssɪᴏɴ ɪs ᴋᴇᴘᴛ ᴜɴᴛɪʟ ʏᴏᴜ ᴅᴏ /disconnect')

  let keyboard = [
    [{ text: toSmallCaps('🔄 ʀᴇᴄᴏɴɴᴇᴄᴛ'), callback_data: `reconnect_${s.num}` }],
    [{ text: toSmallCaps('⬅️ ʙᴀᴄᴋ ᴛᴏ ʟɪsᴛ'), callback_data: `back_list` }]
  ]
  try{
    await ctx.editMessageText(text, { reply_markup: { inline_keyboard: keyboard } })
  }catch{
    await ctx.reply(text, { reply_markup: { inline_keyboard: keyboard } })
  }
})

// --- BACK TO LIST ---
bot.action('back_list', async (ctx)=>{
  try{ await ctx.answerCbQuery() }catch{}
  let list = getSessions()
  let text = toSmallCaps(`📋 ʏᴏᴜʀ sᴇssɪᴏɴs (${list.length})\n\nᴛᴀᴘ ᴀ ɴᴜᴍʙᴇʀ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs 👇`)
  let keyboard = list.map(s=>[
    { text: toSmallCaps(`+${s.num} - ${s.online ? 'ᴏɴʟɪɴᴇ' : 'ᴏғғʟɪɴᴇ'}`), callback_data: `sess_${s.num}` }
  ])
  try{ await ctx.editMessageText(text, { reply_markup: { inline_keyboard: keyboard } }) }catch{}
})

// --- RECONNECT BUTTON ---
bot.action(/^reconnect_(.+)$/, async (ctx)=>{
  try{ await ctx.answerCbQuery(toSmallCaps('ʀᴇғʀᴇsʜɪɴɢ ᴘᴀɪʀɪɴɢ...')) }catch{}
  let num = ctx.match[1]
  let list = getSessions()
  let s = list.find(x=>x.num===num)
  if(!s) return ctx.reply(toSmallCaps('sᴇssɪᴏɴ ɴᴏᴛ ғᴏᴜɴᴅ'), doReply(ctx))

  // IF LINKED BUT NOTHING HAPPENS - JUST SAY CONNECTED
  if(s.online){
    return ctx.reply(toSmallCaps(`+${num} ɪs ᴀʟʀᴇᴀᴅʏ ᴄᴏɴɴᴇᴄᴛᴇᴅ ✅\nɴᴏ ɴᴇᴇᴅ ᴛᴏ ʀᴇᴄᴏɴɴᴇᴄᴛ.`), doReply(ctx))
  }

  // OFFLINE - REFRESH PAIRING VIA SAME /pair LOGIC
  // This does NOT delete session, it only asks server for a new code
  try{
    if(typeof global.requestNewPairingCode === 'function'){
      let code = await global.requestNewPairingCode(num)
      return ctx.reply(toSmallCaps(`🔄 ʀᴇᴄᴏɴɴᴇᴄᴛ +${num}\n\nʏᴏᴜʀ ɴᴇᴡ ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ: ${code}\n\nɢᴏ ᴛᴏ ᴡʜᴀᴛsᴀᴘᴘ > ʟɪɴᴋᴇᴅ ᴅᴇᴠɪᴄᴇs > ʟɪɴᴋ ᴡɪᴛʜ ᴘʜᴏɴᴇ ɴᴜᴍʙᴇʀ`), doReply(ctx))
    } else {
      // Fallback if your server uses /pair function - tell user to use it
      return ctx.reply(toSmallCaps(`ᴜsᴇ /pair ${num} ᴛᴏ ɢᴇᴛ ᴀ ɴᴇᴡ ᴄᴏᴅᴇ.\nʏᴏᴜʀ sᴇssɪᴏɴ ɪs sᴛɪʟʟ sᴀᴠᴇᴅ, ɪᴛ ᴡɪʟʟ ɴᴏᴛ ʙᴇ ᴅᴇʟᴇᴛᴇᴅ.`), doReply(ctx))
    }
  }catch(e){
    return ctx.reply(toSmallCaps(`ғᴀɪʟᴇᴅ ᴛᴏ ʀᴇᴄᴏɴɴᴇᴄᴛ: ${e.message}`), doReply(ctx))
  }
})
