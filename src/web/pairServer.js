import pino from 'pino'
import fs from 'fs'
import path from 'path'
// STORM-CYBER-MD — Pair Manager
// One place owns ALL sockets. Telegram + Web both call startSession().
// RULE: NEVER auto-delete, NEVER auto-reconnect.
// Only /disconnect / clearSession deletes. User decides.
// Logged out = kept, marked offline. /session will still find it.

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from '@whiskeysockets/baileys'

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

// --- SQUICHY NUMBER CLEANING ---
const digits = (s) => String(s || '').replace(/[^0-9]/g, '')

export function cleanPhone(phone) {
  let n = digits(phone)
  if (n.startsWith('0')) n = n.slice(1) // no leading 0
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

// --- SQUICHY PAIR PATTERN ---
// Wait 3000ms, request ONCE with clean number, timeout 25s, clear flag always
export function getPairingCode(sock, phone, mode = 'normal') {
  return new Promise((resolve, reject) => {
    const clean = cleanPhone(phone)
    if (clean.length < 8 || clean.length > 15) {
      return reject(new Error('Invalid number — country code first, no leading 0, no +, no spaces. Example: 256772123456'))
    }
    const TIMEOUT_MS = 25_000 // code dies at ~20s, don't wait 65s
    let settled = false
    sock._pairingInProgress = true
    const settle = (err, code) => {
      if (settled) return
      settled = true
      sock._pairingInProgress = false // clear on success AND error
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
    }, 3000) // 3000ms like Squichy - let socket connect first
  })
}

// ONLY place that deletes. Called ONLY from /disconnect (Telegram + Web).
// NEVER called automatically on close / logout / timeout / expiry.
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

  // 1. Fully registered -> reuse, don't create 2nd socket
  if (!forceNew && existing?.sock && alreadyRegistered && !existing.sock._pairingInProgress) {
    if (tgChatId) existing.tgChatId = tgChatId
    attachHooks(existing.sock, hooks)
    return existing.sock
  }

  // 2. Incomplete pairing (NEVER registered) -> clear for fresh code
  // This is NOT a real session yet, so clearing it is safe.
  // Registered / loggedOut sessions are NOT cleared here - they are kept.
  if (!forceNew && existing && !alreadyRegistered) {
    console.log(`[${phone}] Incomplete pairing (never registered) — clearing for fresh code`)
    await clearSession(phone)
    await new Promise(r => setTimeout(r, 600))
  }

  // 3. Explicit force new - only from /disconnect flow, not automatic
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
    disconnectedSince: null
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
        disconnectedSince: null
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
      const code = lastDisconnect?.error?.output?.statusCode
      console.log(`[${phone}] close code:${code} msg:${lastDisconnect?.error?.message || ''} — KEEPING SESSION, NO AUTO-RECONNECT, NO DELETE`)

      // DELETED: 515 auto-reconnect
      // DELETED: loggedOut / 401 auto-delete
      // DELETED: retries / backoff / auto startSession
      // DELETED: max retries / 8 min timer
      // ALL REMOVED. Server just marks offline and stops.
      // Only user /disconnect deletes. Only user /pair starts again.

      sock._pairingInProgress = false
      activeSessions.set(phone, {
        ...current,
        sock: null,
        connected: false,
        registered: current.registered, // keep registered flag, so /session still finds it
        retries: 0,
        reconnectTimer: null,
        disconnectedSince: Date.now()
      })
      if (hooks.onPairingInterrupted) await hooks.onPairingInterrupted(phone, tgChatId).catch(() => {})
      if (hooks.onLoggedOut && (code === DisconnectReason.loggedOut || code === 401)) {
        await hooks.onLoggedOut(phone, tgChatId).catch(() => {})
      }
      return
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
