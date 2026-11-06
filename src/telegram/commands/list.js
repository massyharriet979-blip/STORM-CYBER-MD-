import fs from 'fs'

function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return String(text||'').toLowerCase().split('').map(c=>map[c]||c).join('')
}
function doReply(ctx){
  try{ if(ctx.message) return { reply_parameters: { message_id: ctx.message.message_id } } }catch{}
  return {}
}
function loadTgSessions(){
  try{ if(!fs.existsSync('./database/telegram_sessions.json')) return {}; return JSON.parse(fs.readFileSync('./database/telegram_sessions.json','utf8')) }catch{ return {} }
}
function isConnected(number){
  const s = global.activeSessions?.get(String(number))
  if(s?.connected && s?.sock) return true
  if(global.subbots?.has(String(number))) return true
  return false
}
function isRegistered(number){
  try{ return JSON.parse(fs.readFileSync('./sessions/'+number+'/creds.json','utf8')).registered === true }catch{ return false }
}

export async function listCommand(ctx){
  const tgId = String(ctx.from.id)
  const db = loadTgSessions()
  // Only numbers NOT disconnected - folder still exists
  let myNumbers = (db[tgId] || []).filter(n => {
    try{ return fs.existsSync('./sessions/'+n+'/creds.json') }catch{ return false }
  })

  if(!myNumbers.length){
    return ctx.reply(
      `${toSmallCaps('📋 ʏᴏᴜʀ ʟɪsᴛ ɪs ᴇᴍᴘᴛʏ')}\n\n${toSmallCaps('ʏᴏᴜ ʜᴀᴠᴇ ɴᴏ sᴇssɪᴏɴs ʏᴇᴛ.')}\n\n${toSmallCaps('ᴜsᴇ')} /pair 2567... ${toSmallCaps('ᴛᴏ ᴄᴏɴɴᴇᴄᴛ ᴀ ɴᴜᴍʙᴇʀ')}`,
      doReply(ctx)
    )
  }

  let connectedCount = myNumbers.filter(n => isConnected(n)).length
  let offlineCount = myNumbers.length - connectedCount

  let lines = myNumbers.map((n, i) => {
    const online = isConnected(n)
    const dot = online ? '🟢' : '🔴'
    const status = online ? toSmallCaps('online') : toSmallCaps('offline')
    return `${i+1}. ${dot} +${n} — ${status}`
  }).join('\n')

  const msg = `${toSmallCaps('📋 ʏᴏᴜʀ sᴇssɪᴏɴs')}\n\n${lines}\n\n${toSmallCaps('ᴛᴏᴛᴀʟ:')} ${myNumbers.length}  |  🟢 ${connectedCount}  |  🔴 ${offlineCount}\n\n${toSmallCaps('ᴛᴀᴘ ᴀ ɴᴜᴍʙᴇʀ ᴛᴏ ᴠɪᴇᴡ ɪᴛs ᴅᴇᴛᴀɪʟs')}`

  // Buttons reuse /session detail - sess_view_ already handled in bot.js
  const kb = { reply_markup: { inline_keyboard: myNumbers.map(n => [{ text: `📱 +${n} ${isConnected(n)?'🟢':'🔴'}`, callback_data: `sess_view_${n}` }]) } }
  return ctx.reply(msg, { ...kb, ...doReply(ctx) })
}
