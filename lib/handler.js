import { buildCtx } from './context.js'
import { getCommand } from './loader.js'

import { trackAdmin } from '../src/database/admintracker.js'

import {
  handleAntibot
} from '../whatsapp/antibot.js'

import {
  handleAntilink
} from '../whatsapp/antilink.js'

import {
  handleAntibug
} from '../whatsapp/antibug.js'

import {
  handleAntidelete,
  saveMessageCache
} from '../whatsapp/antidelete.js'

import {
  handleAntigroupmention
} from '../whatsapp/antigroupmention.js'

import {
  handleWarnReminder
} from '../whatsapp/warn.js'


// Prevent a slow moderation handler from blocking commands forever.
const GATE_TIMEOUT_MS = 4000

async function runGate(name, fn) {
  let timer

  try {
    const result = await Promise.race([
      Promise.resolve().then(fn),

      new Promise(resolve => {
        timer = setTimeout(() => {
          console.warn(`[Handler] ${name} timed out; continuing`)
          resolve(false)
        }, GATE_TIMEOUT_MS)
      })
    ])

    return Boolean(result)
  } catch (error) {
    console.error(`[Handler] ${name} failed:`, error.message)
    return false
  } finally {
    if (timer) clearTimeout(timer)
  }
}


// Read function parameter names to distinguish legacy commands.
function getParamNames(fn) {
  try {
    const source = Function.prototype.toString.call(fn)
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')

    const match =
      source.match(/^[^(]*\(([^)]*)\)/) ||
      source.match(/^\s*([A-Za-z_$][\w$]*)\s*=>/)

    if (!match) return []

    return match[1]
      .split(',')
      .map(value => value.trim().replace(/=.*$/, '').trim())
      .filter(Boolean)
  } catch {
    return []
  }
}


function isChatParameter(name) {
  return /^(from|jid|chat|to|remoteJid)$/i.test(name || '')
}


// Run commands using their original argument style.
async function executeCommand(plugin, sock, ctx) {
  const fn = plugin.execute

  if (typeof fn !== 'function') return

  const length = fn.length
  const params = getParamNames(fn)
  const secondParam = params[1] || ''

  const m = ctx.m
  const rawMsg = ctx.msg
  const args = ctx.args

  // Style 1: execute(ctx)
  if (length <= 1) {
    return fn({
      ...ctx,
      sock,
      msg: m,
      m,
      from: ctx.chat,
      chat: ctx.chat,
      args,
      reply: m.reply
    })
  }

  // Style 2: execute(sock, from, msg)
  // Style 3: execute(sock, from, msg, args)
  if (isChatParameter(secondParam)) {
    if (length >= 4) {
      return fn(sock, ctx.chat, rawMsg, args, ctx)
    }

    return fn(sock, ctx.chat, rawMsg, ctx)
  }

  // Style 4: execute(sock, m)
  if (length === 2) {
    return fn(sock, m, ctx)
  }

  // Style 5: execute(sock, m, args)
  // Style 6: execute(sock, m, args, ctx)
  return fn(sock, m, args, ctx)
}


// Handle one incoming WhatsApp message.
export async function handleMessage(
  sock,
  msg,
  isSubBotSession = false,
  msgCache = new Map()
) {
  try {
    if (!msg?.message) return

    if (msg.key?.remoteJid === 'status@broadcast') return

    const ctx = await buildCtx(sock, msg, isSubBotSession)


    const {
      from,
      sender,
      senderNum,
      botIdNum,
      body,
      prefix,
      isGroup,
      isCmd,
      rawCmd,
      args,
      commandMode
    } = ctx

    // Antidelete and message cache.
    const deletedHandled = await handleAntidelete(
      sock,
      msg,
      from,
      botIdNum,
      msgCache
    )

    if (deletedHandled) return

    await saveMessageCache(
      msg,
      from,
      sender,
      msgCache,
      sock
    )


    // Preserve self and inbox modes.
    if (
      commandMode === 'self' ||
      commandMode === 'inbox'
    ) {
      if (senderNum !== botIdNum) return
    }


    // Preserve private mode and sudo permissions.
    if (commandMode === 'private') {
      const allowed =
        senderNum === botIdNum ||
        ctx.isSudo ||
        ctx.isDevOwner

      if (!allowed) return
    }


    // Autotyping.
    try {
      const typing = JSON.parse(
        await import('node:fs').then(({ default: fs }) =>
          fs.existsSync(`./database/autotyping_${botIdNum}.json`)
            ? fs.readFileSync(
                `./database/autotyping_${botIdNum}.json`,
                'utf8'
              )
            : '{}'
        )
      )

      if (
        typing?.enabled &&
        !(global.ghostMode && isSubBotSession)
      ) {
        sock.sendPresenceUpdate('composing', from).catch(() => {})
      }
    } catch {}


    // Admin tracking.
    try {
      trackAdmin({
        chat: from,
        sender,
        isGroup,
        body,
        type: Object.keys(msg.message)[0]
      })
    } catch (error) {
      console.log('[Handler] trackAdmin:', error.message)
    }


    // Existing group protection handlers.
    if (isGroup) {
      await runGate(
        'antibot',
        () => handleAntibot(
          sock,
          from,
          sender,
          body,
          botIdNum
        )
      )

      await runGate(
        'antigroupmention',
        () => handleAntigroupmention(
          sock,
          from,
          sender,
          body,
          botIdNum,
          msg,
          isGroup
        )
      )

      const linkHandled = await runGate(
        'antilink',
        () => handleAntilink(
          sock,
          from,
          sender,
          body,
          botIdNum,
          msg
        )
      )

      if (linkHandled) return

      const bugHandled = await runGate(
        'antibug',
        () => handleAntibug(
          sock,
          from,
          sender,
          body,
          botIdNum,
          msg,
          prefix
        )
      )

      if (bugHandled) return

      await runGate(
        'warn',
        () => handleWarnReminder(
          sock,
          from,
          sender,
          body,
          botIdNum,
          msg,
          prefix,
          isGroup
        )
      )
    }


    // Ignore normal messages that are not commands.
    if (!body || !isCmd || !rawCmd) return

    const plugin = getCommand(rawCmd)

    if (!plugin) {
      console.log(
        `[CMD] Unknown: ${prefix}${rawCmd} from ${senderNum}`
      )
      return
    }


    // Permission checks.
    const hasSudo =
      ctx.isOwner ||
      ctx.isSubBotOwner ||
      ctx.isSudo ||
      ctx.isDevOwner

    if (plugin.devOnly && !ctx.isDevOwner) {
      return ctx.reply('⛔ This command is reserved for the developer.')
    }

    if (plugin.ownerOnly && !hasSudo) {
      return ctx.reply('⛔ This command is reserved for the bot owner.')
    }

    if (plugin.groupOnly && !isGroup) {
      return ctx.reply('❌ This command can only be used in groups.')
    }

    if (plugin.privateOnly && isGroup) {
      return ctx.reply('❌ This command can only be used in private chat.')
    }

    if (plugin.adminOnly && !ctx.isSenderAdmin && !hasSudo) {
      return ctx.reply('❌ Group admins only.')
    }

    if (plugin.botAdminNeeded && !ctx.isBotAdmin) {
      return ctx.reply('❌ Make me a group admin first.')
    }


    console.log(
      `[CMD] ${prefix}${rawCmd} from ${senderNum} on ${
        isSubBotSession ? 'SUBBOT' : 'MAIN'
      } ${botIdNum}`
    )

    try {
      await executeCommand(plugin, sock, ctx)

      console.log(`[CMD] DONE ${rawCmd}`)
    } catch (error) {
      console.error(
        `[CMD] EXEC FAIL ${rawCmd}:`,
        error.message
      )

      try {
        await ctx.reply(
          `❌ Command error: ${error.message.slice(0, 100)}`
        )
      } catch {}
    }

  } catch (error) {
    if (error?.transient) return

    const message = error?.message || String(error)

    console.error('[Handler] Error:', message)

    try {
      if (msg?.key?.remoteJid) {
        await sock.sendMessage(
          msg.key.remoteJid,
          { text: '❌ Internal error. Try again.' },
          { quoted: msg }
        )
      }
    } catch {}
  }
}


// Create a message listener for main bots and subbots.
export function createMessageHandler(
  sock,
  isSubBotSession = false
) {
  const msgCache = new Map()

  return async ({ messages }) => {
    for (const msg of messages || []) {
      handleMessage(
        sock,
        msg,
        isSubBotSession,
        msgCache
      ).catch(error => {
        console.error(
          '[Handler] Message processing error:',
          error.message
        )
      })
    }
  }
}

export default handleMessage
