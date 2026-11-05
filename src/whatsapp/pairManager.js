// STORM-CYBER-MD — Pair Manager
// One place owns ALL sockets. Telegram + Web both call startSession().
// Adapted from proven pattern: reuse socket, never 2 sockets for same number.

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs'
import path from 'path'

const SESSIONS_ROOT = path.join(process.cwd(), 'sessions')
if (!fs.existsSync(SESSIONS_ROOT)) fs.mkdirSync(SESSIONS_ROOT, { recursive: true })

export const activeSessions = new Map() // phone -> { sock, tgChatId, retries, connected, registered, reconnectTimer }
const _sessionStarts = new Map() // phone -> Promise<sock> - prevents double start

let _baileysVersion = null
async function getBaileysVersion() {
  if (_baileysVersion) return _baileysVersion
  try {
    const { version } = await fetchLatestBaileysVersion()
    _baileysVersion = version
    return version
  } catch {
    _baileysVersion = [2, 3000, 1023223821]
    return _baileysVersion
  }
}

export function hasRegisteredCredentials(phone) {
  try {
    const file = path.join(SESSIONS_ROOT, String(phone || ''), 'creds.json')
    return JSON.parse(fs.readFileSync(file, 'utf8')).registered === true
  } catch { return false }
}

export function formatPairingCode(code) {
  const clean = String(code || '').replace(/[^a-z0-9]/gi, '').toUpperCase()
  return clean.match(/.{1,4}/g)?.join('-') || clean
}

// Same as his: wait 1500ms, then request, 65s timeout
// Flag is ON the socket, not a global Set
export function getPairingCode(sock, phone, mode = 'normal') {
  return new Promise((resolve, reject) => {
    const TIMEOUT_MS = 65_000
    let settled = false
    sock._pairingInProgress = true
    const settle = (err, code) => {
      if (settled) return
      settled = true
      if (err) sock._pairingInProgress = false
      clearTimeout(timer)
      if (err) reject(err)
      else resolve(code)
    }
    const timer = setTimeout(() => {
      settle(new Error('Timed out — WhatsApp did not send a code in 65s.'))
    }, TIMEOUT_MS)
    setTimeout(() => {
      sock.requestPairingCode(phone)
        .then(c => {
          if (!c) return settle(new Error('WhatsApp returned an empty code.'))
          settle(null, formatPairingCode(c))
        })
        .catch(e => settle(e))
    }, 1500)
  })
}

export async function clearSession(phone) {
  const session = activeSessions.get(phone)
  if (session) {
    if (session.reconnectTimer) clearTimeout(session.reconnectTimer)
    if (session.sock?._presenceInterval) clearInterval(session.sock._presenceInterval)
    try { session.sock?.end?.() } catch {}
  }
  activeSessions.delete(phone)
  _sessionStarts.delete(phone)
  const dir = path.join(SESSIONS_ROOT, phone)
  try { fs.rmSync(dir, { recursive: true, force: true }) } catch {}
  return true
}

export async function startSession(phone, tgChatId = null, forceNew = false, hooks = {}) {
  const existing = activeSessions.get(phone)
  const alreadyRegistered = hasRegisteredCredentials(phone) || existing?.registered === true

  // 1. Fully registered -> reuse, don't create 2nd socket
  if (!forceNew && existing?.sock && alreadyRegistered && !existing.sock._pairingInProgress) {
    return existing.sock
  }

  // 2. Incomplete / abandoned pairing -> clear for fresh code
  // This is where unlinked junk gets deleted - on NEXT start, not on close
  if (!forceNew && existing && (!alreadyRegistered || existing.sock?._pairingInProgress)) {
    console.log(`[${phone}] Incomplete pairing — clearing for fresh code`)
    await clearSession(phone)
    await new Promise(r => setTimeout(r, 600))
  }

  // 3. Explicit force new
  if (forceNew) {
    console.log(`[${phone}] Force new — clearing old session`)
    await clearSession(phone)
    await new Promise(r => setTimeout(r, 800))
  }

  // Prevent double start - second call returns same promise
  const inFlight = _sessionStarts.get(phone)
  if (inFlight && !forceNew) return inFlight

  const promise = _createSession(phone, tgChatId, hooks)
  _sessionStarts.set(phone, promise)
  try {
    return await promise
  } finally {
    if (_sessionStarts.get(phone) === promise) _sessionStarts.delete(phone)
  }
}

async function _createSession(phone, tgChatId = null, hooks = {}) {
  const sessionDir = path.join(SESSIONS_ROOT, phone)
  fs.mkdirSync(sessionDir, { recursive: true })

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
  const version = await getBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    // HIS WORKING BROWSER - Safari macOS, not Chrome
    browser: Browsers.macOS('Safari'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    syncFullHistory: false,
    markOnlineOnConnect: false,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 15000,
    defaultQueryTimeoutMs: 0,
    emitOwnEvents: false,
    generateHighQualityLinkPreview: false,
    getMessage: async () => ({ conversation: ' ' })
  })

  sock._sessionPhone = phone
  activeSessions.set(phone, {
    sock,
    tgChatId,
    retries: 0,
    connected: false,
    registered: Boolean(state.creds?.registered),
    reconnectTimer: null,
    disconnectedSince: null
  })

  sock.ev.on('creds.update', saveCreds)

  // Hooks from index.js - so pairManager stays clean, STORM handlers live in index.js
  if (hooks.onMessage) sock.ev.on('messages.upsert', hooks.onMessage(sock))
  if (hooks.onGroupUpdate) sock.ev.on('group-participants.update', (anu) => hooks.onGroupUpdate(sock, anu, phone))

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      const current = activeSessions.get(phone)
      if (!current || current.sock !== sock) return
      sock._pairingInProgress = false
      if (current.reconnectTimer) clearTimeout(current.reconnectTimer)
      activeSessions.set(phone, {
        ...current,
        sock,
        tgChatId,
        connected: true,
        registered: true,
        retries: 0,
        reconnectTimer: null,
        disconnectedSince: null
      })
      console.log(`✅ STORM SUBBOT ${phone} CONNECTED`)
      if (hooks.onOpen) await hooks.onOpen(sock, phone).catch(() => {})
      return
    }

    if (connection === 'close') {
      if (sock._presenceInterval) {
        clearInterval(sock._presenceInterval)
        sock._presenceInterval = null
      }
      const current = activeSessions.get(phone)
      if (!current || current.sock !== sock) return
      const session = current
      const code = lastDisconnect?.error?.output?.statusCode
      console.log(`[${phone}] close code:${code} msg:${lastDisconnect?.error?.message || ''}`)

      // 515 = restart required after pairing — KEEP creds, reconnect in 7s
      // This was your bug: you kept folder but left it dead. He reconnects.
      if (code === 515) {
        console.log(`[${phone}] 515 restart required — keeping creds, reconnecting in 7s`)
        const t = setTimeout(() => {
          if (!activeSessions.has(phone)) return
          startSession(phone, tgChatId, false, hooks).catch(() => {})
        }, 7000)
        session.reconnectTimer = t
        activeSessions.set(phone, { ...session, sock: null, connected: false })
        return
      }

      const isRealLogout = code === DisconnectReason.loggedOut || code === 401

      if (isRealLogout) {
        if (sock._pairingInProgress) {
          // Interrupted DURING pairing — KEEP folder so user can retry
          // Do NOT delete. Next startSession will clear if incomplete.
          console.log(`[${phone}] Pairing interrupted — session kept for retry`)
          activeSessions.set(phone, { ...session, sock: null, connected: false })
          if (hooks.onPairingInterrupted) await hooks.onPairingInterrupted(phone, tgChatId).catch(() => {})
          return
        }
        console.log(`[${phone}] Logged out — cleaning session`)
        activeSessions.delete(phone)
        try { fs.rmSync(sessionDir, { recursive: true, force: true }) } catch {}
        if (hooks.onLoggedOut) await hooks.onLoggedOut(phone, tgChatId).catch(() => {})
        return
      }

      // Everything else -> reconnect, DO NOT delete credentials
      session.retries = (session.retries || 0) + 1
      if (!session.disconnectedSince) session.disconnectedSince = Date.now()
      activeSessions.set(phone, { ...session, sock: null, connected: false })

      if (session.retries > 20) {
        console.log(`[${phone}] Max retries — slowing to 8 min`)
        const t = setTimeout(() => {
          if (!activeSessions.has(phone)) return
          const cur = activeSessions.get(phone)
          if (cur?.reconnectTimer !== t) return
          cur.reconnectTimer = null
          activeSessions.set(phone, cur)
          startSession(phone, tgChatId, false, hooks).catch(() => {})
        }, 8 * 60 * 1000)
        session.reconnectTimer = t
        activeSessions.set(phone, { ...session, sock: null, connected: false })
        return
      }

      const errMsg = lastDisconnect?.error?.message || ''
      const isNetErr = ['ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'ENOTFOUND', 'EFATAL'].some(c => errMsg.includes(c))
      const jitter = Math.random() * 2500
      const delayMs = isNetErr
        ? 4000 + jitter
        : Math.floor(Math.min(5000 * Math.pow(1.55, session.retries - 1), 75_000) + jitter)

      console.log(`[${phone}] Reconnecting in ${Math.round(delayMs / 1000)}s (retry ${session.retries})`)
      if (session.reconnectTimer) clearTimeout(session.reconnectTimer)
      const t = setTimeout(() => {
        if (!activeSessions.has(phone)) return
        const cur = activeSessions.get(phone)
        if (cur?.reconnectTimer !== t) return
        cur.reconnectTimer = null
        activeSessions.set(phone, cur)
        startSession(phone, tgChatId, false, hooks).catch(() => {})
      }, delayMs)
      session.reconnectTimer = t
      activeSessions.set(phone, { ...session, sock: null, connected: false })
    }
  })

  return sock
}

export async function resumeSessions(hooks = {}) {
  if (!fs.existsSync(SESSIONS_ROOT)) return
  const phones = fs.readdirSync(SESSIONS_ROOT)
    .filter(d => fs.existsSync(path.join(SESSIONS_ROOT, d, 'creds.json')))
  if (!phones.length) return
  console.log(`\n📂 Resuming ${phones.length} session(s): ${phones.join(', ')}\n`)
  for (const phone of phones) {
    // Only resume REGISTERED ones. Unregistered = incomplete pairing, skip.
    // Next /pair will clear it via startSession rule 2.
    if (!hasRegisteredCredentials(phone)) {
      console.log(`[${phone}] Skipping unregistered (incomplete pairing)`)
      continue
    }
    try {
      await startSession(phone, null, false, hooks)
    } catch (e) {
      console.error(`[${phone}] Resume error:`, e.message)
    }
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000))
  }
}

export { SESSIONS_ROOT }
