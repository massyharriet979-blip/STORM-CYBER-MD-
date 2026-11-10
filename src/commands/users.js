import fs from 'fs'

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

function getRealStats(){
  let folders = []
  try{ folders = fs.readdirSync('./sessions').filter(d => /^\d+$/.test(d)) }catch{ folders = [] }
  let paired = []
  let unpaired = []
  for(let n of folders){
    try{
      let c = JSON.parse(fs.readFileSync(`./sessions/${n}/creds.json`,'utf8'))
      if(c.registered === true) paired.push(n)
      else unpaired.push(n)
    }catch{
      unpaired.push(n)
    }
  }
  let connected = []
  for(let n of paired){
    let live = global.activeSessions?.get(n)
    let isConn = !!(live?.connected && live?.sock)
    if(!isConn && global.subbots?.has(n)) isConn = true
    if(isConn) connected.push(n)
  }
  let disconnected = paired.filter(n => !connected.includes(n))
  return {
    total: paired.length,
    paired: paired.length,
    connected: connected.length,
    disconnected: disconnected.length,
    unpaired: unpaired.length,
    pairedList: paired,
    connectedList: connected,
    disconnectedList: disconnected
  }
}

function buildText(){
  let s = getRealStats()
  let t = `👥 ${toSmallCaps('users')}\n\n`
  t += `📦 ${toSmallCaps('total')}: ${s.total}\n`
  t += `✅ ${toSmallCaps('paired')}: ${s.paired}\n`
  t += `🟢 ${toSmallCaps('connected')}: ${s.connected}\n`
  t += `⚠️ ${toSmallCaps('disconnected')}: ${s.disconnected}\n`
  if(s.unpaired > 0) t += `⏳ ${toSmallCaps('not paired yet')}: ${s.unpaired}\n`
  t += `\n${toSmallCaps('disconnected = session kept, not deleted. only /disconnect deletes.')}\n`
  if(s.disconnectedList.length){
    t += `\n${toSmallCaps('disconnected list:')}\n`
    for(let n of s.disconnectedList.slice(0,20)){
      t += `⚠️ ${n}\n`
    }
    if(s.disconnectedList.length > 20) t += `${toSmallCaps('and')} ${s.disconnectedList.length - 20} ${toSmallCaps('more...')}\n`
  }
  return t
}

function buildKeyboard(){
  return { reply_markup: { inline_keyboard: [
    [{ text: `🔄 ${toSmallCaps('refresh')}`, callback_data: `users_refresh` }, { text: `📋 ${toSmallCaps('list')}`, callback_data: `users_view_list` }],
    [{ text: `⬅️ ${toSmallCaps('back')}`, callback_data: `back_list` }]
  ] } }
}

export async function usersCommand(ctx){
  let text = buildText()
  return ctx.reply(text, { ...buildKeyboard(), ...doReply(ctx) })
}

export async function usersActions(ctx){
  const data = ctx.callbackQuery?.data || ''
  if(!data.startsWith('users_')) return
  try{ await ctx.answerCbQuery() }catch{}
  console.log('BUTTON CLICKED:', data)

  if(data === 'users_refresh'){
    let text = buildText()
    try{ await ctx.editMessageText(text, buildKeyboard()) }catch{ await ctx.reply(text, buildKeyboard()) }
    return
  }

  if(data === 'users_view_list' || data === 'users_view'){
    let s = getRealStats()
    let t = `📋 ${toSmallCaps('paired users')} (${s.total})\n\n`
    if(!s.pairedList.length) t += toSmallCaps('no paired users yet.')
    else {
      for(let n of s.pairedList){
        let mark = s.connectedList.includes(n) ? '✅' : '⚠️'
        t += `${mark} ${n} - ${s.connectedList.includes(n) ? toSmallCaps('connected') : toSmallCaps('disconnected')}\n`
      }
    }
    let kb = { reply_markup: { inline_keyboard: [
      [{ text: `🔄 ${toSmallCaps('refresh')}`, callback_data: `users_refresh` }],
      [{ text: `⬅️ ${toSmallCaps('back')}`, callback_data: `users_refresh` }]
    ] } }
    try{ await ctx.editMessageText(t, kb) }catch{ await ctx.reply(t, kb) }
    return
  }

  if(data.startsWith('users_view_')){
    let number = cleanPhone(data.replace('users_view_',''))
    let s = getRealStats()
    let isConn = s.connectedList.includes(number)
    let isPaired = s.pairedList.includes(number)
    let t = ''
    if(isConn) t = `✅ ${number}\n\n${toSmallCaps('status')}: ${toSmallCaps('connected')}`
    else if(isPaired) t = `⚠️ ${number}\n\n${toSmallCaps('status')}: ${toSmallCaps('disconnected - session kept')}`
    else t = `❌ ${number}\n\n${toSmallCaps('status')}: ${toSmallCaps('not found')}`
    try{ await ctx.editMessageText(t, buildKeyboard()) }catch{ await ctx.reply(t, buildKeyboard()) }
    return
  }
}

export function registerUsers(bot){
  bot.command('users', usersCommand)
  bot.action(/^users_/, usersActions)
}
export default registerUsers
