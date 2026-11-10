import fs from 'fs'
import path from 'path'

function toSmallCaps(text) {
  const map = {
    a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',
    g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',
    m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',
    s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',
    y:'ʏ',z:'ᴢ'
  }
  return String(text || '').replace(/[a-z]/gi, c => map[c.toLowerCase()] || c)
}

function doReply(ctx) {
  try {
    if (ctx.message) {
      return { reply_parameters: { message_id: ctx.message.message_id } }
    }
  } catch {}
  return {}
}

function fmtDate(d) {
  if (!d) return 'ɴᴇᴠᴇʀ'
  try {
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit'
    })
  } catch {
    return String(d)
  }
}

const SERVERS = [
  { name: 'MAIN', dir: './sessions' }
]

function getSockets() {
  const bots = global.subbots
  if (bots instanceof Map) return [...bots.entries()]
  if (bots && typeof bots === 'object') return Object.entries(bots)
  return []
}

function getAllUsers() {
  const users = []
  let unreachable = 0
  const sockets = getSockets()

  for (const srv of SERVERS) {
    if (!fs.existsSync(srv.dir)) {
      unreachable++
      continue
    }

    let folders = []
    try {
      folders = fs.readdirSync(srv.dir)
    } catch {
      unreachable++
      continue
    }

    for (const folder of folders) {
      const full = path.join(srv.dir, folder)

      try {
        if (!fs.statSync(full).isDirectory()) continue

        const num = folder.replace(/[^0-9]/g, '')
        if (!num) continue

        let meta = {}
        let creds = {}

        const metaPath = path.join(full, 'meta.json')
        const credsPath = path.join(full, 'creds.json')

        if (fs.existsSync(metaPath)) {
          try {
            meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
          } catch {}
        }

        if (fs.existsSync(credsPath)) {
          try {
            creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'))
          } catch {}
        }

        const registered = creds.registered === true

        const connected = registered && sockets.some(([key, sock]) => {
          const ids = [
            String(key).replace(/[^0-9]/g, ''),
            String(sock?.user?.id || '').split(':')[0].replace(/[^0-9]/g, '')
          ]

          return ids.includes(num) && sock?.ws?.readyState === 1
        })

        const status = !registered
          ? 'shared'
          : connected
            ? 'connected'
            : 'disconnected'

        users.push({
          num,
          server: srv.name,
          status,
          name: meta.name || meta.pushName || '',
          pairedAt: meta.pairedAt || null,
          disconnectedAt: meta.disconnectedAt || null
        })
      } catch (err) {
        console.error('USER READ ERROR:', err.message)
      }
    }
  }

  return {
    users: [...new Map(users.map(u => [u.num, u])).values()],
    unreachable
  }
}

function buildUsersText() {
  const { users, unreachable } = getAllUsers()

  const connected = users.filter(u => u.status === 'connected').length
  const disconnected = users.filter(u => u.status === 'disconnected').length
  const shared = users.filter(u => u.status === 'shared').length
  const paired = connected + disconnected

  let text = `👥 ᴜsᴇʀ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ\n`
  text += `━━━━━━━━━━━━━━━━━━\n\n`
  text += `📱 ᴛᴏᴛᴀʟ ᴀᴄᴄᴏᴜɴᴛs: ${users.length}\n\n`
  text += `🟢 ᴏɴʟɪɴᴇ: ${connected}\n`
  text += `🔴 ᴏғғʟɪɴᴇ: ${disconnected}\n`
  text += `🟡 ᴘᴇɴᴅɪɴɢ: ${shared}\n`
  text += `🔐 ᴘᴀɪʀᴇᴅ: ${paired}\n\n`
  text += `━━━━━━━━━━━━━━━━━━\n`
  text += `⚙️ sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  if (unreachable) {
    text += `\n⚠️ sᴇssɪᴏɴ sᴛᴏʀᴀɢᴇ ᴜɴᴀᴠᴀɪʟᴀʙʟᴇ`
  }

  return { text, users }
}

function usersKeyboard(users) {
  const rows = []
  const shown = users.slice(0, 10)

  for (let i = 0; i < shown.length; i += 2) {
    const row = [
      {
        text: `📱 +${shown[i].num}`,
        callback_data: `user_${shown[i].num}`
      }
    ]

    if (shown[i + 1]) {
      row.push({
        text: `📱 +${shown[i + 1].num}`,
        callback_data: `user_${shown[i + 1].num}`
      })
    }

    rows.push(row)
  }

  rows.push([
    { text: '🔄 ʀᴇғʀᴇsʜ', callback_data: 'users_refresh' }
  ])

  rows.push([
    { text: '⬅️ ʙᴀᴄᴋ', callback_data: 'back_users' }
  ])

  return { inline_keyboard: rows }
}

export async function usersCommand(ctx) {
  const { text, users } = buildUsersText()

  return ctx.reply(text, {
    ...doReply(ctx),
    reply_markup: usersKeyboard(users)
  })
}

export async function usersActions(ctx) {
  const data = ctx.callbackQuery?.data || ''

  try {
    await ctx.answerCbQuery()
  } catch {}

  if (data === 'users_refresh' || data === 'back_users') {
    const { text, users } = buildUsersText()

    try {
      return await ctx.editMessageText(text, {
        reply_markup: usersKeyboard(users)
      })
    } catch {
      return ctx.reply(text, {
        reply_markup: usersKeyboard(users)
      })
    }
  }

  if (data.startsWith('user_')) {
    const num = data.slice(5)
    const { users } = getAllUsers()
    const u = users.find(x => x.num === num)

    if (!u) {
      return ctx.reply('❌ ᴜsᴇʀ ɴᴏᴛ ғᴏᴜɴᴅ', doReply(ctx))
    }

    let text = `👤 ᴀᴄᴄᴏᴜɴᴛ ᴘʀᴏғɪʟᴇ\n`
    text += `━━━━━━━━━━━━━━━━━━\n\n`
    text += `📱 ɴᴜᴍʙᴇʀ: +${u.num}\n`
    text += `👤 ɴᴀᴍᴇ: ${toSmallCaps(u.name || 'ɴᴏ ɴᴀᴍᴇ')}\n`
    text += `🌐 sᴇʀᴠᴇʀ: ${u.server}\n`
    text += `📡 sᴛᴀᴛᴜs: ${toSmallCaps(u.status)}\n\n`
    text += `🗓 ᴘᴀɪʀᴇᴅ: ${fmtDate(u.pairedAt)}\n`
    text += `🔌 ᴅɪsᴄᴏɴɴᴇᴄᴛᴇᴅ: ${fmtDate(u.disconnectedAt)}\n\n`
    text += `━━━━━━━━━━━━━━━━━━\n`
    text += `sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

    const buttons = []

    if (u.status === 'disconnected') {
      buttons.push([
        {
          text: '🔄 ʀᴇᴄᴏɴɴᴇᴄᴛ',
          callback_data: `reconnect_${u.num}`
        }
      ])
    }

    buttons.push([
      {
        text: '⬅️ ᴜsᴇʀ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ',
        callback_data: 'back_users'
      }
    ])

    return ctx.reply(text, {
      ...doReply(ctx),
      reply_markup: { inline_keyboard: buttons }
    })
  }

  if (data.startsWith('reconnect_')) {
    const num = data.slice('reconnect_'.length)

    const reconnect = global.reconnectSubBot ||
                      global.startSubBotSession ||
                      global.startSubBot

    if (typeof reconnect !== 'function') {
      return ctx.reply(
        '⚠️ ʀᴇᴄᴏɴɴᴇᴄᴛ ʜᴀɴᴅʟᴇʀ ɴᴏᴛ ᴄᴏɴғɪɢᴜʀᴇᴅ.\n\nsᴇɴᴅ ᴍᴇ ʏᴏᴜʀ ʙᴏᴛ ʀᴇᴄᴏɴɴᴇᴄᴛ ғᴜɴᴄᴛɪᴏɴ.',
        doReply(ctx)
      )
    }

    try {
      await reconnect(num)
      return ctx.reply(
        `🔄 ʀᴇᴄᴏɴɴᴇᴄᴛ ʀᴇǫᴜᴇsᴛ sᴇɴᴛ ғᴏʀ +${num}`,
        doReply(ctx)
      )
    } catch (err) {
      console.error('RECONNECT ERROR:', err)
      return ctx.reply(
        '❌ ʀᴇᴄᴏɴɴᴇᴄᴛ ғᴀɪʟᴇᴅ. ᴄʜᴇᴄᴋ ᴛʜᴇ sᴇʀᴠᴇʀ ʟᴏɢs.',
        doReply(ctx)
      )
    }
  }

  return usersCommand(ctx)
}

export default usersCommand
