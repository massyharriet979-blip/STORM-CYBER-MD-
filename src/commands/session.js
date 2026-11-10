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
const digits = (s) => String(s || '').replace(/[^0-9]/g, '')
function cleanPhone(n){
  let id = digits(n)
  if(id.startsWith('0')) id = id.slice(1)
  return id
}

// REAL: read from server, not from Telegram memory
function getSessionInfo(number){
  number = cleanPhone(number)
  const credsPath = `./sessions/${number}/creds.json`
  let exists = fs.existsSync(`./sessions/${number}`)
  let registered = false
  let meId = ''
  try{
    if(fs.existsSync(credsPath)){
      let c = JSON.parse(fs.readFileSync(credsPath,'utf8'))
      registered = c.registered === true
      meId = c.me?.id || ''
    }
  }catch{}
  // ONE TRUTH: activeSessions from pairManager (File 1)
  let live = global.activeSessions?.get(number)
  let connected = !!(live?.connected && live?.sock)
  // Fallback to subbots if activeSessions not filled yet
  if(!connected && global.subbots?.has(number)) connected = true

  let meta = global.sessionMeta?.get(number) || {}
  let disconnectedAt = live?.disconnectedAt || live?.disconnectedSince || meta.disconnectedAt || null
  let connectedAt = meta.connectedAt || null
  let pairedAt = meta.pairedAt || null

  return { number, exists, registered, meId, connected, disconnectedAt, connectedAt, pairedAt }
}

function fmtTime(ts){
  if(!ts) return '—'
  try{ return new Date(ts).toLocaleString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) }catch{ return '—' }
}

function buildOneText(info){
  let status = ''
  let emoji = ''
  if(!info.exists){
    status = toSmallCaps('not found')
    emoji = '❌'
  } else if(info.connected){
    status = toSmallCaps('connected')
    emoji = '✅'
  } else if(info.registered){
    status = toSmallCaps('disconnected - session kept')
    emoji = '⚠️'
  } else {
    status = toSmallCaps('not paired yet')
    emoji = '⏳'
  }
  let t = `${emoji} ${toSmallCaps('session')} - ${info.number}\n\n`
  t += `${toSmallCaps('status')}: ${status}\n`
  t += `${toSmallCaps('registered')}: ${info.registered ? toSmallCaps('yes') : toSmallCaps('no')}\n`
  t += `${toSmallCaps('connected')}: ${info.connected ? toSmallCaps('yes') : toSmallCaps('no')}\n`
  if(info.connectedAt) t += `${toSmallCaps('connected at')}: ${fmtTime(info.connectedAt)}\n`
  if(!info.connected && info.disconnectedAt) t += `${toSmallCaps('disconnected at')}: ${fmtTime(info.disconnectedAt)}\n`
  if(info.pairedAt) t += `${toSmallCaps('paired at')}: ${fmtTime(info.pairedAt)}\n`
  if(!info.connected && info.registered){
    t += `\n${toSmallCaps('session is kept, not deleted. use /disconnect to delete it.')}`
  }
  return t
}

function buildListText(){
  let folders = []
  try{ folders = fs.readdirSync('./sessions').filter(d => /^\d+$/.test(d)) }catch{ folders = [] }
  if(!folders.length) return toSmallCaps('no sessions found on server.')
  let t = `📊 ${toSmallCaps('session')}\n\n`
  t += `${toSmallCaps('tap a number to see real status from server:')}\n\n`
  for(let n of folders){
    let info = getSessionInfo(n)
    let mark = info.connected ? '✅' : info.registered ? '⚠️' : '⏳'
    t += `${mark} ${n} - ${info.connected ? toSmallCaps('connected') : info.registered ? toSmallCaps('disconnected') : toSmallCaps('not paired')}\n`
  }
  return t
}

function listKeyboard(){
  let folders = []
  try{ folders = fs.readdirSync('./sessions').filter(d => /^\d+$/.test(d)) }catch{ folders = [] }
  let rows = []
  // 2 per row
  for(let i=0;i<folders.length;i+=2){
    let row = []
    row.push({ text: folders[i], callback_data: `sess_view_${folders[i]}` })
    if(folders[i+1]) row.push({ text: folders[i+1], callback_data: `sess_view_${folders[i+1]}` })
    rows.push(row)
  }
  rows.push([{ text: `🔄 ${toSmallCaps('refresh')}`, callback_data: `sess_refresh_list` }])
  return { reply_markup: { inline_keyboard: rows } }
}

function oneKeyboard(number){
  return { reply_markup: { inline_keyboard: [
    [{ text: `🔄 ${toSmallCaps('refresh')}`, callback_data: `sess_refresh_${number}` }, { text: `❌ ${toSmallCaps('disconnect')}`, callback_data: `disc_view_${number}` }],
    [{ text: `⬅️ ${toSmallCaps('back')}`, callback_data: `sess_back` }]
  ] } }
}

export async function sessionCommand(ctx){
  let raw = ''
  try{ raw = ctx.message?.text?.split(' ')[1] || '' }catch{}
  let number = cleanPhone(raw)

  if(number){
    let info = getSessionInfo(number)
    let text = buildOneText(info)
    return ctx.reply(text, { ...oneKeyboard(number), ...doReply(ctx) })
  }

  // No number -> show all from server (real list)
  let text = buildListText()
  return ctx.reply(text, { ...listKeyboard(), ...doReply(ctx) })
}

export async function sessionActions(ctx){
  const data = ctx.callbackQuery?.data || ''
  if(!data.startsWith('sess_')) return
  try{ await ctx.answerCbQuery() }catch{}
  console.log('BUTTON CLICKED:', data)

  if(data === 'sess_back'){
    let text = buildListText()
    try{ await ctx.editMessageText(text, listKeyboard()) }catch{ await ctx.reply(text, listKeyboard()) }
    return
  }

  if(data === 'sess_refresh_list'){
    let text = buildListText()
    try{ await ctx.editMessageText(text, listKeyboard()) }catch{ await ctx.reply(text, listKeyboard()) }
    return
  }

  if(data.startsWith('sess_refresh_')){
    let number = cleanPhone(data.replace('sess_refresh_',''))
    let info = getSessionInfo(number)
    let text = buildOneText(info)
    try{ await ctx.editMessageText(text, oneKeyboard(number)) }catch{ await ctx.reply(text, oneKeyboard(number)) }
    return
  }

  if(data.startsWith('sess_view_')){
    let number = cleanPhone(data.replace('sess_view_',''))
    let info = getSessionInfo(number)
    let text = buildOneText(info)
    try{ await ctx.editMessageText(text, oneKeyboard(number)) }catch{ await ctx.reply(text, oneKeyboard(number)) }
    return
  }
}

export function registerSession(bot){
  bot.command('session', sessionCommand)
  bot.action(/^sess_/, sessionActions)
}
export default registerSession
