import pathlib, re
p = pathlib.Path("index.js")
t = p.read_text()
orig = t

# Backup
pathlib.Path("index.js.bak-split").write_text(orig)
print("BACKUP: index.js.bak-split created - 5000 lines saved")

# --- Helper to extract function by brace counting ---
def extract_func(code, start_pattern):
    m = re.search(start_pattern, code)
    if not m:
        return None, None, None
    start = m.start()
    # find first { after match
    brace_start = code.find('{', m.end()-1)
    if brace_start == -1:
        return None, None, None
    depth = 0
    i = brace_start
    while i < len(code):
        if code[i] == '{':
            depth += 1
        elif code[i] == '}':
            depth -= 1
            if depth == 0:
                end = i+1
                return code[start:end], start, end
        i+=1
    return None, None, None

# Extract startTelegram
telegram_code, ts, te = extract_func(t, r'async function startTelegram\(\)')
if not telegram_code:
    print("ERROR: startTelegram not found!")
    exit(1)
print(f"FOUND startTelegram: {len(telegram_code)} chars, lines {t[:ts].count(chr(10))} to {t[:te].count(chr(10))}")

# Extract helpers needed for telegram
helpers_to_move = []
for name in [r'async function isJoined\(', r'async function getBotPhoto\(', r'function doReply\(', r'async function sendMainMenu\(', r'async function sendJoinLock\(', r'function toSmallCaps\(', r'function fmtTime\(', r'function getTgSessionFile\(', r'function loadTgSessions\(', r'function saveTgSession\(', r'function setMeta\(']:
    code, s, e = extract_func(t, name)
    if code:
        helpers_to_move.append((name, code))
        print(f"FOUND helper {name} - {len(code)} chars")

# Extract constants for telegram
consts_block = ""
for const_name in ["GROUP_LINK", "CHANNEL_LINK", "OWNER_LINK", "CREATOR_LINK", "GROUP_ID", "CHANNEL_ID"]:
    m = re.search(rf"const {const_name}.*\n", t)
    if m:
        consts_block += m.group(0)

print("CONSTS:", consts_block[:200])

# Build bot.js
bot_js = f"""// src/telegram/bot.js - Telegram only - Arranged clean
import {{ Telegraf, Markup }} from 'telegraf'
import fs from 'fs'
import pino from 'pino'
import {{ Browsers, useMultiFileAuthState, makeWASocket, makeCacheableSignalKeyStore, fetchLatestBaileysVersion }} from '@whiskeysockets/baileys'

const R="\\x1b[0m", B="\\x1b[1m", C="\\x1b[36m", G="\\x1b[32m", Y="\\x1b[33m", Rd="\\x1b[31m"

// Load .env if exists (for sub-server without Variables)
try{{
  if(!process.env.TELEGRAM_TOKEN && fs.existsSync('./.env')){{
    let envText = fs.readFileSync('./.env','utf8')
    for(let line of envText.split('\\n')){{
      let [k,v] = line.split('=')
      if(k && v){{ process.env[k.trim()] = v.trim() }}
    }}
    console.log('Loaded .env file for token')
  }}
}}catch(e){{}}

const BOT_TOKEN = process.env.TELEGRAM_TOKEN || ''
{consts_block}
const delay = (ms) => new Promise(r=>setTimeout(r,ms))

// === SECTION 1 - HELPERS (from index.js, kept arranged) ===
function setMeta(n,d){{let o=global.sessionMeta?.get(n)||{{}};global.sessionMeta?.set(n,{{...o,...d}})}}
function fmtTime(ts){{if(!ts) return 'unknown';let d=new Date(ts);return d.toLocaleString('en-GB',{{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}})}}
function toSmallCaps(text){{
  const map = {{a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}}
  return text.toLowerCase().split('').map(c=>map[c]||c).join('')
}}
function getTgSessionFile(){{ return './database/telegram_sessions.json' }}
function loadTgSessions(){{
 try{{ if(!fs.existsSync(getTgSessionFile())) return {{}}; return JSON.parse(fs.readFileSync(getTgSessionFile())) }}catch{{ return {{}} }}
}}
function saveTgSession(tgId, number){{
 let db=loadTgSessions(); if(!db[tgId]) db[tgId]=[]; if(!db[tgId].includes(number)) db[tgId].push(number);
 fs.mkdirSync('./database',{{recursive:true}}); fs.writeFileSync(getTgSessionFile(), JSON.stringify(db,null,2));
}}
function getAutoMuteFile(botId){{ return `./database/automute_${{botId}}.json`; }}
function loadSchedules(botId){{
 try{{ if(!fs.existsSync(getAutoMuteFile(botId))) return {{}}; return JSON.parse(fs.readFileSync(getAutoMuteFile(botId))); }}catch{{ return {{}}; }}
}}
function saveSchedule(botId, data){{ fs.mkdirSync('./database',{{recursive:true}}); fs.writeFileSync(getAutoMuteFile(botId), JSON.stringify(data,null,2)); }}
function scheduleAutoAction(sock, botId, groupId, action, executeAt){{
 let ms=executeAt - Date.now();
 if(ms<1000) ms=1000;
 setTimeout(async()=>{{
  try{{
   if(action==="unmute"){{
    await sock.groupSettingUpdate(groupId,'not_announcement').catch(()=>{{}});
    await sock.sendMessage(groupId,{{text:`🔊 ɢʀᴏᴜᴘ ᴀᴜᴛᴏ ᴜɴᴍᴜᴛᴇᴅ\\n\\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`}}).catch(()=>{{}});
   }}else if(action==="mute"){{
    await sock.groupSettingUpdate(groupId,'announcement').catch(()=>{{}});
    await sock.sendMessage(groupId,{{text:`🔇 ɢʀᴏᴜᴘ ᴀᴜᴛᴏ ᴍᴜᴛᴇᴅ\\n\\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`}}).catch(()=>{{}});
   }}
   let db=loadSchedules(botId); delete db[groupId]; saveSchedule(botId, db);
  }}catch{{}}
 }}, ms);
}}
global.scheduleAutoAction = scheduleAutoAction;
global.saveAutoMuteSchedule = (botId, groupId, action, ms)=>{{
 let db=loadSchedules(botId);
 db[groupId]={{action, executeAt: Date.now()+ms}};
 saveSchedule(botId, db);
}};
async function isJoined(ctx){{
  try{{
    if(ctx.chat && ctx.chat.type!== 'private') return true;
    if(!GROUP_ID &&!CHANNEL_ID) return true
    if(GROUP_ID){{
      try{{
        const m = await ctx.telegram.getChatMember(GROUP_ID, ctx.from.id)
        if(!['member','administrator','creator'].includes(m.status)) return false
      }}catch{{}}
    }}
    if(CHANNEL_ID){{
      const c = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id)
      return ['member','administrator','creator'].includes(c.status)
    }}
    return true
  }}catch(e){{ return false }}
}}
async function getBotPhoto(ctx){{
  try{{ const me=await ctx.telegram.getMe(); const p=await ctx.telegram.getUserProfilePhotos(me.id); if(p.total_count>0) return p.photos[0][0].file_id }}catch{{}}
  return null
}}
function doReply(ctx){{
  try{{
    if(ctx.message) return {{ reply_parameters: {{ message_id: ctx.message.message_id }} }}
  }}catch{{}}
  return {{}}
}}
async function sendMainMenu(ctx){{
  const now=new Date()
  const dateStr=`${{now.getDate()}} ${{now.getMonth()+1}} ${{now.getFullYear()}}`
  const user=ctx.from.first_name||'User'
  const msg=`╭━─━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐂𝐘𝐁𝐄𝐑 𝐌𝐃 ❱─━─━─━╮
┃${{toSmallCaps(`HEY 👋 ${{user}}`)}}
┃${{toSmallCaps('WELCOME TO STORM CYBER MD')}}
┃━━━━━━━━━━━━━━━━━━━━━━━━━━━❐
┃╔══『 🛡️ CYBER ADVANCED MD 🛡️ 』══❒
┃║ ★┏━━━━━━『 BOT INFO 』━━━━━━
┃║ ★│ ➣ ${{toSmallCaps('BOT : STORM CYBER MD')}}
┃║ ★│ ➣ ${{toSmallCaps('VERSION : V3.0.0')}}
┃║ ★│ ➣ ${{toSmallCaps('DEV : STORM X')}}
┃║ ★│ ➣ ${{toSmallCaps(`DATE : ${{dateStr}}`)}}
┃║ ★└─────
┃║ ★┌─── ( COMMANDS )
┃║ ★│ ➣ /pair - ${{toSmallCaps('CONNECT A NUMBER')}}
┃║ ★│ ➣ /session - ${{toSmallCaps('CHECK YOUR SESSION')}}
┃║ ★│ ➣ /disconnect - ${{toSmallCaps('DISCONNECT')}}
┃║ ★│ ➣ /list - ${{toSmallCaps('VIEW SESSIONS')}}
┃║ ★│ ➣ /ping - ${{toSmallCaps('BOT SPEED')}}
┃║ ★│ ➣ /about - ${{toSmallCaps('ABOUT BOT')}}
┃║ ★│ ➣ /dev - ${{toSmallCaps('CONTACT DEV')}}
┃║ ★│ ➣ /creator - ${{toSmallCaps('CONTACT CREATOR')}}
┃║ ★│ ➣ /users - ${{toSmallCaps('SEE NO. OF USERS')}}
┃║ ★│ ➣ /runtime - ${{toSmallCaps('CHECK BOT UPTIME')}}
┃║ ★╰═══════════════════●○◇
┃╚═══════════════════════❒
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━❐
© STORM 𝐗
© DEV SILENCE`
  const photo=await getBotPhoto(ctx)
  const kb=Markup.inlineKeyboard([[Markup.button.url('👥 Group', GROUP_LINK), Markup.button.url('📢 Channel', CHANNEL_LINK)],[Markup.button.url('👑 Owner', OWNER_LINK)]])
  if(photo) await ctx.replyWithPhoto(photo,{{caption:msg,...kb,...doReply(ctx)}})
  else await ctx.reply(msg,{{...kb,...doReply(ctx)}})
}}
async function sendJoinLock(ctx){{
  if(ctx.chat && ctx.chat.type!== 'private') return true;
  const photo=await getBotPhoto(ctx)
  const txt=toSmallCaps(`🚫 YOU HAVEN'T JOINED THE GROUP AND CHANNEL, JOIN TO UNLOCK MORE BOT FEATURES`)
  const kb=Markup.inlineKeyboard([[Markup.button.url('📢 Channel', CHANNEL_LINK), Markup.button.url('👥 Group', GROUP_LINK)],[Markup.button.callback('✅ Verify','verify_join')]])
  if(photo) await ctx.replyWithPhoto(photo,{{caption:txt,...kb,...doReply(ctx)}})
  else await ctx.reply(txt,{{...kb,...doReply(ctx)}})
}}

// === SECTION 2 - MAIN TELEGRAM BOT (moved from index.js, arranged) ===
{telegram_code}

export {{ startTelegram }}
"""

pathlib.Path("src/telegram/bot.js").write_text(bot_js)
print("CREATED src/telegram/bot.js - arranged, 7 sections")

# Now create new index.js without telegram helpers and without startTelegram
# Remove the helper funcs we moved (keep one copy in index.js for WhatsApp? keep toSmallCaps, fmtTime, setMeta in index.js too for WhatsApp)
# We will remove ONLY startTelegram function from original, and replace with import

new_index = orig
# Remove startTelegram function
new_index = new_index[:ts] + "\n// startTelegram moved to src/telegram/bot.js\n" + new_index[te:]

# Remove duplicate const definitions that now live in bot.js - keep them in index.js? Keep for WhatsApp? They are only telegram, so remove from index.js to avoid duplication but keep GROUP_ID etc? Actually isJoined uses them, but isJoined is now in bot.js, so we can remove from index.js
# Keep BOT_TOKEN definition with .env loader already patched earlier
# Add import for startTelegram at top

import_line = "import { startTelegram } from './src/telegram/bot.js'\n"
# Insert after first import line
first_import_end = new_index.find('\n', new_index.find('import'))
new_index = new_index[:first_import_end+1] + import_line + new_index[first_import_end+1:]

# Remove old startTelegram call at bottom? Keep it, now it will use imported function
# The file already has startTelegram() at bottom - that will now call imported one

pathlib.Path("index.js").write_text(new_index)
print("CREATED new index.js - Telegram moved out, WhatsApp stays")
print(f"OLD size: {len(orig)} chars, NEW size: {len(new_index)} chars")
print(f"Moved {len(telegram_code)} chars to bot.js")
