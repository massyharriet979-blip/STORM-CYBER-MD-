import fs from 'fs'

const DB_FILE = './database/telegram_sessions.json'
const SESSION_DIR = './sessions'

// ======================================
// STORM CYBER MD - DISCONNECT MANAGER
// ======================================

function toSmallCaps(text) {
  const map = {
    a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ', f:'ғ',
    g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ', k:'ᴋ', l:'ʟ',
    m:'ᴍ', n:'ɴ', o:'ᴏ', p:'ᴘ', q:'ǫ', r:'ʀ',
    s:'s', t:'ᴛ', u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x',
    y:'ʏ', z:'ᴢ'
  }

  return String(text || '')
    .toLowerCase()
    .split('')
    .map(c => map[c] || c)
    .join('')
}

const digits = value =>
  String(value || '').replace(/[^0-9]/g, '')

function cleanPhone(value) {
  let number = digits(value)

  if (number.startsWith('0')) {
    number = number.slice(1)
  }

  return number
}

function sessionPath(number) {
  return `${SESSION_DIR}/${number}`
}

function sessionExists(number) {
  try {
    return /^\d{7,15}$/.test(number) &&
      fs.existsSync(sessionPath(number))
  } catch {
    return false
  }
}

function loadDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) return {}

    const data = JSON.parse(
      fs.readFileSync(DB_FILE, 'utf8')
    )

    return data && typeof data === 'object' &&
      !Array.isArray(data) ? data : {}
  } catch (error) {
    console.log('TELEGRAM DATABASE ERROR:', error.message)
    return {}
  }
}

function saveDatabase(db) {
  fs.mkdirSync('./database', { recursive: true })

  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(db, null, 2)
  )
}

function getUserNumbers(userId) {
  const db = loadDatabase()
  const numbers = db[String(userId)]

  if (!Array.isArray(numbers)) return []

  return [...new Set(
    numbers
      .map(cleanPhone)
      .filter(number => /^\d{7,15}$/.test(number))
  )]
}

function ownsSession(userId, number) {
  return getUserNumbers(userId).includes(
    cleanPhone(number)
  )
}

function removeUserSession(userId, number) {
  const db = loadDatabase()
  const id = String(userId)

  if (!Array.isArray(db[id])) return

  db[id] = db[id].filter(
    item => cleanPhone(item) !== number
  )

  if (!db[id].length) {
    delete db[id]
  }

  saveDatabase(db)
}

function doReply(ctx) {
  if (ctx.message) {
    return {
      reply_parameters: {
        message_id: ctx.message.message_id
      }
    }
  }

  return {}
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
  } catch (error) {
    try {
      return await ctx.reply(text, extra)
    } catch (secondError) {
      console.log('TELEGRAM MESSAGE ERROR:', secondError.message)
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
  } catch {}
}

function getTelegramUserId(ctx) {
  return String(ctx.from?.id || '')
}

// ======================================
// DISCONNECT COMMAND
// ======================================

export async function disconnectCommand(ctx) {
  const userId = getTelegramUserId(ctx)

  if (!userId) {
    return ctx.reply(
      toSmallCaps('unable to identify your telegram account.')
    )
  }

  const raw = ctx.message?.text?.split(/\s+/)[1] || ''

  const status = await ctx.reply(
    `⌛ ${toSmallCaps('checking your sessions...')}`,
    doReply(ctx)
  )

  if (raw) {
    const number = cleanPhone(raw)

    if (!/^\d{7,15}$/.test(number)) {
      return ctx.telegram.editMessageText(
        ctx.chat.id,
        status.message_id,
        undefined,
        `❌ ${toSmallCaps('invalid phone number.')}`
      )
    }

    if (!ownsSession(userId, number)) {
      return ctx.telegram.editMessageText(
        ctx.chat.id,
        status.message_id,
        undefined,
        `🚫 ${toSmallCaps('this number is not registered to your telegram account.')}`
      )
    }

    if (!sessionExists(number)) {
      return ctx.telegram.editMessageText(
        ctx.chat.id,
        status.message_id,
        undefined,
        `🚫 ${toSmallCaps('your session folder was not found.')}`
      )
    }

    return ctx.telegram.editMessageText(
      ctx.chat.id,
      status.message_id,
      undefined,
      `⚠️ ${toSmallCaps('disconnect')} +${number}?\n\n` +
      `${toSmallCaps('this will log out your whatsapp session and delete its saved session folder.')}\n\n` +
      `${toSmallCaps('you will need to pair again to reconnect.')}`,
      confirmKeyboard(number)
    )
  }

  const numbers = getUserNumbers(userId)
    .filter(number => sessionExists(number))

  if (!numbers.length) {
    return ctx.telegram.editMessageText(
      ctx.chat.id,
      status.message_id,
      undefined,
      `🚫 ${toSmallCaps('you have no available sessions.')}\n\n` +
      `${toSmallCaps('pair a whatsapp number first using /pair.')}`
    )
  }

  const rows = []

  for (let i = 0; i < numbers.length; i += 2) {
    const row = [{
      text: `+${numbers[i]}`,
      callback_data: `disc_view_${numbers[i]}`
    }]

    if (numbers[i + 1]) {
      row.push({
        text: `+${numbers[i + 1]}`,
        callback_data: `disc_view_${numbers[i + 1]}`
      })
    }

    rows.push(row)
  }

  return ctx.telegram.editMessageText(
    ctx.chat.id,
    status.message_id,
    undefined,
    `✅ ${toSmallCaps('your available sessions')}\n\n` +
    `${toSmallCaps('select your number to disconnect it:')}\n\n` +
    `${toSmallCaps('only your registered numbers are shown.')}`,
    {
      reply_markup: {
        inline_keyboard: rows
      }
    }
  )
}

// ======================================
// BUTTON ACTIONS
// ======================================

export async function disconnectActions(ctx) {
  const data = ctx.callbackQuery?.data || ''
  const userId = getTelegramUserId(ctx)

  if (!data.startsWith('disc_')) return

  if (data.startsWith('disc_view_')) {
    await ctx.answerCbQuery().catch(() => {})

    const number = cleanPhone(
      data.slice('disc_view_'.length)
    )

    if (!ownsSession(userId, number)) {
      return updateMessage(
        ctx,
        `🚫 ${toSmallCaps('this session does not belong to your account.')}`
      )
    }

    if (!sessionExists(number)) {
      return updateMessage(
        ctx,
        `🚫 ${toSmallCaps('session folder not found.')}`
      )
    }

    return updateMessage(
      ctx,
      `⚠️ ${toSmallCaps('disconnect')} +${number}?\n\n` +
      `${toSmallCaps('this will log out your whatsapp session and delete its saved session folder.')}`,
      confirmKeyboard(number)
    )
  }

  if (data.startsWith('disc_confirm_')) {
    await ctx.answerCbQuery().catch(() => {})

    const number = cleanPhone(
      data.slice('disc_confirm_'.length)
    )

    if (!ownsSession(userId, number)) {
      return updateMessage(
        ctx,
        `🚫 ${toSmallCaps('you cannot disconnect another users session.')}`
      )
    }

    return doDisconnect(ctx, number, userId)
  }

  if (data.startsWith('disc_cancel_')) {
    const number = cleanPhone(
      data.slice('disc_cancel_'.length)
    )

    await ctx.answerCbQuery(
      'DISCONNECTION CANCELLED',
      { show_alert: true }
    ).catch(() => {})

    if (!ownsSession(userId, number)) {
      return updateMessage(
        ctx,
        `🚫 ${toSmallCaps('this session does not belong to your account.')}`
      )
    }

    return updateMessage(
      ctx,
      `🛑 ${toSmallCaps('disconnection cancelled')}\n\n` +
      `✅ ${toSmallCaps('your session was not deleted.')}\n` +
      `🔒 ${toSmallCaps('connection information preserved.')}`
    )
  }
}

// ======================================
// REAL DISCONNECTION
// ======================================

async function doDisconnect(ctx, number, userId) {
  try {
    if (!/^\d{7,15}$/.test(number)) {
      throw new Error('INVALID PHONE NUMBER')
    }

    if (!ownsSession(userId, number)) {
      throw new Error('SESSION DOES NOT BELONG TO THIS USER')
    }

    if (!sessionExists(number)) {
      throw new Error('SESSION FOLDER NOT FOUND')
    }

    await updateMessage(
      ctx,
      `⌛ ${toSmallCaps('disconnecting your session...')}\n\n` +
      `${toSmallCaps('please wait.')}`
    )

    // Main engine must handle the cleanup.
    if (typeof global.clearSession !== 'function') {
      throw new Error('SERVER SESSION CLEANUP IS UNAVAILABLE')
    }

    await global.clearSession(number)

    // Verify that the session folder was deleted.
    if (sessionExists(number)) {
      throw new Error('SESSION STILL EXISTS ON SERVER')
    }

    global.sessionMeta?.delete(number)

    removeUserSession(userId, number)

    await updateMessage(
      ctx,
      `✅ ${toSmallCaps('your whatsapp session was disconnected.')}\n\n` +
      `📁 ${toSmallCaps('session deleted:')} +${number}\n` +
      `🔒 ${toSmallCaps('session folder verified as deleted.')}\n\n` +
      `🔄 ${toSmallCaps('use /pair to reconnect.')}`
    )

    await popup(
      ctx,
      '✅ YOUR SESSION WAS DISCONNECTED!'
    )

  } catch (error) {
    console.log('DISCONNECT ERROR:', error.message)

    await updateMessage(
      ctx,
      `❌ ${toSmallCaps('disconnection failed')}\n\n` +
      `${toSmallCaps('reason:')} ${toSmallCaps(error.message)}`
    )

    await popup(
      ctx,
      '❌ DISCONNECTION FAILED!'
    )
  }
}

// ======================================
// COMPATIBILITY HANDLERS
// ======================================

export async function disconnectConfirm(ctx) {
  const number = cleanPhone(ctx.match?.[1] || '')
  const userId = getTelegramUserId(ctx)

  if (!ownsSession(userId, number)) {
    await ctx.answerCbQuery(
      'THIS SESSION DOES NOT BELONG TO YOUR ACCOUNT.',
      { show_alert: true }
    ).catch(() => {})

    return updateMessage(
      ctx,
      `🚫 ${toSmallCaps('this session does not belong to your account.')}`
    )
  }

  return doDisconnect(ctx, number, userId)
}

export async function disconnectCancel(ctx) {
  const number = cleanPhone(ctx.match?.[1] || '')
  const userId = getTelegramUserId(ctx)

  await ctx.answerCbQuery(
    'DISCONNECTION CANCELLED',
    { show_alert: true }
  ).catch(() => {})

  if (!ownsSession(userId, number)) {
    return updateMessage(
      ctx,
      `🚫 ${toSmallCaps('this session does not belong to your account.')}`
    )
  }

  return updateMessage(
    ctx,
    `🛑 ${toSmallCaps('disconnection cancelled')}\n\n` +
    `${toSmallCaps('your session was not deleted.')}`
  )
}

// ======================================
// REGISTER COMMANDS
// ======================================

export function registerDisconnect(bot) {
  bot.command('disconnect', disconnectCommand)
  bot.action(/^disc_/, disconnectActions)

  bot.action(/^del_confirm_(.*)$/, disconnectConfirm)
  bot.action(/^del_cancel_(.*)$/, disconnectCancel)
}

export default registerDisconnect
