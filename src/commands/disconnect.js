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

function confirmKeyboard(number){
  return { reply_markup: { inline_keyboard: [
    [{ text: `✅ ${toSmallCaps('yes, disconnect')}`, callback_data: `disc_confirm_${number}` }, { text: `❌ ${toSmallCaps('cancel')}`, callback_data: `disc_cancel_${number}` }]
  ] } }
}

export async function disconnectCommand(ctx){
  let raw = ''
  try{ raw = ctx.message?.text?.split(' ')[1] || '' }catch{}
  let number = cleanPhone(raw)

  if(!number){
    // No number -> show list to pick from
    let folders = []
    try{ folders = fs.readdirSync('./sessions').filter(d => /^\d+$/.test(d)) }catch{ folders = [] }
    if(!folders.length) return ctx.reply(toSmallCaps('no sessions to disconnect.'), doReply(ctx))
    let rows = []
    for(let i=0;i<folders.length;i+=2){
      let row = [{ text: folders[i], callback_data: `disc_view_${folders[i]}` }]
      if(folders[i+1]) row.push({ text: folders[i+1], callback_data: `disc_view_${folders[i+1]}` })
      rows.push(row)
    }
    let t = `${toSmallCaps('tap a number to disconnect it:')}\n\n${toSmallCaps('this will delete its session folder from server.')}`
    return ctx.reply(t, { reply_markup: { inline_keyboard: rows }, ...doReply(ctx) })
  }

  let exists = fs.existsSync(`./sessions/${number}`)
  if(!exists){
    return ctx.reply(toSmallCaps(`❌ ${number} not found on server. nothing to disconnect.`), doReply(ctx))
  }

  let t = `⚠️ ${toSmallCaps('disconnect')} ${number} ?\n\n${toSmallCaps('this will log it out and delete its session folder from server. you will need to /pair again to reconnect.')}`
  return ctx.reply(t, { ...confirmKeyboard(number), ...doReply(ctx) })
}

// Called when user taps disc_view_ or disc_confirm_ or disc_cancel_
export async function disconnectActions(ctx){
  const data = ctx.callbackQuery?.data || ''
  if(!data.startsWith('disc_')) return
  try{ await ctx.answerCbQuery() }catch{}
  console.log('BUTTON CLICKED:', data)

  if(data.startsWith('disc_view_')){
    let number = cleanPhone(data.replace('disc_view_',''))
    let t = `⚠️ ${toSmallCaps('disconnect')} ${number} ?\n\n${toSmallCaps('this will log it out and delete its session folder from server.')}`
    try{ await ctx.editMessageText(t, confirmKeyboard(number)) }catch{ await ctx.reply(t, confirmKeyboard(number)) }
    return
  }

  if(data.startsWith('disc_confirm_')){
    let number = cleanPhone(data.replace('disc_confirm_',''))
    return doDisconnect(ctx, number)
  }

  if(data.startsWith('disc_cancel_')){
    let number = cleanPhone(data.replace('disc_cancel_',''))
    let t = toSmallCaps(`❌ disconnect cancelled for ${number}. session kept.`)
    try{ await ctx.editMessageText(t) }catch{ await ctx.reply(t) }
    return
  }
}

async function doDisconnect(ctx, number){
  // ONLY PLACE THAT DELETES - via clearSession in pairManager (File 1)
  try{
    let exists = fs.existsSync(`./sessions/${number}`)
    if(!exists){
      let t = toSmallCaps(`❌ ${number} not found. nothing to delete.`)
      try{ await ctx.editMessageText(t) }catch{ await ctx.reply(t) }
      return
    }
    if(typeof global.clearSession === 'function'){
      await global.clearSession(number)
    } else {
      // Fallback if index.js not loaded yet
      if(global.activeSessions?.has(number)) global.activeSessions.delete(number)
      if(global.subbots?.has(number)) global.subbots.delete(number)
      fs.rmSync(`./sessions/${number}`, { recursive: true, force: true })
    }
    if(global.sessionMeta?.has(number)) global.sessionMeta.delete(number)
    // Clean telegram_sessions.json for this number
    try{
      let file = './database/telegram_sessions.json'
      if(fs.existsSync(file)){
        let db = JSON.parse(fs.readFileSync(file,'utf8'))
        for(let k of Object.keys(db)){
          db[k] = db[k].filter(n => cleanPhone(n) !== number)
          if(!db[k].length) delete db[k]
        }
        fs.writeFileSync(file, JSON.stringify(db,null,2))
      }
    }catch{}

    let t = `✅ ${toSmallCaps('disconnected')} ${number}\n\n${toSmallCaps('session deleted from server. use /pair to reconnect.')}`
    try{ await ctx.editMessageText(t) }catch{ await ctx.reply(t) }
  }catch(e){
    console.log('disconnect err', e.message)
    let t = toSmallCaps(`❌ failed to disconnect ${number}: ${e.message}`)
    try{ await ctx.editMessageText(t) }catch{ await ctx.reply(t) }
  }
}

// Legacy handlers - kept so old messages still work
export async function disconnectConfirm(ctx){
  const number = cleanPhone(ctx.match?.[1] || '')
  try{ await ctx.answerCbQuery() }catch{}
  return doDisconnect(ctx, number)
}
export async function disconnectCancel(ctx){
  const number = cleanPhone(ctx.match?.[1] || '')
  try{ await ctx.answerCbQuery() }catch{}
  let t = toSmallCaps(`❌ disconnect cancelled for ${number}. session kept.`)
  try{ await ctx.editMessageText(t) }catch{ await ctx.reply(t) }
}

export function registerDisconnect(bot){
  bot.command('disconnect', disconnectCommand)
  bot.action(/^disc_/, disconnectActions)
  bot.action(/del_confirm_(.*)/, disconnectConfirm)
  bot.action(/del_cancel_(.*)/, disconnectCancel)
}
export default registerDisconnect
