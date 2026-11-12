import fs from 'fs'
import config from '../config.js'

const _lidCache = new Map()
const _configCache = new Map()

function readJsonCached(file, ttlMs = 10000) {
  const now = Date.now()
  const cached = _configCache.get(file)

  if (cached && now - cached.time < ttlMs) return cached.value

  try {
    if (!fs.existsSync(file)) {
      _configCache.set(file, { time: now, value: null })
      return null
    }

    const value = JSON.parse(fs.readFileSync(file, 'utf8'))
    _configCache.set(file, { time: now, value })
    return value
  } catch {
    return null
  }
}

function digits(value) {
  return String(value || '').replace(/[^0-9]/g, '')
}

function normNum(value) {
  return digits(String(value || '').split('@')[0].split(':')[0])
}

export function cacheLidMappings(participants = []) {
  for (const p of participants) {
    const phone = normNum(p.id)
    const lid = normNum(p.lid)

    if (phone && lid && phone !== lid) {
      _lidCache.set(lid, phone)
      _lidCache.set(phone, phone)
    }
  }
}

export function resolveLid(number) {
  return _lidCache.get(digits(number)) || digits(number)
}

export async function buildCtx(sock, msg, isSubBotSession = false) {
  if (!msg?.key?.remoteJid || !msg.message) {
    const error = new Error('Invalid WhatsApp message')
    error.transient = true
    throw error
  }

  const from = msg.key.remoteJid

  if (from === 'status@broadcast') {
    const error = new Error('Status message ignored')
    error.transient = true
    throw error
  }

  const isGroup = from.endsWith('@g.us')
  const isPrivate = !isGroup
  const fromMe = Boolean(msg.key.fromMe)

  const botNumber = normNum(sock.user?.id)
  const botJid = botNumber ? `${botNumber}@s.whatsapp.net` : ''

  let sender = isGroup
    ? (msg.key.participant || msg.participant || from)
    : (fromMe ? botJid : from)

  if (fromMe && botJid) sender = botJid

  if (isGroup && !msg.key.participant) {
    msg.key.participant = sender
  }

  const senderNum = normNum(sender)
  const botIdNum = botNumber
  const body =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption ||
    msg.message.documentMessage?.caption ||
    ''

  // Dynamic prefix for each connected bot.
  let prefix = config.PREFIX || '.'

  const prefixData = readJsonCached(`./database/prefix_${botIdNum}.json`)
  if (prefixData?.prefix) prefix = prefixData.prefix

  // Preserve the old command mode settings.
  let commandMode = 'public'

  const modeData = readJsonCached(`./database/mode_${botIdNum}.json`)

  if (modeData) {
    if (typeof modeData === 'string') commandMode = modeData
    else if (modeData.mode) commandMode = modeData.mode
  } else if (!isSubBotSession) {
    const oldMode = readJsonCached('./src/database/mode.json')

    if (typeof oldMode === 'string') commandMode = oldMode
    else if (oldMode?.mode) commandMode = oldMode.mode
  }

  // Preserve all existing sudo sources.
  let sudoList = []

  const addSudo = data => {
    if (Array.isArray(data)) sudoList.push(...data)
    else if (Array.isArray(data?.sudo)) sudoList.push(...data.sudo)
  }

  addSudo(readJsonCached(`./database/sudo_${botIdNum}.json`))
  addSudo(readJsonCached('./database/sudo.json'))
  addSudo(readJsonCached('./src/database/sudo.json'))

  const sudoNumbers = new Set(sudoList.map(normNum).filter(Boolean))
  const isSudo = sudoNumbers.has(senderNum) ||
    resolveLid(senderNum) !== senderNum &&
    sudoNumbers.has(resolveLid(senderNum))

  // Preserve the old bot ownership behavior.
  const isOwner = Boolean(botIdNum && senderNum === botIdNum)
  const isSubBotOwner = Boolean(isSubBotSession && isOwner)

  const ownerNumber = digits(config.OWNER_NUMBER)
  const isDevOwner = Boolean(
    fromMe ||
    (ownerNumber && senderNum === ownerNumber) ||
    (ownerNumber && resolveLid(senderNum) === ownerNumber)
  )

  // Group metadata and admin checks.
  let groupMeta = null
  let isSenderAdmin = false
  let isBotAdmin = false

  if (isGroup) {
    try {
      if (!sock._groupMetaCache) sock._groupMetaCache = new Map()
      if (!sock._groupMetaCacheTs) sock._groupMetaCacheTs = new Map()

      const cached = sock._groupMetaCache.get(from)
      const cachedAt = sock._groupMetaCacheTs.get(from) || 0

      if (cached && Date.now() - cachedAt < 5 * 60 * 1000) {
        groupMeta = cached
      } else {
        try {
          groupMeta = await sock.groupMetadata(from)
          sock._groupMetaCache.set(from, groupMeta)
          sock._groupMetaCacheTs.set(from, Date.now())
        } catch {
          groupMeta = cached || null
        }
      }

      const participants = groupMeta?.participants || []
      cacheLidMappings(participants)

      const isAdmin = p =>
        p.admin === 'admin' || p.admin === 'superadmin'

      isBotAdmin = participants.some(p =>
        isAdmin(p) &&
        (
          normNum(p.id) === botNumber ||
          normNum(p.lid) === botNumber
        )
      )

      isSenderAdmin = participants.some(p =>
        isAdmin(p) &&
        (
          normNum(p.id) === senderNum ||
          normNum(p.lid) === senderNum ||
          resolveLid(normNum(p.id)) === resolveLid(senderNum) ||
          p.id === sender
        )
      )
    } catch {}
  }

  const isCmd = Boolean(prefix && body.startsWith(prefix))
  const commandText = isCmd ? body.slice(prefix.length).trim() : ''
  const parts = commandText ? commandText.split(/\s+/) : []
  const rawCmd = (parts.shift() || '').toLowerCase()
  const args = parts
  const text = args.join(' ')

  const contextInfo =
    msg.message.extendedTextMessage?.contextInfo ||
    msg.message.imageMessage?.contextInfo ||
    msg.message.videoMessage?.contextInfo ||
    msg.message.documentMessage?.contextInfo ||
    {}

  const quotedMessage = contextInfo.quotedMessage || null
  const mentionedJid = contextInfo.mentionedJid || []

  const quoted = quotedMessage
    ? {
        message: quotedMessage,
        key: {
          id: contextInfo.stanzaId,
          remoteJid: from,
          participant: contextInfo.participant
        },
        sender: contextInfo.participant || from,
        participant: contextInfo.participant,
        pushName: '',
        mtype: Object.keys(quotedMessage)[0],
        msg: quotedMessage[Object.keys(quotedMessage)[0]]
      }
    : null

  const reply = (content, options = {}) => {
    const message = typeof content === 'string'
      ? { text: content }
      : content

    return sock.sendMessage(from, message, {
      quoted: msg,
      ...options
    })
  }

  const send = content => {
    const message = typeof content === 'string'
      ? { text: content }
      : content

    return sock.sendMessage(from, message)
  }

  const react = emoji =>
    sock.sendMessage(from, {
      react: { text: emoji, key: msg.key }
    })

  const m = {
    key: msg.key,
    chat: from,
    sender,
    senderNum,
    isGroup,
    isPrivate,
    isOwner,
    isSubBot: Boolean(isSubBotSession),
    isSubBotOwner,
    botNumber: botIdNum,
    pushName: msg.pushName || senderNum || 'User',
    mentionedJid,
    mtype: Object.keys(msg.message)[0],
    quoted,
    body,
    text: body,
    messageTimestamp: msg.messageTimestamp,
    reply,
    send,
    react
  }

  return {
    sock,
    msg,
    m,
    from,
    chat: from,
    sender,
    senderNum,
    botIdNum,
    botNumber: botIdNum,
    body,
    prefix,
    isCmd,
    rawCmd,
    args,
    text,
    isGroup,
    isPrivate,
    fromMe,
    isOwner,
    isSubBot: Boolean(isSubBotSession),
    isSubBotOwner,
    isSudo,
    isDevOwner,
    isSenderAdmin,
    isBotAdmin,
    groupMeta,
    pushName: m.pushName,
    commandMode,
    quoted,
    mentionedJid,
    reply,
    send,
    react,
    settings: config,
    FOOTER: config.FOOTER || ''
  }
}

export default buildCtx
