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

function getInfo(number){
  number = cleanPhone(number)
  let registered = false
  try{
    let c = JSON.parse(fs.readFileSync(`./sessions/${number}/creds.json`,'utf8'))
    registered = c.registered === true
  }catch{}
  let live = global.activeSessions?.get(number)
  let connected = !!(live?.connected && live?.sock)
  if(!connected && global.subbots?.has(number)) connected = true
  return { number, registered, connected }
}

function getAllNumbers(){
  try{ return fs.readdirSync('./sessions').filter(d => /^\d+$/.test(d)).sort() }catch{ return [] }
}

function buildListText(){
  let nums = getAllNumbers()
  if(!nums.length) return toSmallCaps('no sessions found on server.')
  let connected = nums.filter(n => getInfo(n).connected).length
  let registered = nums.filter(n => getInfo(n).registered).length
  let t = `📋 ${toSmallCaps('all sessions')} (${nums.length})\n\n`
  t += `✅ ${toSmallCaps('connected')}: ${connected}\n`
  t += `📦 ${toSmallCaps('paired')}: ${registered}\n`
  t += `⚠️ ${toSmallCaps('disconnected')}: ${registered - connected}\n\n`
  t += `${toSmallCaps('tap a number to see its session:')}\n\n`
  for(let n of nums){
    let info = getInfo(n)
    let mark = info.connected ? '✅' : info.registered ? '⚠️' : '⏳'
    let label = info.connected ? toSmallCaps('connected') : info.registered ? toSmallCaps('disconnected') : toSmallCaps('not paired')
    t += `${mark} ${n} - ${label}\n`
  }
  return t
}

function buildKeyboard(){
  let nums = getAllNumbers()
  let rows = []
  for(let i=0;i<nums.length;i+=2){
    let row = [{ text: nums[i], callback_data: `list_view_${nums[i]}` }]
    if(nums[i+1]) row.push({ text: nums[i+1], callback_data: `list_view_${nums[i+1]}` })
    rows.push(row)
  }
  rows.push([{ text: `🔄 ${toSmallCaps('refresh')}`, callback_data: `list_refresh` }])
  return { reply_markup: { inline_keyboard: rows } }
}

export async function listCommand(ctx){
  let text = buildListText()
  return ctx.reply(text, { ...buildKeyboard(), ...doReply(ctx) })
}

export async function listActions(ctx){
  const data = ctx.callbackQuery?.data || ''
  // Handles: list_view_, list_refresh, list_page_, reconnect_, back_list
  if(!data.startsWith('list_') && !data.startsWith('reconnect_') && data !== 'back_list') return
  try{ await ctx.answerCbQuery() }catch{}
  console.log('BUTTON CLICKED:', data)

  if(data === 'back_list' || data === 'list_refresh' || data === 'list_back'){
    let text = buildListText()
    try{ await ctx.editMessageText(text, buildKeyboard()) }catch{ await ctx.reply(text, buildKeyboard()) }
    return
  }

  if(data.startsWith('list_view_')){
    let number = cleanPhone(data.replace('list_view_',''))
    let info = getInfo(number)
    let live = global.activeSessions?.get(number)
    let meta = global.sessionMeta?.get(number) || {}
    let t = ''
    if(info.connected) t = `✅ ${toSmallCaps('session')} - ${number}\n\n${toSmallCaps('status')}: ${toSmallCaps('connected')}\n${toSmallCaps('registered')}: ${toSmallCaps('yes')}`
    else if(info.registered) t = `⚠️ ${toSmallCaps('session')} - ${number}\n\n${toSmallCaps('status')}: ${toSmallCaps('disconnected - session kept')}\n${toSmallCaps('registered')}: ${toSmallCaps('yes')}\n${toSmallCaps('use /disconnect to delete it.')}`
    else t = `⏳ ${toSmallCaps('session')} - ${number}\n\n${toSmallCaps('status')}: ${toSmallCaps('not paired yet')}`

    let kb = { reply_markup: { inline_keyboard: [
      [{ text: `🔄 ${toSmallCaps('refresh')}`, callback_data: `list_view_${number}` }, { text: `❌ ${toSmallCaps('disconnect')}`, callback_data: `disc_view_${number}` }],
      [{ text: `⬅️ ${toSmallCaps('back')}`, callback_data: `back_list` }]
    ] } }
    try{ await ctx.editMessageText(t, kb) }catch{ await ctx.reply(t, kb) }
    return
  }

  if(data.startsWith('reconnect_')){
    let number = cleanPhone(data.replace('reconnect_',''))
    let t = toSmallCaps(`ℹ️ ${number} - to reconnect, use /disconnect ${number} first, then /pair ${number} again. session is kept until you disconnect it.`)
    try{ await ctx.editMessageText(t, { reply_markup: { inline_keyboard: [[{ text: `⬅️ ${toSmallCaps('back')}`, callback_data: `back_list` }]] } }) }catch{ await ctx.reply(t) }
    return
  }
}

export function registerList(bot){
  bot.command('list', listCommand)
  bot.action(/^list_/, listActions)
  bot.action('back_list', listActions)
  bot.action(/^reconnect_/, listActions)
}
export default registerList
