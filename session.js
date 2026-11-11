import fs from 'fs'

// ======================================
// STORM CYBER MD - SESSION MANAGER
// ======================================

// ---------- BASIC HELPERS ----------

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function toSmallCaps(text) {
  const map = {
    a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ',
    f:'ғ', g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ',
    k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ',
    p:'ᴘ', q:'ǫ', r:'ʀ', s:'s', t:'ᴛ',
    u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x', y:'ʏ', z:'ᴢ'
  }

  return String(text ?? '')
    .toLowerCase()
    .split('')
    .map(char => map[char] || char)
    .join('')
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const wrap = text => `<blockquote>${text}</blockquote>`

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

function cleanPhone(number) {
  let value = String(number ?? '').replace(/\D/g, '')

  if (value.startsWith('0')) {
    value = value.slice(1)
  }

  return value
}

// ======================================
// TELEGRAM SESSION DATABASE
// ======================================

function getTgSessionFile() {
  return './database/telegram_sessions.json'
}

function loadTgSessions() {
  try {
    const file = getTgSessionFile()

    if (!fs.existsSync(file)) return {}

    const db = JSON.parse(
      fs.readFileSync(file, 'utf8')
    )

    return db && typeof db === 'object' && !Array.isArray(db)
      ? db
      : {}

  } catch (e) {
    console.log('SESSION DATABASE ERROR:', e.message)
    return {}
  }
}

function saveTgSessions(db) {
  fs.mkdirSync('./database', {
    recursive: true
  })

  fs.writeFileSync(
    getTgSessionFile(),
    JSON.stringify(db, null, 2)
  )
}

function saveTgSession(tgId, number) {
  const db = loadTgSessions()
  number = cleanPhone(number)

  if (!db[tgId]) {
    db[tgId] = []
  }

  if (!db[tgId].includes(number)) {
    db[tgId].push(number)
  }

  saveTgSessions(db)
}

function removeTgSession(tgId, number) {
  const db = loadTgSessions()
  number = cleanPhone(number)

  if (db[tgId]) {
    db[tgId] = db[tgId].filter(
      n => cleanPhone(n) !== number
    )
  }

  saveTgSessions(db)
}

function ownsSession(tgId, number) {
  const db = loadTgSessions()
  const numbers = db[String(tgId)] || []

  number = cleanPhone(number)

  return numbers.some(
    n => cleanPhone(n) === number
  )
}

function getUserNumbers(tgId) {
  const db = loadTgSessions()

  return (db[String(tgId)] || [])
    .map(cleanPhone)
    .filter(Boolean)
    .filter(number => {
      return fs.existsSync(
        `./sessions/${number}/creds.json`
      )
    })
}

// ======================================
// WHATSAPP SESSION INFORMATION
// ======================================

function isRegistered(number) {
  try {
    number = cleanPhone(number)

    const file = `./sessions/${number}/creds.json`

    const creds = JSON.parse(
      fs.readFileSync(file, 'utf8')
    )

    return creds.registered === true

  } catch {
    return false
  }
}

// Actual live socket check
function isConnected(number) {
  number = cleanPhone(number)

  const entry = global.activeSessions?.get(number)

  const sock =
    entry?.sock ||
    global.subbots?.get(number) ||
    (entry?.ws ? entry : null)

  if (!sock) return false

  const wsOpen = sock?.ws?.readyState === 1
  const hasUser = !!sock?.user?.id

  return wsOpen && hasUser
}

// ======================================
// SESSION STATUS
// ======================================

function formatAgo(timestamp) {
  if (!timestamp) return 'unknown'

  const diff = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000)
  )

  if (diff < 60) {
    return `${diff}s ago`
  }

  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ${diff % 60}s ago`
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m ago`
  }

  return `${Math.floor(diff / 86400)}d ago`
}

function getRealInfo(number) {
  number = cleanPhone(number)

  const connected = isConnected(number)
  const registered = isRegistered(number)

  const meta =
    global.sessionMeta?.get(number) || {}

  const sess =
    global.activeSessions?.get(number) || null

  let status = 'not linked'
  let reason = 'no session found'

  if (connected) {
    status = 'connected'
    reason = 'linked and online'
  } else if (registered) {
    status = 'needs reconnection'
    reason = meta.reason || 'logged out or disconnected'
  }

  const sinceTimestamp =
    connected
      ? meta.connectedAt
      : meta.disconnectedAt || meta.connectedAt

  const sinceStr = formatAgo(sinceTimestamp)

  let upStr = 'unknown'

  try {
    if (typeof global.runtime === 'function') {
      const r = global.runtime()

      upStr = `${r.d}d ${r.h}h ${r.m}m ${r.s}s`
    }
  } catch {}

  if (upStr === 'unknown') {
    const seconds = Math.floor(process.uptime())

    upStr =
      `${Math.floor(seconds / 3600)}h ` +
      `${Math.floor((seconds % 3600) / 60)}m ` +
      `${seconds % 60}s`
  }

  return {
    connected,
    registered,
    status,
    reason,
    sinceStr,
    upStr,
    meta,
    sess
  }
}

// ======================================
// SESSION LIST MESSAGE
// ======================================

function buildSessionList(tgId) {
  const numbers = getUserNumbers(tgId)

  if (!numbers.length) {
    return {
      numbers: [],
      message: wrap(
        toSmallCaps(
          '❌ you have no sessions yet. use /pair 2567... to connect a number.'
        )
      ),
      keyboard: []
    }
  }

  const lines = numbers.map(number => {
    const info = getRealInfo(number)

    const dot = info.connected ? '🟢' : '🔴'

    return `${dot} +${escapeHtml(number)} — ${toSmallCaps(info.status)}`
  }).join('\n')

  const message = wrap(
    `${toSmallCaps('your sessions')}

${lines}

${toSmallCaps('tap a number to view details')}`
  )

  const keyboard = numbers.map(number => [
    {
      text: `📱 +${number} ${isConnected(number) ? '🟢' : '🔴'}`,
      callback_data: `sess_view_${number}`
    }
  ])

  return {
    numbers,
    message,
    keyboard
  }
}

async function sendSessionList(ctx, isEdit = false) {
  const result = buildSessionList(ctx.from.id)

  const options = {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: result.keyboard
    }
  }

  if (!result.numbers.length) {
    options.reply_markup.inline_keyboard = []
  }

  if (isEdit) {
    try {
      return await ctx.editMessageText(
        result.message,
        options
      )
    } catch {}
  }

  return ctx.reply(
    result.message,
    {
      ...options,
      ...doReply(ctx)
    }
  )
}

// ======================================
// /SESSION COMMAND
// ======================================

export async function sessionCommand(ctx) {
  const tgId = String(ctx.from.id)

  const arg = (
    ctx.message?.text?.split(/\s+/)[1] || ''
  )

  const number = cleanPhone(arg)

  if (number) {
    if (!ownsSession(tgId, number)) {
      return ctx.reply(
        wrap(
          toSmallCaps(
            '❌ this number is not registered under your telegram account.'
          )
        ),
        {
          parse_mode: 'HTML',
          ...doReply(ctx)
        }
      )
    }

    return sendDetail(ctx, number, false)
  }

  return sendSessionList(ctx)
}

// ======================================
// SESSION DETAILS
// ======================================

async function sendDetail(ctx, number, isEdit = false) {
  number = cleanPhone(number)

  if (!number) return

  const info = getRealInfo(number)

  const dot = info.connected ? '🟢' : '🔴'

  let inner = ''

  inner += `┌────────( ${toSmallCaps('session')} )\n`
  inner += `│ ➣ ${toSmallCaps('number')} : +${escapeHtml(number)}\n`
  inner += `│ ➣ ${toSmallCaps('status')} : ${dot} ${toSmallCaps(info.status)}\n`
  inner += `└────────\n\n`

  inner += `┌────────( ${toSmallCaps('stats')} )\n`
  inner += `│ ➣ ${toSmallCaps('reason')} : ${toSmallCaps(escapeHtml(info.reason))}\n`
  inner += `│ ➣ ${toSmallCaps('since')} : ${toSmallCaps(escapeHtml(info.sinceStr))}\n`
  inner += `│ ➣ ${toSmallCaps('server')} : ${toSmallCaps('server 1 of 1')}\n`
  inner += `│ ➣ ${toSmallCaps('server up')} : ${toSmallCaps(escapeHtml(info.upStr))}\n`
  inner += `└────────\n\n`

  let keyboard

  if (info.connected) {
    inner += `🟢 ${toSmallCaps('this number is linked and connected to whatsapp.')}\n\n`
    inner += toSmallCaps('your bot is online and ready to use.')

    keyboard = [
      [
        {
          text: `⬅️ ${toSmallCaps('back')}`,
          callback_data: 'sess_back'
        }
      ]
    ]

  } else {
    inner += `🔴 ${toSmallCaps('this number must be reconnected.')}\n`
    inner += `${toSmallCaps('the session is currently offline.')}\n\n`
    inner += toSmallCaps('tap re-pair to reconnect.')

    keyboard = [
      [
        {
          text: `🔗 ${toSmallCaps('re-pair now')}`,
          callback_data: `sess_repair_${number}`
        },
        {
          text: `🗑️ ${toSmallCaps('remove')}`,
          callback_data: `sess_remove_${number}`
        }
      ],
      [
        {
          text: `🔄 ${toSmallCaps('refresh')}`,
          callback_data: `sess_refresh_${number}`
        },
        {
          text: `⬅️ ${toSmallCaps('back')}`,
          callback_data: 'sess_back'
        }
      ]
    ]
  }

  const message = wrap(inner)

  const options = {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: keyboard
    }
  }

  if (isEdit) {
    try {
      return await ctx.editMessageText(
        message,
        options
      )
    } catch {
      return ctx.reply(message, options)
    }
  }

  return ctx.reply(
    message,
    {
      ...options,
      ...doReply(ctx)
    }
  )
}

// ======================================
// REMOVE CONFIRMATION
// ======================================

async function confirmRemove(ctx, number) {
  number = cleanPhone(number)

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `✅ ${toSmallCaps('yes, remove')}`,
            callback_data: `sess_delconfirm_${number}`
          },
          {
            text: `❌ ${toSmallCaps('cancel')}`,
            callback_data: `sess_refresh_${number}`
          }
        ]
      ]
    }
  }

  return ctx.reply(
    wrap(
      toSmallCaps(
        `⚠️ are you sure you want to remove +${number}? this will delete the session from the server.`
      )
    ),
    {
      parse_mode: 'HTML',
      ...keyboard
    }
  )
}

// ======================================
// DELETE SESSION
// ======================================

async function deleteSession(ctx, number) {
  number = cleanPhone(number)

  if (!ownsSession(ctx.from.id, number)) {
    return ctx.reply(
      wrap(
        toSmallCaps('❌ you do not own this session.')
      ),
      { parse_mode: 'HTML' }
    )
  }

  try {
    if (typeof global.clearSession !== 'function') {
      return ctx.reply(
        wrap(
          toSmallCaps(
            '❌ server session cleanup is unavailable. session was not removed.'
          )
        ),
        { parse_mode: 'HTML' }
      )
    }

    await global.clearSession(number)

    removeTgSession(String(ctx.from.id), number)

    global.subbots?.delete(number)
    global.activeSessions?.delete(number)
    global.sessionMeta?.delete(number)

    try {
      await ctx.deleteMessage()
    } catch {}

    return ctx.reply(
      wrap(
        toSmallCaps(
          `✅ +${number} removed. use /pair to connect again.`
        )
      ),
      { parse_mode: 'HTML' }
    )

  } catch (e) {
    console.log('SESSION REMOVE ERROR:', e.message)

    return ctx.reply(
      wrap(
        toSmallCaps(
          `❌ failed to remove session: ${e.message}`
        )
      ),
      { parse_mode: 'HTML' }
    )
  }
}

// ======================================
// REPAIR SESSION
// ======================================

async function repairSession(ctx, number) {
  number = cleanPhone(number)

  if (!ownsSession(ctx.from.id, number)) {
    return ctx.reply(
      wrap(
        toSmallCaps('❌ you do not own this session.')
      ),
      { parse_mode: 'HTML' }
    )
  }

  await ctx.reply(
    wrap(
      toSmallCaps(`🔄 reconnecting +${number}...`)
    ),
    { parse_mode: 'HTML' }
  )

  try {
    // Try restoring the existing registered session first.
    if (
      isRegistered(number) &&
      typeof global.startSession === 'function'
    ) {
      await global.startSession(
        number,
        String(ctx.from.id),
        false,
        global.subbotHooks || {}
      )

      for (let i = 0; i < 20; i++) {
        await delay(1000)

        if (isConnected(number)) {
          return ctx.reply(
            wrap(
              toSmallCaps(
                `✅ +${number} reconnected! try .alive on whatsapp.`
              )
            ),
            { parse_mode: 'HTML' }
          )
        }
      }

      if (isConnected(number)) {
        return ctx.reply(
          wrap(
            toSmallCaps(
              `✅ +${number} reconnected successfully.`
            )
          ),
          { parse_mode: 'HTML' }
        )
      }
    }

    if (
      typeof global.requestPairFromEngine !== 'function'
    ) {
      return ctx.reply(
        wrap(
          toSmallCaps(
            '❌ engine not ready. restart the bot and try again.'
          )
        ),
        { parse_mode: 'HTML' }
      )
    }

    const code = await global.requestPairFromEngine(
      number,
      {
        onConnected: () => {
          saveTgSession(
            String(ctx.from.id),
            number
          )

          const meta = global.sessionMeta?.get(number) || {}

          global.sessionMeta?.set(number, {
            ...meta,
            connectedAt: Date.now(),
            isConnected: true
          })

          ctx.reply(
            wrap(
              toSmallCaps(
                `✅ +${number} connected! session saved.`
              )
            ),
            { parse_mode: 'HTML' }
          ).catch(() => {})
        }
      }
    )

    if (!code) {
      throw new Error('Pairing code was empty')
    }

    const message = wrap(
      `✅ ${toSmallCaps('pairing code generated')}

📲 ${toSmallCaps('number:')} +${number}

<code>${escapeHtml(code)}</code>

${toSmallCaps('open whatsapp > linked devices > link with phone number, and enter this code.')}

${toSmallCaps('code expires in 5 minutes')}`
    )

    return ctx.reply(
      message,
      { parse_mode: 'HTML' }
    )

  } catch (e) {
    console.log('SESSION REPAIR ERROR:', e.message)

    return ctx.reply(
      wrap(
        toSmallCaps(
          `❌ failed to reconnect: ${e.message}`
        )
      ),
      { parse_mode: 'HTML' }
    )
  }
}

// ======================================
// SESSION BUTTON ACTIONS
// ======================================

export async function sessionActions(ctx) {
  const data = ctx.callbackQuery?.data || ''

  if (!data.startsWith('sess_')) return

  try {
    await ctx.answerCbQuery()
  } catch {}

  // BACK TO SESSION LIST
  if (data === 'sess_back') {
    try {
      await ctx.deleteMessage()
    } catch {}

    return sendSessionList(ctx)
  }

  // VIEW SESSION
  if (data.startsWith('sess_view_')) {
    const number = cleanPhone(
      data.slice('sess_view_'.length)
    )

    if (!ownsSession(ctx.from.id, number)) {
      return ctx.reply(
        wrap(
          toSmallCaps('❌ this session does not belong to you.')
        ),
        { parse_mode: 'HTML' }
      )
    }

    try {
      await ctx.deleteMessage()
    } catch {}

    return sendDetail(ctx, number, false)
  }

  // REFRESH SESSION
  if (data.startsWith('sess_refresh_')) {
    const number = cleanPhone(
      data.slice('sess_refresh_'.length)
    )

    if (!ownsSession(ctx.from.id, number)) {
      return ctx.reply(
        wrap(
          toSmallCaps('❌ this session does not belong to you.')
        ),
        { parse_mode: 'HTML' }
      )
    }

    return sendDetail(ctx, number, true)
  }

  // REMOVE REQUEST
  if (data.startsWith('sess_remove_')) {
    const number = cleanPhone(
      data.slice('sess_remove_'.length)
    )

    if (!ownsSession(ctx.from.id, number)) {
      return ctx.reply(
        wrap(
          toSmallCaps('❌ this session does not belong to you.')
        ),
        { parse_mode: 'HTML' }
      )
    }

    return confirmRemove(ctx, number)
  }

  // REMOVE CONFIRMATION
  if (data.startsWith('sess_delconfirm_')) {
    const number = cleanPhone(
      data.slice('sess_delconfirm_'.length)
    )

    return deleteSession(ctx, number)
  }

  // REPAIR SESSION
  if (data.startsWith('sess_repair_')) {
    const number = cleanPhone(
      data.slice('sess_repair_'.length)
    )

    return repairSession(ctx, number)
  }
}
