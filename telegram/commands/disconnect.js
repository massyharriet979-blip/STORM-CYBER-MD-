import fs from 'fs'

function toSmallCaps(text) {
  const map = {
    a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',
    h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',
    o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',
    v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'
  }
  return String(text || '').toLowerCase()
    .split('').map(c => map[c] || c).join('')
}

function doReply(ctx) {
  try {
    if (ctx.message) {
      return {
        reply_parameters: {
          message_id: ctx.message.message_id
        }
      }
    }
  } catch {}
  return {}
}

const digits = s => String(s || '').replace(/[^0-9]/g, '')

function cleanPhone(n) {
  let id = digits(n)
  if (id.startsWith('0')) id = id.slice(1)
  return id
}

function sessionPath(number) {
  return `./sessions/${number}`
}

function sessionExists(number) {
  try {
    return fs.existsSync(sessionPath(number))
  } catch {
    return false
  }
}

function confirmKeyboard(number) {
  return {
    reply_markup: {
      inline_keyboard: [[
        {
          text: `✅ ${toSmallCaps('yes, disconnect')}`,
          callback_data: `disc_confirm_${number}`
        },
        {
          text: `❌ ${toSmallCaps('cancel')}`,
          callback_data: `disc_cancel_${number}`
        }
      ]]
    }
  }
}

async function updateMessage(ctx, text, extra = {}) {
  try {
    if (ctx.callbackQuery) {
      return await ctx.editMessageText(text, extra)
    }

    return await ctx.reply(text, extra)
  } catch {
    try {
      return await ctx.reply(text, extra)
    } catch (e) {
      console.log('Telegram message error:', e.message)
    }
  }
}

async function popup(ctx, message) {
  try {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery(message, {
        show_alert: true
      })
    }
  } catch (e) {
    console.log('Popup error:', e.message)
  }
}

// CHECK AVAILABLE SERVERS
export async function disconnectCommand(ctx) {
  let status

  try {
    status = await ctx.reply(
      `⌛️ ${toSmallCaps('checking available servers...')}`,
      doReply(ctx)
    )
  } catch (e) {
    console.log('Status error:', e.message)
    return
  }

  const raw = ctx.message?.text?.split(/\s+/)[1] || ''
  const number = cleanPhone(raw)

  // LIST AVAILABLE SESSIONS
  if (!number) {
    let folders = []

    try {
      folders = fs.readdirSync('./sessions')
        .filter(d => /^\d+$/.test(d))
    } catch {}

    if (!folders.length) {
      return ctx.telegram.editMessageText(
        ctx.chat.id,
        status.message_id,
        undefined,
        `🚫 ${toSmallCaps('no available sessions found.')}`
      )
    }

    const rows = []

    for (let i = 0; i < folders.length; i += 2) {
      const row = [{
        text: folders[i],
        callback_data: `disc_view_${folders[i]}`
      }]

      if (folders[i + 1]) {
        row.push({
          text: folders[i + 1],
          callback_data: `disc_view_${folders[i + 1]}`
        })
      }

      rows.push(row)
    }

    const t =
      `✅ ${toSmallCaps('available servers found')}\n\n` +
      `${toSmallCaps('tap a number to disconnect it:')}\n\n` +
      `${toSmallCaps('select carefully. disconnecting deletes its session.')}`

    return ctx.telegram.editMessageText(
      ctx.chat.id,
      status.message_id,
      undefined,
      t,
      { reply_markup: { inline_keyboard: rows } }
    )
  }

  // CHECK SPECIFIC NUMBER
  if (!sessionExists(number)) {
    return ctx.telegram.editMessageText(
      ctx.chat.id,
      status.message_id,
      undefined,
      `🚫 ${toSmallCaps('no session found for this number.')}\n\n` +
      `${toSmallCaps('number:')} ${number}\n` +
      `${toSmallCaps('please check the number and try again.')}`
    )
  }

  const t =
    `⚠️ ${toSmallCaps('disconnect')} ${number} ?\n\n` +
    `${toSmallCaps('this will log it out and delete its session folder from server.')}\n\n` +
    `${toSmallCaps('you will need to /pair again to reconnect.')}`

  return ctx.telegram.editMessageText(
    ctx.chat.id,
    status.message_id,
    undefined,
    t,
    confirmKeyboard(number)
  )
}

// BUTTON ACTIONS
export async function disconnectActions(ctx) {
  const data = ctx.callbackQuery?.data || ''

  if (!data.startsWith('disc_')) return

  console.log('BUTTON CLICKED:', data)

  // VIEW SESSION
  if (data.startsWith('disc_view_')) {
    try {
      await ctx.answerCbQuery()
    } catch {}

    const number = cleanPhone(data.replace('disc_view_', ''))

    if (!sessionExists(number)) {
      return updateMessage(
        ctx,
        `🚫 ${toSmallCaps('no session found for this number.')}`
      )
    }

    const t =
      `⚠️ ${toSmallCaps('disconnect')} ${number} ?\n\n` +
      `${toSmallCaps('this will log it out and delete its session folder from server.')}`

    return updateMessage(ctx, t, confirmKeyboard(number))
  }

  // CONFIRM DISCONNECT
  if (data.startsWith('disc_confirm_')) {
    const number = cleanPhone(data.replace('disc_confirm_', ''))
    return doDisconnect(ctx, number)
  }

  // CANCEL DISCONNECT
  if (data.startsWith('disc_cancel_')) {
    const number = cleanPhone(data.replace('disc_cancel_', ''))

    try {
      await ctx.answerCbQuery(
        'DISCONNECTION CANCELLED',
        { show_alert: true }
      )
    } catch {}

    const exists = sessionExists(number)

    return updateMessage(
      ctx,
      `🛑 ${toSmallCaps('disconnection cancelled')}\n\n` +
      (exists
        ? `✅ ${toSmallCaps('your session was not deleted.')}\n` +
          `🔒 ${toSmallCaps('connection information preserved.')}`
        : `ℹ️ ${toSmallCaps('session is no longer available.')}`)
    )
  }
}

// REAL DISCONNECTION
async function doDisconnect(ctx, number) {
  try {
    if (!number) {
      await updateMessage(
        ctx,
        `❌ ${toSmallCaps('invalid server number.')}`
      )
      await popup(ctx, 'INVALID SERVER NUMBER!')
      return
    }

    // VERIFY SESSION BEFORE DISCONNECTING
    if (!sessionExists(number)) {
      await updateMessage(
        ctx,
        `🚫 ${toSmallCaps('no session found for this number.')}\n\n` +
        `${toSmallCaps('nothing was disconnected.')}`
      )
      await popup(ctx, 'NO SESSION FOUND FOR THIS NUMBER!')
      return
    }

    // DISCONNECTING STATUS
    await updateMessage(
      ctx,
      `⌛️ ${toSmallCaps('disconnecting...')}\n\n` +
      `${toSmallCaps('please wait while the server is being disconnected.')}`
    )

    // USE MAIN ENGINE DISCONNECT FUNCTION
    if (typeof global.clearSession === 'function') {
      await global.clearSession(number)
    } else {
      // FALLBACK
      const activeSocket = global.activeSessions?.get(number)
        || global.subbots?.get(number)

      // Close socket if available
      try {
        if (typeof activeSocket?.end === 'function') {
          activeSocket.end(
            new Error('Session disconnected by administrator')
          )
        } else if (typeof activeSocket?.ws?.close === 'function') {
          activeSocket.ws.close()
        }
      } catch (e) {
        console.log('Socket close:', e.message)
      }

      if (global.activeSessions?.has(number)) {
        global.activeSessions.delete(number)
      }

      if (global.subbots?.has(number)) {
        global.subbots.delete(number)
      }

      fs.rmSync(sessionPath(number), {
        recursive: true,
        force: true
      })
    }

    // ENSURE SESSION FOLDER IS DELETED
    if (sessionExists(number)) {
      fs.rmSync(sessionPath(number), {
        recursive: true,
        force: true
      })
    }

    // VERIFY REAL DELETION
    if (sessionExists(number)) {
      throw new Error('SESSION STILL EXISTS ON SERVER')
    }

    // REMOVE SESSION METADATA
    if (global.sessionMeta?.has(number)) {
      global.sessionMeta.delete(number)
    }

    // REMOVE TELEGRAM SESSION RECORDS
    try {
      const file = './database/telegram_sessions.json'

      if (fs.existsSync(file)) {
        const db = JSON.parse(
          fs.readFileSync(file, 'utf8')
        )

        for (const key of Object.keys(db)) {
          if (Array.isArray(db[key])) {
            db[key] = db[key].filter(
              n => cleanPhone(n) !== number
            )

            if (!db[key].length) {
              delete db[key]
            }
          }
        }

        fs.writeFileSync(
          file,
          JSON.stringify(db, null, 2)
        )
      }
    } catch (e) {
      console.log('Telegram database cleanup:', e.message)
    }

    // FINAL SUCCESS MESSAGE
    await updateMessage(
      ctx,
      `✅️ ${toSmallCaps('disconnected from the servers')}\n\n` +
      `📁 ${toSmallCaps('session deleted:')} ${number}\n` +
      `🔒 ${toSmallCaps('session folder verified as deleted.')}\n\n` +
      `🔄 ${toSmallCaps('use /pair to reconnect.')}`
    )

    // SUCCESS POPUP
    await popup(
      ctx,
      '✅ SERVER DISCONNECTED SUCCESSFULLY!'
    )

  } catch (e) {
    console.log('disconnect err:', e.message)

    await updateMessage(
      ctx,
      `❌ ${toSmallCaps('disconnection failed')}\n\n` +
      `${toSmallCaps('reason:')} ${e.message}`
    )

    await popup(
      ctx,
      '❌ DISCONNECTION FAILED!'
    )
  }
}

// COMPATIBILITY HANDLERS
export async function disconnectConfirm(ctx) {
  const number = cleanPhone(ctx.match?.[1] || '')
  return doDisconnect(ctx, number)
}

export async function disconnectCancel(ctx) {
  const number = cleanPhone(ctx.match?.[1] || '')

  try {
    await ctx.answerCbQuery(
      'DISCONNECTION CANCELLED',
      { show_alert: true }
    )
  } catch {}

  return updateMessage(
    ctx,
    `🛑 ${toSmallCaps('disconnection cancelled')}\n\n` +
    `${toSmallCaps('your session was not deleted.')}`
  )
}

// REGISTER COMMANDS
export function registerDisconnect(bot) {
  bot.command('disconnect', disconnectCommand)
  bot.action(/^disc_/, disconnectActions)
  bot.action(/del_confirm_(.*)/, disconnectConfirm)
  bot.action(/del_cancel_(.*)/, disconnectCancel)
}

export default registerDisconnect
