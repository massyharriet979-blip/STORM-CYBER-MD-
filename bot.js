import { Telegraf, Markup } from 'telegraf'
import fs from 'fs'

import {
  sessionCommand,
  sessionActions
} from './session.js'

import {
  listCommand,
  listActions
} from './list.js'

import {
  disconnectCommand,
  disconnectActions,
  disconnectConfirm,
  disconnectCancel
} from './disconnect.js'

// ======================================
// STORM CYBER MD - TELEGRAM CONFIG
// ======================================

const R = '\x1b[0m'
const B = '\x1b[1m'
const C = '\x1b[36m'
const G = '\x1b[32m'
const Y = '\x1b[33m'
const Rd = '\x1b[31m'

try {
  if (!process.env.TELEGRAM_TOKEN && fs.existsSync('./.env')) {
    const envText = fs.readFileSync('./.env', 'utf8')

    for (let line of envText.split('\n')) {
      line = line.trim()

      if (!line || line.startsWith('#')) continue

      const idx = line.indexOf('=')

      if (idx > -1) {
        const key = line.slice(0, idx).trim()
        const value = line.slice(idx + 1)
          .trim()
          .replace(/^["']|["']$/g, '')

        if (key && value) {
          process.env[key] = value
        }
      }
    }
  }
} catch (e) {
  console.log('ENV ERROR:', e.message)
}

const BOT_TOKEN = process.env.TELEGRAM_TOKEN || ''

const GROUP_LINK = 'https://t.me/+8XJN9NgIoPM1MmQ0'
const CHANNEL_LINK = 'https://t.me/storm_cyber_md_channel'
const OWNER_LINK = 'https://t.me/STORMXSYRIX'
const CREATOR_LINK = 'https://t.me/STORMXSYRIX'

const GROUP_ID = '-1004481999858'
const CHANNEL_ID = '-1004422840019'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

// ======================================
// GLOBAL DATABASES
// ======================================

if (!global.subbots) global.subbots = new Map()
if (!global.subbotOwners) global.subbotOwners = []
if (!global.sessionMeta) global.sessionMeta = new Map()
if (!global.activeSessions) global.activeSessions = new Map()

const startTime = Date.now()
const pendingTelegramPairs = new Map()

// ======================================
// BASIC HELPERS
// ======================================

const digits = value =>
  String(value || '').replace(/[^0-9]/g, '')

function cleanPhone(number) {
  let id = digits(number)

  if (id.startsWith('0')) {
    id = id.slice(1)
  }

  return id
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function toSmallCaps(text) {
  const map = {
    a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ',
    e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ',
    i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ',
    m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ',
    q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ',
    u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x',
    y: 'ʏ', z: 'ᴢ'
  }

  return String(text)
    .toLowerCase()
    .split('')
    .map(char => map[char] || char)
    .join('')
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

// ======================================
// RUNTIME
// ======================================

function runtime() {
  let total = Math.floor((Date.now() - startTime) / 1000)

  const d = Math.floor(total / 86400)
  total %= 86400

  const h = Math.floor(total / 3600)
  total %= 3600

  const m = Math.floor(total / 60)
  const s = total % 60

  return { d, h, m, s }
}

global.runtime = runtime

// ======================================
// SESSION HELPERS
// ======================================

function setMeta(number, data) {
  const old = global.sessionMeta.get(number) || {}

  global.sessionMeta.set(number, {
    ...old,
    ...data
  })
}

function isReallyConnected(number) {
  number = String(number)

  const entry = global.activeSessions?.get(number)

  const sock =
    entry?.sock ||
    entry ||
    global.subbots?.get(number)

  if (!sock) return false

  return (
    sock?.ws?.readyState === 1 &&
    !!sock?.user?.id
  )
}

function isRegistered(number) {
  try {
    const clean = cleanPhone(number)

    const file = `./sessions/${clean}/creds.json`

    const creds = JSON.parse(
      fs.readFileSync(file, 'utf8')
    )

    return creds.registered === true
  } catch {
    return false
  }
}

function syncConnectedCount() {
  return global.subbots?.size || 0
}

function getConnected() {
  return syncConnectedCount()
}

// ======================================
// PENDING PAIR MANAGEMENT
// ======================================

function watchPendingPair(number, tgId) {
  finishPendingPair(number)

  const timer = setTimeout(() => {
    pendingTelegramPairs.delete(number)

    console.log(
      `[Telegram] Pair expired for ${number}. SESSION KEPT.`
    )
  }, 5 * 60 * 1000)

  if (timer.unref) timer.unref()

  pendingTelegramPairs.set(number, {
    timer,
    tgId
  })
}

function finishPendingPair(number) {
  const pending = pendingTelegramPairs.get(number)

  if (pending) {
    clearTimeout(pending.timer)
  }

  pendingTelegramPairs.delete(number)
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

    return JSON.parse(
      fs.readFileSync(file, 'utf8')
    )
  } catch {
    return {}
  }
}

function saveTgSession(tgId, number) {
  const db = loadTgSessions()

  if (!db[tgId]) {
    db[tgId] = []
  }

  if (!db[tgId].includes(number)) {
    db[tgId].push(number)
  }

  fs.mkdirSync('./database', {
    recursive: true
  })

  fs.writeFileSync(
    getTgSessionFile(),
    JSON.stringify(db, null, 2)
  )
}

function getTgSessionOwner(number) {
  const db = loadTgSessions()

  for (const [tgId, numbers] of Object.entries(db)) {
    if (Array.isArray(numbers) && numbers.includes(number)) {
      return tgId
    }
  }

  return null
}


// ======================================
// JOIN REQUIREMENT
// ======================================

async function isJoined(ctx) {
  try {
    if (ctx.chat && ctx.chat.type !== 'private') {
      return true
    }

    if (!ctx.from) return false

    let groupOk = true
    let channelOk = true

    if (GROUP_ID) {
      try {
        const member = await ctx.telegram.getChatMember(
          GROUP_ID,
          ctx.from.id
        )

        groupOk = [
          'member',
          'administrator',
          'creator'
        ].includes(member.status)

      } catch (e) {
        console.log('GROUP CHECK ERROR:', e.message)
        groupOk = true
      }
    }

    if (CHANNEL_ID) {
      try {
        const member = await ctx.telegram.getChatMember(
          CHANNEL_ID,
          ctx.from.id
        )

        channelOk = [
          'member',
          'administrator',
          'creator'
        ].includes(member.status)

      } catch (e) {
        console.log('CHANNEL CHECK ERROR:', e.message)
        channelOk = true
      }
    }

    return groupOk && channelOk

  } catch (e) {
    console.log('JOIN CHECK ERROR:', e.message)
    return true
  }
}

// ======================================
// BOT PROFILE PHOTO
// ======================================

async function getBotPhoto(ctx) {
  try {
    const me = await ctx.telegram.getMe()

    const photos = await ctx.telegram.getUserProfilePhotos(
      me.id
    )

    if (photos.total_count > 0) {
      return photos.photos[0][0].file_id
    }
  } catch {}

  return null
}

// ======================================
// MAIN MENU
// ======================================

async function sendMainMenu(ctx) {
  const now = new Date()

  const dateStr =
    `${now.getDate()} ${now.getMonth() + 1} ${now.getFullYear()}`

  const user = ctx.from?.first_name || 'User'

  const msg = `<blockquote>╭━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 ❱─━─━╮
┃${toSmallCaps(`HEY 👋 ${user}`)}
┃${toSmallCaps('WELCOME TO STORM CYBER MD')}
┃━━━━━━━━━━━━━━━━━━━━━━━❐
┃╔═══『 𝐃𝐀𝐑𝐊 𝐍𝐎𝐕𝐀 𝐋𝐀𝐁𝐒 』═══❒
┃║ ★┏━━━━『 ʙᴏᴛ ɪɴғᴏ 』━━━━━
┃║ ★│ ➣ ${toSmallCaps('BOT : STORM CYBER MD')}
┃║ ★│ ➣ ${toSmallCaps('VERSION : V3.0.0')}
┃║ ★│ ➣ ${toSmallCaps('DEV : STORM X')}
┃║ ★│ ➣ ${toSmallCaps(`DATE : ${dateStr}`)}
┃║ ★└─────
┃║ ★┌─── ( ᴄᴏᴍᴍᴀɴᴅs )
┃║ ★│ ➣ /pair - ${toSmallCaps('CONNECT A NUMBER')}
┃║ ★│ ➣ /session - ${toSmallCaps('CHECK YOUR SESSION')}
┃║ ★│ ➣ /disconnect - ${toSmallCaps('DISCONNECT')}
┃║ ★│ ➣ /list - ${toSmallCaps('VIEW SESSIONS')}
┃║ ★│ ➣ /owner - ${toSmallCaps('CONTACT CREATOR')}
┃║ ★│ ➣ /runtime - ${toSmallCaps('CHECK BOT UPTIME')}
┃║ ★╰═══════════════════●○◇
┃╚══════════════════════❒
┗━━━━━━━━━━━━━━━━━━━━━━━━━━❐
© STORM 𝐗</blockquote>`

  const photo = await getBotPhoto(ctx)

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url('👥 Group', GROUP_LINK),
      Markup.button.url('📢 Channel', CHANNEL_LINK)
    ],
    [
      Markup.button.url('👑 Owner', OWNER_LINK)
    ]
  ])

  const replyOptions = {
    parse_mode: 'HTML',
    ...keyboard,
    ...doReply(ctx)
  }

  if (photo && msg.length <= 1024) {
    await ctx.replyWithPhoto(photo, {
      caption: msg,
      ...replyOptions
    })
  } else {
    if (photo) {
      await ctx.replyWithPhoto(photo, doReply(ctx))
    }

    await ctx.reply(msg, replyOptions)
  }
}

// ======================================
// JOIN LOCK MESSAGE
// ======================================

async function sendJoinLock(ctx) {
  const photo = await getBotPhoto(ctx)

  const txt = toSmallCaps(
    '🚫 YOU HAVEN\'T JOINED THE GROUP AND CHANNEL, JOIN TO UNLOCK MORE BOT FEATURES'
  )

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url('📢 Channel', CHANNEL_LINK),
      Markup.button.url('👥 Group', GROUP_LINK)
    ],
    [
      Markup.button.callback('✅ Verify', 'verify_join')
    ]
  ])

  if (photo) {
    await ctx.replyWithPhoto(photo, {
      caption: txt,
      ...keyboard,
      ...doReply(ctx)
    })
  } else {
    await ctx.reply(txt, {
      ...keyboard,
      ...doReply(ctx)
    })
  }
}

// ======================================
// START TELEGRAM BOT
// ======================================

async function startTelegram() {
  if (!BOT_TOKEN) {
    console.log(Y + '⚠️ TELEGRAM_TOKEN not set' + R)
    return
  }

  const bot = new Telegraf(BOT_TOKEN)

  global.telegramBot = bot

  // ====================================
  // MIDDLEWARE
  // ====================================

  bot.use(async (ctx, next) => {
    if (ctx.chat?.type === 'private' && ctx.from) {
      const text = ctx.message?.text || ''

      if (text.startsWith('/start')) return next()

      if (ctx.callbackQuery?.data === 'verify_join') {
        return next()
      }

      if (ctx.callbackQuery?.data === 'start_menu') {
        return next()
      }

      if (!await isJoined(ctx)) {
        return sendJoinLock(ctx)
      }
    }

    return next()
  })

  // ====================================
  // START COMMAND
  // ====================================

  bot.start(async ctx => {
    if (
      ctx.chat?.type === 'private' &&
      !await isJoined(ctx)
    ) {
      return sendJoinLock(ctx)
    }

    await sendMainMenu(ctx)
  })

  // ====================================
  // VERIFY MEMBERSHIP BUTTON
  // ====================================

  bot.action('verify_join', async ctx => {
    const joined = await isJoined(ctx)

    if (!joined) {
      try {
        await ctx.deleteMessage()
      } catch {}

      const photo = await getBotPhoto(ctx)

      const txt = toSmallCaps(
        '🚫 YOU STILL HAVE TO JOIN THE CHANNEL OR GROUP TO UNLOCK THE BOT'
      )

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.url('📢 Channel', CHANNEL_LINK),
          Markup.button.url('👥 Group', GROUP_LINK)
        ],
        [
          Markup.button.callback('✅ Verify', 'verify_join')
        ]
      ])

      if (photo) {
        await ctx.replyWithPhoto(photo, {
          caption: txt,
          ...keyboard,
          ...doReply(ctx)
        })
      } else {
        await ctx.reply(txt, {
          ...keyboard,
          ...doReply(ctx)
        })
      }

      return ctx.answerCbQuery(
        toSmallCaps('still not joined')
      )
    }

    try {
      await ctx.deleteMessage()
    } catch {}

    const photo = await getBotPhoto(ctx)

    const txt = toSmallCaps(
      '✅ ACCESS GRANTED, BOT UNLOCKED. USE ANY COMMAND.'
    )

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('🚀 Start', 'start_menu')
      ]
    ])

    if (photo) {
      await ctx.replyWithPhoto(photo, {
        caption: txt,
        ...keyboard,
        ...doReply(ctx)
      })
    } else {
      await ctx.reply(txt, {
        ...keyboard,
        ...doReply(ctx)
      })
    }

    return ctx.answerCbQuery('Access granted!')
  })

  // ====================================
  // START MENU BUTTON
  // ====================================

  bot.action('start_menu', async ctx => {
    try {
      await ctx.deleteMessage()
    } catch {}

    if (
      ctx.chat?.type === 'private' &&
      !await isJoined(ctx)
    ) {
      return sendJoinLock(ctx)
    }

    await sendMainMenu(ctx)
  })

  // ====================================
  // PAIR COMMAND
  // ====================================

  bot.command('pair', async ctx => {
    if (
      ctx.chat?.type === 'private' &&
      !await isJoined(ctx)
    ) {
      return sendJoinLock(ctx)
    }

    const raw = ctx.message?.text?.split(/\s+/)[1] || ''
    const number = cleanPhone(raw)

    const validExample = '256766233041'

    if (
      !number ||
      number.length < 10 ||
      number.length > 15
    ) {
      return ctx.reply(
        `${toSmallCaps('❌ INVALID NUMBER! USE COUNTRY CODE, NO +, NO SPACES.')}

ℹ️ /pair ${validExample}

${toSmallCaps('EXAMPLES:')}
2567xxxxxxxx
2547xxxxxxxx
23480xxxxxxxx
1212xxxxxxx
9198xxxxxxxx`,
        doReply(ctx)
      )
    }

    if (
      /(\d)\1{7,}/.test(number) ||
      /12345678|00000000|11111111|xxxx/i.test(raw)
    ) {
      return ctx.reply(
        toSmallCaps(
          `❌ FAKE NUMBER DETECTED. EX: /pair ${validExample}`
        ),
        doReply(ctx)
      )
    }

    if (
      number.startsWith('256') &&
      number.length !== 12
    ) {
      return ctx.reply(
        toSmallCaps(
          `❌ UG NUMBER MUST BE 12 DIGITS. EX: /pair ${validExample}`
        ),
        doReply(ctx)
      )
    }

    if (isReallyConnected(number)) {
      return ctx.reply(
        toSmallCaps(
          `✅ ${number} IS ALREADY CONNECTED. NO NEED TO PAIR AGAIN.`
        ),
        doReply(ctx)
      )
    }

    if (isRegistered(number)) {
      const ownerId = getTgSessionOwner(number)

      if (ownerId !== String(ctx.from.id)) {
        return ctx.reply(
          toSmallCaps(
            ownerId
              ? '❌ THIS SESSION BELONGS TO ANOTHER TELEGRAM USER.'
              : '⚠️ THIS SESSION HAS NO SAVED TELEGRAM OWNER. ADMIN VERIFICATION IS REQUIRED.'
          ),
          doReply(ctx)
        )
      }

      return ctx.reply(
        toSmallCaps(
          `${number} HAS A SAVED SESSION BUT IS OFFLINE. SESSION IS KEPT, NOT DELETED. USE /SESSION TO CHECK IT.`
        ),
        doReply(ctx)
      )
    }



    if (pendingTelegramPairs.has(number)) {
      return ctx.reply(
        toSmallCaps(
          `⏳ ${number} IS ALREADY PAIRING. WAIT FOR THE CURRENT REQUEST TO FINISH.`
        ),
        doReply(ctx)
      )
    }

    if (
      typeof global.requestPairFromEngine !== 'function'
    ) {
      return ctx.reply(
        toSmallCaps(
          '❌ ENGINE NOT READY. RESTART BOT IN PANEL AND TRY AGAIN.'
        ),
        doReply(ctx)
      )
    }

    const statusMsg = await ctx.reply(
      toSmallCaps('🔍 REQUESTING SERVER INFORMATION...'),
      doReply(ctx)
    )

    let connected = false

    try {
      await delay(500)

      try {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          statusMsg.message_id,
          undefined,
          toSmallCaps('🖥️ LOOKING FOR A READY SERVER...')
        )
      } catch {}

      await delay(600)

      try {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          statusMsg.message_id,
          undefined,
          toSmallCaps(`🔗 OPENING SOCKET FOR ${number}...`)
        )
      } catch {}

      const formatted = await global.requestPairFromEngine(
        number,
        {
          onConnected: () => {
            connected = true

            finishPendingPair(number)

            saveTgSession(
              String(ctx.from.id),
              number
            )

            setMeta(number, {
              connectedAt: Date.now(),
              pairedAt: Date.now(),
              isConnected: true
            })

            ctx.reply(
              toSmallCaps(
                `✅ ${number} CONNECTED! SESSION SAVED ON SERVER.`
              ),
              doReply(ctx)
            ).catch(() => {})
          }
        }
      )

      if (!formatted) {
        throw new Error('Pairing code was empty')
      }

      // Do not overwrite a successful connection.
      setMeta(number, {
        pairedAt: Date.now(),
        isConnected: connected
      })

      // Only watch pending pairing if not already connected.
      if (!connected) {
        watchPendingPair(
          number,
          String(ctx.from.id)
        )
      }

      const pairMsg = `✅ ${toSmallCaps('PAIRING CODE GENERATED')}

📲 ${toSmallCaps('NUMBER:')} ${number}

<code>${escapeHtml(formatted)}</code>

${toSmallCaps('TAP AND HOLD THE CODE TO COPY')}

${toSmallCaps('OPEN WHATSAPP > LINKED DEVICES > LINK WITH PHONE NUMBER, AND ENTER THIS CODE.')}

${toSmallCaps('⚡ CODE EXPIRES IN 5 MINUTES')}`

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback(
            `📋 ${toSmallCaps('show code')}`,
            `copy_${formatted}`
          )
        ]
      ])

      await ctx.reply(pairMsg, {
        parse_mode: 'HTML',
        ...keyboard,
        ...doReply(ctx)
      })

      try {
        await ctx.telegram.deleteMessage(
          ctx.chat.id,
          statusMsg.message_id
        )
      } catch {}

    } catch (e) {
      finishPendingPair(number)

      console.log('PAIR ERROR:', e.message)

      try {
        await ctx.telegram.deleteMessage(
          ctx.chat.id,
          statusMsg.message_id
        )
      } catch {}

      const error = String(
        e.message || ''
      ).toLowerCase()

      if (error.includes('already pairing')) {
        return ctx.reply(
          toSmallCaps(
            `⏳ ${number} IS ALREADY PAIRING. WAIT FOR THE CURRENT REQUEST TO FINISH.`
          ),
          doReply(ctx)
        )
      }

      if (
        error.includes('already registered') ||
        error.includes('already connected')
      ) {
        return ctx.reply(
          toSmallCaps(
            `✅ ${number} IS ALREADY REGISTERED / CONNECTED. USE /session TO CHECK.`
          ),
          doReply(ctx)
        )
      }

      if (
        error.includes('socket closed') ||
        error.includes('socket timeout') ||
        error.includes('timed out')
      ) {
        return ctx.reply(
          toSmallCaps(
            `❌ SOCKET CLOSED WHILE CONNECTING FOR ${number}. WHATSAPP SERVER WAS BUSY. WAIT 2 MINUTES AND TRY /pair AGAIN.`
          ),
          doReply(ctx)
        )
      }

      return ctx.reply(
        toSmallCaps(
          `❌ FAILED TO GENERATE CODE FOR ${number}. TRY AGAIN AFTER 2 MINUTES. MAKE SURE THE NUMBER IS ON WHATSAPP.`
        ),
        doReply(ctx)
      )
    }
  })

  // ====================================
  // SESSION COMMANDS
  // ====================================

  bot.command('session', sessionCommand)
  bot.command('list', listCommand)
  bot.command('disconnect', disconnectCommand)

  // ====================================
  // SESSION BUTTON HANDLERS
  // ====================================

  bot.action(/^sess_/, sessionActions)
  bot.action(/^list_/, listActions)
  bot.action(/^disc_/, disconnectActions)

  bot.action(
    /del_confirm_(.*)/,
    disconnectConfirm
  )

  bot.action(
    /del_cancel_(.*)/,
    disconnectCancel
  )

  bot.action('back_list', async ctx => {
    try {
      return await listActions(ctx)
    } catch {
      return await sessionActions(ctx)
    }
  })

  bot.action(/^reconnect_/, listActions)

  // ====================================
  // PAIR CODE DISPLAY BUTTON
  // ====================================

  bot.action(/copy_(.*)/, async ctx => {
    const code = ctx.match[1]

    await ctx.answerCbQuery(
      `📋 ${code} - ${toSmallCaps('LONG PRESS THE CODE TO COPY')}`,
      {
        show_alert: true
      }
    )
  })

  // ====================================
  // RUNTIME COMMAND
  // ====================================

  bot.command('runtime', async ctx => {
    if (
      ctx.chat?.type === 'private' &&
      !await isJoined(ctx)
    ) {
      return sendJoinLock(ctx)
    }

    const check = await ctx.reply(
      toSmallCaps('🔍 REQUESTING SERVER INFO...'),
      doReply(ctx)
    )

    await delay(600)

    const { d, h, m, s } = runtime()

    const txt = toSmallCaps(
      `✅ THE BOT HAS BEEN RUNNING FOR ${d}D ${h}H ${m}M ${s}S`
    )

    try {
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        check.message_id,
        undefined,
        txt
      )
    } catch {
      await ctx.reply(txt, doReply(ctx))
    }
  })

  // ====================================
  // OWNER COMMAND
  // ====================================

  const ownerHandler = async ctx => {
    if (
      ctx.chat?.type === 'private' &&
      !await isJoined(ctx)
    ) {
      return sendJoinLock(ctx)
    }

    const txt = `🧑‍💻 𝐁𝐎𝐓 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑

𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐓𝐇𝐄 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑
𝐅𝐎𝐑 𝐀𝐍𝐘 𝐇𝐄𝐋𝐏 𝐎𝐑 𝐈𝐒𝐒𝐔𝐄`

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.url(
          '💬 Developer - STORM X',
          OWNER_LINK
        )
      ]
    ])

    await ctx.reply(txt, {
      ...keyboard,
      ...doReply(ctx)
    })
  }

  // ====================================
  // CREATOR COMMAND
  // ====================================

  const creatorHandler = async ctx => {
    if (
      ctx.chat?.type === 'private' &&
      !await isJoined(ctx)
    ) {
      return sendJoinLock(ctx)
    }

    const txt = `👑 𝐁𝐎𝐓 𝐂𝐑𝐄𝐀𝐓𝐎𝐑

𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐓𝐇𝐄 𝐂𝐑𝐄𝐀𝐓𝐎𝐑
𝐅𝐎𝐑 𝐁𝐔𝐒𝐈𝐍𝐄𝐒𝐒 & 𝐂𝐎𝐋𝐋𝐀𝐁𝐎𝐑𝐀𝐓𝐈𝐎𝐍`

    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.url(
          '💬 Creator - STX',
          CREATOR_LINK
        )
      ]
    ])

    await ctx.reply(txt, {
      ...keyboard,
      ...doReply(ctx)
    })
  }

  bot.command('owner', ownerHandler)
  bot.command('creator', creatorHandler)

  // ====================================
  // TEXT HANDLER
  // ====================================

  bot.on('text', async ctx => {
    if (ctx.message.text.startsWith('/')) return

    if (
      ctx.chat?.type === 'private' &&
      !await isJoined(ctx)
    ) {
      return sendJoinLock(ctx)
    }
  })

  // ====================================
  // BOT STARTUP
  // ====================================

  try {
    await bot.launch()

    console.log(
      G + B + '✅ TELEGRAM PAIR BOT ONLINE' + R
    )

  } catch (e) {
    console.log(
      Rd + 'TELEGRAM START ERROR: ' + e.message + R
    )

    global.telegramBot = null
  }
}

// ======================================
// EXPORT
// ======================================

export { startTelegram }
