import fs from 'fs'

function toSmallCaps(text){

  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}

  return String(text||'').toLowerCase().split('').map(c=>map[c]||c).join('')
}
const delay = (ms) => new Promise(r=>setTimeout(r,ms))
function doReply(ctx){
  try{
  if(ctx.message)
  return { reply_parameters: { message_id: ctx.message.message_id } } }catch{}

  return {}
}
                                                                        // ---------- REAL INFO FROM SERVER ----------
function getTgSessionFile(){
  return './database/telegram_sessions.json' }
function loadTgSessions(){
  try{
  if(!fs.existsSync(getTgSessionFile()))
  return {};
  return JSON.parse(fs.readFileSync(getTgSessionFile(),'utf8')) }catch{
  return {} }
}
function saveTgSessions(db){                                              fs.mkdirSync('./database',{recursive:true})
  fs.writeFileSync(getTgSessionFile(), JSON.stringify(db,null,2))
}
function removeTgSession(tgId, number){

  let db = loadTgSessions()

  if(db[tgId]) db[tgId] = db[tgId].filter(n => String(n) !== String(number))
  saveTgSessions(db)
}
function ownsTgSession(tgId, number){
  const db = loadTgSessions()
  const numbers = Array.isArray(db[String(tgId)])
    ? db[String(tgId)]
    : []

  number = String(number).replace(/[^0-9]/g, '')

  return numbers.some(n =>
    String(n).replace(/[^0-9]/g, '') === number
  )
}

function isRegistered(number){
  try{

  const c = JSON.parse(fs.readFileSync('./sessions/'+number+'/creds.json','utf8'))

  return c.registered === true
  }catch{
  return false }
}
function isSocketOpen(sock){

  if(!sock)
  return false
  try{
    // Baileys: sock.ws is the websocket, 1 = OPEN

  if(sock.ws && typeof sock.ws.readyState !== 'undefined')
  return sock.ws.readyState === 1
    // Fallback: if sock.user exists, Baileys considers it usable

  if(sock.user)
  return true

  if(sock.authState?.creds?.registered)
  return true
  }catch{}

  return false
}
function isConnected(number){
  number = String(number)

  const s = global.activeSessions?.get(number)

  if(s){

  if(s.connected && s.sock && isSocketOpen(s.sock))
  return true

  if(s.connected && s.sock && !s.sock.ws)
  return true

  if(s.sock && isSocketOpen(s.sock))
  return true
  }

  const sub = global.subbots?.get(number)

  if(sub){

  if(isSocketOpen(sub))
  return true
    // subbots map holds a live socket, if it has user it was connected

  if(sub.user)
  return true
    // If it is in subbots at all and NOT marked disconnected, trust it

  const meta = global.sessionMeta?.get(number)

  if(!meta?.disconnectedAt)
  return true
  }
  // FIX: registered creds + no real disconnect record = connected
  // This is the WhatsApp Active case. Pair saves creds.json with registered:true
  // but subbots/activeSessions may be empty for a moment / after restart.
  // Do NOT call it disconnected just because memory is empty.

  if(isRegistered(number)){

  const meta = global.sessionMeta?.get(number)

  if(meta?.disconnectedAt)
  return false

  if(meta?.reason && /logged out|logout|401|forbidden|removed/i.test(String(meta.reason)))
  return false

  return true
  }

  return false
}
function getRealInfo(number){
  number = String(number)

  const connected = isConnected(number)

  const registered = isRegistered(number)

  const meta = global.sessionMeta?.get(number) || {}

  const sess = global.activeSessions?.get(number)


  let status = 'not linked'

  let reason = 'never paired'
  // FIX: only say needs reconnection if we REALLY saw a disconnect

  const hasRealDisconnect = !!meta.disconnectedAt || (meta.reason && /logged out|logout|401|forbidden|removed|disconnected/i.test(String(meta.reason)))

  if(connected) { status = 'connected'; reason = 'linked and online' }
  else
  if(registered && hasRealDisconnect) { status = 'needs reconnection'; reason = meta.reason || 'logged out from whatsapp' }
  else
  if(registered) { status = 'connected'; reason = 'linked and online' }
  else { status = 'not linked'; reason = 'no session found' }

  // SINCE: how long ago it went off

  let sinceTs = meta.disconnectedAt || meta.connectedAt || null

  let sinceStr = 'unknown'

  if(connected && meta.connectedAt) sinceStr = formatAgo(meta.connectedAt)
  else
  if(sinceTs) sinceStr = formatAgo(sinceTs)

  // SERVER UP: bot uptime
  let upStr = 'unknown'
  try{
  if(global.runtime){
  const r = global.runtime(); upStr = `${r.d}d ${r.h}h ${r.m}m ${r.s}s` } }catch{}
  // Fallback: process uptime

  if(upStr === 'unknown'){

  const s = Math.floor(process.uptime())
    upStr = `${Math.floor(s/3600)}h ${Math.floor((s%3600)/60)}m ${s%60}s`
  }

  return { connected, registered, status, reason, sinceStr, upStr, meta, sess }
}
function formatAgo(ts){

  if(!ts)
  return 'unknown'

  let diff = Math.floor((Date.now() - ts)/1000)

  if(diff < 60)
  return `${diff}s ago`

  if(diff < 3600)
  return `${Math.floor(diff/60)}m ${diff%60}s ago`

  if(diff < 86400)
  return `${Math.floor(diff/3600)}h ${Math.floor((diff%3600)/60)}m ago`

  return `${Math.floor(diff/86400)}d ago`
}

// ---------- LIST: /session ----------
export async function sessionCommand(ctx){

  const tgId = String(ctx.from.id)

  const arg = (ctx.message?.text?.split(' ')[1] || '').replace(/[^0-9]/g,'')
  // /session <number> -> go straight to detail

  if(arg){
    if(!ownsTgSession(tgId, arg)){
      return ctx.reply(toSmallCaps('❌ you do not own this session.'))
    }
    return sendDetail(ctx, arg, false)
  }


  const db = loadTgSessions()

  let myNumbers = db[tgId] || []

  // FIX: only numbers NOT disconnected. Disconnected = folder deleted by /disconnect
  // So filter to folders that still exist. If folder gone, don't show.
  myNumbers = myNumbers.filter(n => {
    try{
  return fs.existsSync('./sessions/'+n+'/creds.json') }catch{
  return false }
  })


  if(!myNumbers.length){

  return ctx.reply(toSmallCaps(`❌ ʏᴏᴜ ʜᴀᴠᴇ ɴᴏ sᴇssɪᴏɴs ʏᴇᴛ. ᴜsᴇ /ᴘᴀɪʀ 2567... ᴛᴏ ᴄᴏɴɴᴇᴄᴛ ᴀ ɴᴜᴍʙᴇʀ.`), doReply(ctx))
  }


  let lines = myNumbers.map(n => {

  const info = getRealInfo(n)

  const dot = info.connected ? '🟢' : '🔴'

  return `${dot} +${n} — ${info.status}`
  }).join('\n')


  const msg = `${toSmallCaps('ʏᴏᴜʀ sᴇssɪᴏɴs')}\n\n${lines}\n\n${toSmallCaps('ᴛᴀᴘ ᴀ ɴᴜᴍʙᴇʀ ᴛᴏ ᴠɪᴇᴡ ᴅᴇᴛᴀɪʟs')}`

  // Buttons: one per number

  const kb = { reply_markup: { inline_keyboard: myNumbers.map(n => [{ text: `📱 +${n} ${isConnected(n)?'🟢':'🔴'}`, callback_data: `sess_view_${n}` }]) } }

  return ctx.reply(msg, { ...kb, ...doReply(ctx) })
}
                                                                        // ---------- DETAIL ----------
async function sendDetail(ctx, number, isEdit = false){
  number = String(number).replace(/[^0-9]/g,'')

  if(!ownsTgSession(ctx.from.id, number)){
    return ctx.reply(toSmallCaps('❌ you do not own this session.'))
  }

  const info = getRealInfo(number)

  const dot = info.connected ? '🟢' : '🔴'

  // Same filter as screenshot, our own words, all smallcaps

  let msg = ''
  msg += `┌────────( ${toSmallCaps('session')} )\n`
  msg += `│ ➣ ${toSmallCaps('number')} : +${number}\n`
  msg += `│ ➣ ${toSmallCaps('status')} : ${dot} ${toSmallCaps(info.status)}\n`
  msg += `└────────\n\n`
  msg += `┌────────( ${toSmallCaps('stats')} )\n`
  msg += `│ ➣ ${toSmallCaps('reason')} : ${toSmallCaps(info.reason)}\n`
  msg += `│ ➣ ${toSmallCaps('since')} : ${toSmallCaps(info.sinceStr)}\n`
  msg += `│ ➣ ${toSmallCaps('server')} : ${toSmallCaps('server 1 of 1')}\n`
  msg += `│ ➣ ${toSmallCaps('server up')} : ${toSmallCaps(info.upStr)}\n`
  msg += `└────────\n\n`

  let kb
  if(info.connected){
    // CONNECTED: no re-pair, no remove, no refresh. Only BACK.
    msg += `🟢 ${toSmallCaps('this number is linked and connected to whatsapp.')}\n\n${toSmallCaps('your bot is online and ready to use.')}`
    kb = { reply_markup: { inline_keyboard: [[{ text: `⬅️ ${toSmallCaps('back')}`, callback_data: `sess_back` }]] } }
  } else {                                                                  // NOT CONNECTED: show all 4 buttons like screenshot
    msg += `🔴 ${toSmallCaps('this number must be reconnected.')}\n${toSmallCaps('the servers are fine, the problem comes from your number.')}\n\n${toSmallCaps('tap re-pair to get a new pairing code.')}`
    kb = { reply_markup: { inline_keyboard: [                                 [{ text: `🔗 ${toSmallCaps('re-pair now')}`, callback_data: `sess_repair_${number}` }, { text: `🗑️ ${toSmallCaps('remove')}`, callback_data: `sess_remove_${number}` }],
      [{ text: `🔄 ${toSmallCaps('refresh')}`, callback_data: `sess_refresh_${number}` }, { text: `⬅️ ${toSmallCaps('back')}`, callback_data: `sess_back` }]
    ] } }
  }


  if(isEdit){
    try{ await ctx.editMessageText(msg, kb) }catch{ await ctx.reply(msg, kb) }
  } else {
    await ctx.reply(msg, { ...kb, ...doReply(ctx) })
  }
}

// ---------- BUTTON ACTIONS ----------
export async function sessionActions(ctx){
  const data = ctx.callbackQuery?.data || ''

  if(!data.startsWith('sess_'))
  return
  try{ await ctx.answerCbQuery() }catch{}

  // BACK -> list again

  if(data === 'sess_back'){
    try{ await ctx.deleteMessage() }catch{}
    // Fake a /session list by calling sessionCommand with no arg
  const fakeCtx = { ...ctx, message: { text: '/session' }, from: ctx.from, reply: ctx.reply.bind(ctx) }                                           // Simpler: rebuild list here
  const tgId = String(ctx.from.id)

  const db = loadTgSessions()

  let myNumbers = (db[tgId] || []).filter(n => { try{
  return fs.existsSync('./sessions/'+n+'/creds.json') }catch{
  return false } })

  if(!myNumbers.length)
  return ctx.reply(toSmallCaps(`❌ ʏᴏᴜ ʜᴀᴠᴇ ɴᴏ sᴇssɪᴏɴs ʏᴇᴛ. ᴜsᴇ /ᴘᴀɪʀ 2567...`))

  let lines = myNumbers.map(n => {
  const info = getRealInfo(n);
  return `${info.connected?'🟢':'🔴'} +${n} — ${info.status}` }).join('\n')

  const msg = `${toSmallCaps('ʏᴏᴜʀ sᴇssɪᴏɴs')}\n\n${lines}\n\n${toSmallCaps('ᴛᴀᴘ ᴀ ɴᴜᴍʙᴇʀ ᴛᴏ ᴠɪᴇᴡ ᴅᴇᴛᴀɪʟs')}`

  const kb = { reply_markup: { inline_keyboard: myNumbers.map(n => [{ text: `📱 +${n} ${isConnected(n)?'🟢':'🔴'}`, callback_data: `sess_view_${n}` }]) } }

  return ctx.reply(msg, kb)                                             }

  // Verify ownership before viewing, refreshing,
  // removing, confirming deletion, or re-pairing.
  const protectedActions = [
    'sess_view_',
    'sess_refresh_',
    'sess_remove_',
    'sess_delconfirm_',
    'sess_repair_'
  ]

  const actionPrefix = protectedActions.find(prefix =>
    data.startsWith(prefix)
  )

  if(actionPrefix){
    const number = data.slice(actionPrefix.length)
      .replace(/[^0-9]/g, '')

    if(!number || !ownsTgSession(ctx.from.id, number)){
      return ctx.reply(toSmallCaps('❌ you do not own this session.'))
    }
  }

  // VIEW detail

  if(data.startsWith('sess_view_')){

  const number = data.replace('sess_view_','')
    try{ await ctx.deleteMessage() }catch{}

  return sendDetail(ctx, number, false)
  }
                                                                          // REFRESH detail

  if(data.startsWith('sess_refresh_')){

  const number = data.replace('sess_refresh_','')

  return sendDetail(ctx, number, true)
  }
                                                                          // REMOVE -> confirm

  if(data.startsWith('sess_remove_')){

  const number = data.replace('sess_remove_','')

  const kb = { reply_markup: { inline_keyboard: [
      [{ text: `✅ ${toSmallCaps('yes, remove')}`, callback_data: `sess_delconfirm_${number}` }, { text: `❌ ${toSmallCaps('cancel')}`, callback_data: `sess_refresh_${number}` }]
    ] } }

  return ctx.reply(toSmallCaps(`⚠️ ᴀʀᴇ ʏᴏᴜ sᴜʀᴇ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ʀᴇᴍᴏᴠᴇ +${number} ? ᴛʜɪs ᴡɪʟʟ ᴅᴇʟᴇᴛᴇ ᴛʜᴇ sᴇssɪᴏɴ ғʀᴏᴍ ᴛʜᴇ sᴇʀᴠᴇʀ.`), kb)
  }

  // REMOVE confirm -> delete

  if(data.startsWith('sess_delconfirm_')){

  const number = data.replace('sess_delconfirm_','')
    try{

  if(typeof global.clearSession === 'function') await global.clearSession(number)
      removeTgSession(String(ctx.from.id), number)

  if(global.subbots?.has(number)) global.subbots.delete(number)

  if(global.sessionMeta?.has(number)) global.sessionMeta.delete(number)
    }catch(e){ console.log('sess remove err', e.message) }
    try{ await ctx.deleteMessage() }catch{}

  return ctx.reply(toSmallCaps(`✅ +${number} ${toSmallCaps('removed. use /pair to connect again.')}`))
  }
                                                                          // RE-PAIR -> if registered, try reconnect first. If not registered / logged out, get new code.

  if(data.startsWith('sess_repair_')){

  const number = data.replace('sess_repair_','')
    await ctx.reply(toSmallCaps(`🔄 ${toSmallCaps('reconnecting')} +${number}...`))
      try{
      // 1. If still registered, try silent reconnect (no new code needed)

  if(isRegistered(number) && typeof global.startSession === 'function'){
  const ok = await (async () => {
          await global.startSession(number, String(ctx.from.id), false, global.subbotHooks || {})
            for(let i=0;i<20;i++){ await delay(1000);
  if(isConnected(number))
  return true }

  return isConnected(number)
        })()

  if(ok){

  return ctx.reply(toSmallCaps(`✅ +${number} ${toSmallCaps('reconnected! try .alive on whatsapp')}`))
        }                                                                     }
      // 2. Not registered / reconnect failed -> new pairing code

  if(typeof global.requestPairFromEngine !== 'function'){

  return ctx.reply(toSmallCaps(`❌ ${toSmallCaps('engine not ready, restart bot and try again')}`))
      }

  const code = await global.requestPairFromEngine(number, {
        onConnected: () => { ctx.reply(toSmallCaps(`✅ +${number} ${toSmallCaps('connected! session saved')}`)).catch(()=>{}) }
      })

  const pairMsg = `✅ ${toSmallCaps('pairing code generated')}\n\n📲 ${toSmallCaps('number:')} +${number}\n\n<code>${code}</code>\n\n${toSmallCaps('open whatsapp > linked devices > link with phone number, and enter this code.')}\n\n${toSmallCaps('code expires in 5 minutes')}`

  return ctx.reply(pairMsg, { parse_mode: 'HTML' })
    }catch(e){

  return ctx.reply(toSmallCaps(`❌ ${toSmallCaps('failed to re-pair')}: ${e.message}`))
    }
  }
}
