import fs from 'fs'

function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return String(text||'').toLowerCase().split('').map(c=>map[c]||c).join('')
}

function doReply(ctx){
  try{
    if(ctx.message) return { reply_parameters: { message_id: ctx.message.message_id } }
  }catch{}
  return {}
}

export async function usersCommand(ctx){
  // GLOBAL - all folders on server, not just this user
  let folders = []
  try{ folders = fs.readdirSync('./sessions').filter(d => /^\d+$/.test(d)) }catch{ folders = [] }

  let paired = 0
  let connected = 0
  let disconnected = 0

  for(let n of folders){
    let registered = false
    try{ registered = JSON.parse(fs.readFileSync('./sessions/'+n+'/creds.json','utf8')).registered === true }catch{}
    if(!registered) continue
    paired++
    const s = global.activeSessions?.get(n)
    const online = (s?.connected && s?.sock) || global.subbots?.has(n)
    if(online) connected++
    else disconnected++
  }

  // How many different Telegram users have ever paired
  let tgUsers = 0
  try{
    const db = JSON.parse(fs.readFileSync('./database/telegram_sessions.json','utf8'))
    tgUsers = Object.keys(db).length
  }catch{ tgUsers = 0 }

  // Server uptime - real from global.runtime if bot.js set it, else process.uptime
  let upStr = 'unknown'
  try{
    if(typeof global.runtime === 'function'){ const r = global.runtime(); upStr = `${r.d}d ${r.h}h ${r.m}m ${r.s}s` }
    else { const s = Math.floor(process.uptime()); upStr = `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s` }
  }catch{}

  const msg = `👥 ${toSmallCaps('sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ - ᴜsᴇʀs')}\n\n` +
    `┌────────( ${toSmallCaps('global stats')} )\n` +
    `│ ➣ ${toSmallCaps('telegram users')} : ${tgUsers}\n` +
    `│ ➣ ${toSmallCaps('paired numbers')} : ${paired}\n` +
    `│ ➣ ${toSmallCaps('online now')} : 🟢 ${connected}\n` +
    `│ ➣ ${toSmallCaps('offline')} : 🔴 ${disconnected}\n` +
    `└────────\n\n` +
    `┌────────( ${toSmallCaps('server')} )\n` +
    `│ ➣ ${toSmallCaps('server')} : ${toSmallCaps('server 1 of 1')}\n` +
    `│ ➣ ${toSmallCaps('server up')} : ${toSmallCaps(upStr)}\n` +
    `│ ➣ ${toSmallCaps('status')} : ${toSmallCaps('server(s) ready')}\n` +
    `└────────\n\n` +
    `${toSmallCaps('ᴜsᴇ /list ᴛᴏ sᴇᴇ ʏᴏᴜʀ ᴏᴡɴ ɴᴜᴍʙᴇʀs.')}`

  return ctx.reply(msg, doReply(ctx))
}

export default usersCommand
