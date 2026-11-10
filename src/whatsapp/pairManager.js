import pino from 'pino'
import fs from 'fs'
import path from 'path'
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from '@whiskeysockets/baileys'

const SESSIONS_ROOT = path.join(process.cwd(), 'sessions')
if (!fs.existsSync(SESSIONS_ROOT)) fs.mkdirSync(SESSIONS_ROOT, { recursive: true })

export const activeSessions = new Map()
const _sessionStarts = new Map()

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

const digits = (s) => String(s || '').replace(/[^0-9]/g, '')
export function cleanPhone(phone) {
  let n = digits(phone)
  if (n.startsWith('0')) n = n.slice(1)
  return n
}

export function hasRegisteredCredentials(phone) {
  try {
    const clean = cleanPhone(phone)
    const file = path.join(SESSIONS_ROOT, clean, 'creds.json')
    return JSON.parse(fs.readFileSync(file, 'utf8')).registered === true
  } catch { return false }
}

export function formatPairingCode(code) {
  const clean = String(code || '').replace(/[^a-z0-9]/gi, '').toUpperCase()
  return clean.match(/.{1,4}/g)?.join('-') || clean
}

export function getPairingCode(sock, phone, mode = 'normal') {
  return new Promise((resolve, reject) => {
    const clean = cleanPhone(phone)
    if (clean.length < 8 || clean.length > 15) {
      return reject(new Error('Invalid number — country code first, no leading 0, no +, no spaces. Example: 256772123456'))
    }
    const TIMEOUT_MS = 25_000
    let settled = false
    sock._pairingInProgress = true
    const settle = (err, code) => {
      if (settled) return
      settled = true
      sock._pairingInProgress = false
      clearTimeout(timer)
      if (err) reject(err)
      else resolve(code)
    }
    const timer = setTimeout(() => {
      settle(new Error('Timed out — code expired. Request a new code.'))
    }, TIMEOUT_MS)
    setTimeout(() => {
      sock.requestPairingCode(clean)
        .then(c => {
          if (!c) return settle(new Error('WhatsApp returned an empty code.'))
          settle(null, formatPairingCode(c))
        })
        .catch(e => settle(e))
    }, 3000)
  })
}

// ONLY /disconnect calls this. Nothing else in this file deletes a folder by itself.
export async function clearSession(phone) {
  phone = cleanPhone(phone)
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

function attachHooks(sock, hooks = {}) {
  if (!sock || !hooks) return
  try {
    if (hooks.onMessage && !sock._stormHandlerAttached) {
      const handler = hooks.onMessage(sock)
      if (typeof handler === 'function') {
        sock._stormHandlerAttached = true
        sock.ev.on('messages.upsert', handler)
      }
    }
    if (hooks.onGroupUpdate && !sock._stormGroupAttached) {
      sock._stormGroupAttached = true
      sock.ev.on('group-participants.update', (anu) => hooks.onGroupUpdate(sock, anu, sock._sessionPhone))
    }
  } catch (e) { console.log('[pairManager] attachHooks err', e.message) }
}

export async function startSession(phone, tgChatId = null, forceNew = false, hooks = {}) {
  phone = cleanPhone(phone)
  const existing = activeSessions.get(phone)
  const alreadyRegistered = hasRegisteredCredentials(phone) || existing?.registered === true

  if (!forceNew && existing?.sock && alreadyRegistered && !existing.sock._pairingInProgress) {
    if (tgChatId) existing.tgChatId = tgChatId
    attachHooks(existing.sock, hooks)
    return existing.sock
  }

  // FIX: DO NOT CLEAR incomplete pairing here. Keep folder until /disconnect.
  // Old code deleted folder on next /pair - that made TOTAL drop by itself.
  // Now we just reuse the existing socket if it is still alive.
  if (!forceNew && existing?.sock && existing.sock._pairingInProgress) {
    return existing.sock
  }
  if (!forceNew && existing && !existing.sock) {
    // Socket died but folder kept - fall through to recreate socket, keep creds
    activeSessions.delete(phone)
    _sessionStarts.delete(phone)
  }

  if (forceNew) {
    console.log(`[${phone}] Force new — clearing old session`)
    await clearSession(phone)
    await new Promise(r => setTimeout(r, 800))
  }

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
  phone = cleanPhone(phone)
  const sessionDir = path.join(SESSIONS_ROOT, phone)
  fs.mkdirSync(sessionDir, { recursive: true })

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
  const version = await getBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    syncFullHistory: false,
    markOnlineOnConnect: false,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 15000,
    defaultQueryTimeoutMs: 60000,
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
    disconnectedSince: null,
    disconnectedAt: null
  })

  sock.ev.on('creds.update', saveCreds)
  attachHooks(sock, hooks)

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
        disconnectedSince: null,
        disconnectedAt: null
      })
      console.log(`✅ STORM SUBBOT ${phone} CONNECTED`)
      attachHooks(sock, hooks)
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

      if (code === 515) {
        console.log(`[${phone}] 515 restart required — keeping creds, reconnecting in 7s`)
        const t = setTimeout(() => {
          if (!activeSessions.has(phone)) return
          startSession(phone, tgChatId, false, hooks).catch(() => {})
        }, 7000)
        session.reconnectTimer = t
        activeSessions.set(phone, { ...session, sock: null, connected: false, reconnectTimer: t })
        return
      }

      const isRealLogout = code === DisconnectReason.loggedOut || code === 401
      if (isRealLogout) {
        if (sock._pairingInProgress) {
          // FIX: Pairing failed - DO NOT open a dead socket, DO NOT delete folder.
          // Clear flag, keep folder, keep entry as disconnected.
          // Next /pair will request a FRESH code -> WhatsApp sends fresh push notification.
          console.log(`[${phone}] Pairing not completed — kept folder, next /pair will request fresh code`)
          sock._pairingInProgress = false
          activeSessions.set(phone, { ...session, sock: null, connected: false, disconnectedSince: Date.now(), disconnectedAt: Date.now(), reconnectTimer: null })
          if (hooks.onPairingInterrupted) hooks.onPairingInterrupted(phone, tgChatId).catch(() => {})
          return
        }
        // FIX: Logged out - KEEP FOLDER. Only /disconnect deletes.
        // Before this fix, it did rmSync here and TOTAL dropped by itself.
        console.log(`[${phone}] Logged out — KEEPING folder, marked disconnected. Only /disconnect deletes.`)
        activeSessions.set(phone, { ...session, sock: null, connected: false, disconnectedSince: Date.now(), disconnectedAt: Date.now(), reconnectTimer: null })
        if (hooks.onLoggedOut) await hooks.onLoggedOut(phone, tgChatId).catch(() => {})
        return
      }

      session.retries = (session.retries || 0) + 1
      if (!session.disconnectedSince) session.disconnectedSince = Date.now()
      activeSessions.set(phone, { ...session, sock: null, connected: false, disconnectedAt: Date.now() })

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
        activeSessions.set(phone, { ...session, sock: null, connected: false, reconnectTimer: t })
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
      activeSessions.set(phone, { ...session, sock: null, connected: false, reconnectTimer: t })
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
