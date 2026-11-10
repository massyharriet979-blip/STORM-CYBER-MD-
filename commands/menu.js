import fs from 'fs'
import path from 'path'

// Cache image in RAM once, don't download every time
let cachedImg = null
let cachedImgTime = 0

function getLocalImage(){
  const tries = [
    './assets/menuthumb.jpg',
    './assets/menu.jpg',
    './assets/menuthumb.png',
    './assets/menu.png'
  ]
  for(const p of tries){
    try{
      if(fs.existsSync(p)){
        const stat = fs.statSync(p)
        // If local file is too big, ignore it - don't freeze
        if(stat.size > 0 && stat.size < 800 * 1024){
          return fs.readFileSync(p)
        } else {
          console.log(`[MENU] local image too big: ${p} ${(stat.size/1024/1024).toFixed(2)}MB, skipping`)
        }
      }
    }catch(e){}
  }
  return null
}

async function getMenuImage(){
  // 1. Use cache if we already loaded it in last 1 hour
  if(cachedImg && (Date.now() - cachedImgTime) < 3600000) return cachedImg

  // 2. Try local file first - fastest, no download
  const local = getLocalImage()
  if(local){
    cachedImg = local
    cachedImgTime = Date.now()
    console.log(`[MENU] using local image ${(local.length/1024).toFixed(0)}KB`)
    return local
  }

  // 3. Fallback: Catbox, but with 5s timeout + size cap
  try{
    const controller = new AbortController()
    const timeout = setTimeout(()=>controller.abort(), 5000)
    const res = await fetch("https://files.catbox.moe/pznw3z.jpg", { signal: controller.signal })
    clearTimeout(timeout)
    if(!res.ok) throw new Error('img fetch ' + res.status)
    const buf = Buffer.from(await res.arrayBuffer())
    if(!buf.length) throw new Error('empty img')
    // If Catbox image is >800KB, DON'T send as image - will freeze
    if(buf.length > 800 * 1024){
      console.log(`[MENU] catbox image too big ${(buf.length/1024/1024).toFixed(2)}MB, using text fallback`)
      return null
    }
    cachedImg = buf
    cachedImgTime = Date.now()
    return buf
  }catch(e){
    console.log('[MENU] image fetch failed:', e.message)
    return null
  }
}

export default {
name:"menu",
alias:["ᴍᴇɴᴜ","help","list"],
execute: async(sock, m)=>{
 try{
  let prefix = global.prefix || "."
  let jid = "120363414065055650@newsletter"

  let pushuser = m.pushName || "User"
  let mode = global.botMode || global.mode || "PUBLIC"
  let ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)

  let d = new Date()
  let dateStr = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
  let dayName = d.toLocaleDateString('en-US',{weekday:'long'})

  let uptimeSec = process.uptime()
  let days = Math.floor(uptimeSec / 86400)
  let hrs = Math.floor((uptimeSec % 86400) / 3600)
  let mins = Math.floor((uptimeSec % 3600) / 60)
  let secs = Math.floor(uptimeSec % 60)

  let menu = `> ╭══〘 *sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ* 〙 ══⊷❍
> ┃✯╭──────────────
> ┃✯│➣ *ᴏᴡɴᴇʀ:* sᴛᴏʀᴍ x
> ┃✯│➣ *ᴜsᴇʀ:* ${pushuser}
> ┃✯│➣ *ᴍᴏᴅᴇ:* ${mode}
> ┃✯│➣ *ʀᴀᴍ:* ${ram} ᴍʙ ᴏғ 267 ɢʙ
> ┃✯│➣ *ᴄᴏᴍᴍᴀɴᴅs:* 370+
> ┃✯│➣ *ᴠᴇʀsɪᴏɴ:* ᴠ3.0.0 *sᴛᴀʙʟᴇ*
> ┃✯│➣ *ᴅᴀᴛᴇ:* ${dateStr}
> ┃✯│➣ *ᴜᴘᴛɪᴍᴇ:* ${days}d ${hrs}h ${mins}m ${secs}s
> ┃✯│➣ *ᴘʀᴇғɪx:* ${prefix}
> ┃✯│➣ *ᴅᴀʏ:* ${dayName}
> ┃✯╰───────────────
> ╰═══════════════════⊷❍

> ╭════〘 *𝙶𝙴𝙽𝙴𝚁𝙰𝙻* 〙════⊷❍
> ┃✯│→ *\`ᴀʟʟ ᴜsᴇʀ\`*
> ┃✯│➣ 1.${prefix} *sᴇᴛᴠᴀʀ*
> ┃✯│➣ 2.${prefix} *ɢᴇᴛᴠᴀʀ*
> ┃✯│➣ 3.${prefix} *ᴅᴇʟᴠᴀʀ*
> ┃✯│➣ 4.${prefix} *sᴄʀᴇᴇɴsʜᴏᴛ*
> ┃✯│➣ 5.${prefix} *ᴅᴇʟsᴜᴅᴏ*
> ┃✯│➣ 6.${prefix} *ᴘɪɴɢ2*
> ┃✯│➣ 7.${prefix} *ᴘɪɴɢ3*
> ┃✯│➣ 8.${prefix} *ᴘɪɴɢ4*
> ┃✯│➣ 9.${prefix} *ᴀɪ*
> ┃✯│➣ 10.${prefix} *ɪɴғᴏ*
> ┃✯│➣ 11.${prefix} *ʟɪsᴛ*
> ┃✯│➣ 12.${prefix} *ᴀʟɪᴠᴇ*
> ┃✯│➣ 13.${prefix} *ᴛʀᴀɴsʟᴀᴛᴇ2*
> ┃✯│➣ 14.${prefix} *ɢᴀᴍᴇs*
> ┃✯│➣ 15.${prefix} *ɢɪғ*
> ┃✯│➣ 16.${prefix} *ʀᴏᴛᴀᴛᴇ*
> ┃✯│➣ 17.${prefix} *ғʟɪᴘ*
> ┃✯│➣ 18.${prefix} *ᴍᴇɴᴛɪᴏɴ*
> ┃✯│➣ 19.${prefix} *ʀᴇʟᴏᴀᴅ*
> ┃✯│➣ 20.${prefix} *ʀᴇʙᴏᴏᴛ*
> ┃✯│➣ 21.${prefix} *ᴅᴇʟᴇᴛᴇ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝙾𝚆𝙽𝙴𝚁* 〙════⊷❍
> ┃✯│→ *\`ʙᴏᴛ sɢ && ᴏᴡɴᴇʀ ʟᴏᴄᴋ\`*
> ┃✯│➣ 22.${prefix} *ᴀʟʟᴠᴀʀ*
> ┃✯│➣ 23.${prefix} *sᴇᴛᴛɪɴɢs*
> ┃✯│➣ 24.${prefix} *sᴇᴛsᴜᴅᴏ*
> ┃✯│➣ 25.${prefix} *ᴀᴅᴅsᴜᴅᴏ*
> ┃✯│➣ 26.${prefix} *ᴀᴜᴛᴏᴛʏᴘɪɴɢ*
> ┃✯│➣ 27.${prefix} *ɪɴsᴛᴀʟʟ*
> ┃✯│➣ 28.${prefix} *ᴘʟᴜɢɪɴ*
> ┃✯│➣ 29.${prefix} *ᴀᴜᴛᴏʀᴇᴘʟʏ*
> ┃✯│➣ 30.${prefix} *ᴜᴘᴅᴀᴛᴇ*
> ┃✯│➣ 31.${prefix} *ʙʟᴏᴄᴋ*
> ┃✯│➣ 32.${prefix} *ᴊᴏɪɴ*
> ┃✯│➣ 33.${prefix} *ᴜɴʙʟᴏᴄᴋ*
> ┃✯│➣ 34.${prefix} *ᴘᴘ*
> ┃✯│➣ 35.${prefix} *ᴅᴇᴠɪᴄᴇ*
> ┃✯│➣ 36.${prefix} *sᴇᴛᴘʀᴇғɪx*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂* 〙════⊷❍
> ┃✯│→ *\`ʙᴏᴛ sɢ && ᴡᴀ ᴘʟᴛғʀᴍ\`*
> ┃✯│➣ 37.${prefix} *ᴘʟᴀᴛғᴏʀᴍ*
> ┃✯│➣ 38.${prefix} *ʟᴀɴɢᴜᴀɢᴇ*
> ┃✯│➣ 39.${prefix} *ᴍᴏᴅᴇ*
> ┃✯│➣ 40.${prefix} *ᴀɴᴛɪᴅᴇʟᴇᴛᴇ*
> ┃✯│➣ 41.${prefix} *sᴇᴛɪɴғᴏ*
> ┃✯│➣ 42.${prefix} *sᴇᴛɴᴀᴍᴇ*
> ┃✯│➣ 43.${prefix} *sᴇᴛᴏᴡɴᴇʀ*
> ┃✯│➣ 44.${prefix} *sᴇᴛɪᴍᴀɢᴇ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝙶𝚁𝙾𝚄𝙿* 〙════⊷❍
> ┃✯│→ *\`ɢᴄ ᴄᴏɴᴛʀᴏʟ ᴄᴇɴᴛᴇʀ\`*
> ┃✯│➣ 45.${prefix} *ᴋɪᴄᴋᴀᴅᴍɪɴ*
> ┃✯│➣ 46.${prefix} *ᴀɴᴛɪʙᴏᴛ*
> ┃✯│➣ 47.${prefix} *ᴀɴᴛɪsᴘᴀᴍ*
> ┃✯│➣ 48.${prefix} *ʟɪsᴛɪɴᴀᴄᴛɪᴠᴇ*
> ┃✯│➣ 49.${prefix} *ᴀɴᴛɪᴅᴇᴍᴏᴛᴇ*
> ┃✯│➣ 50.${prefix} *ᴀɴᴛɪᴘʀᴏᴍᴏᴛᴇ*
> ┃✯│➣ 51.${prefix} *ᴀɴᴛɪʟɪɴᴋ*
> ┃✯│➣ 52.${prefix} *ᴀɴᴛɪᴡᴏʀᴅ*
> ┃✯│➣ 53.${prefix} *ᴀᴜᴛᴏᴍᴜᴛᴇ*
> ┃✯│➣ 54.${prefix} *ᴀᴜᴛᴏᴜɴᴍᴜᴛᴇ*
> ┃✯│➣ 55.${prefix} *ᴛᴏɢsᴛᴀᴛᴜs*
> ┃✯│➣ 56.${prefix} *ʀᴇsᴇᴛʟɪɴᴋ*
> ┃✯│➣ 57.${prefix} *ᴋɪᴄᴋ*
> ┃✯│➣ 58.${prefix} *ᴀᴅᴅ*
> ┃✯│➣ 59.${prefix} *ᴘʀᴏᴍᴏᴛᴇ*
> ┃✯│➣ 60.${prefix} *ʀᴇǫᴜᴇsᴛs*
> ┃✯│➣ 61.${prefix} *ʟᴇᴀᴠᴇ*
> ┃✯│➣ 62.${prefix} *ᴄʀᴇᴀᴛᴇɢʀᴏᴜᴘ*
> ┃✯│➣ 63.${prefix} *ᴅᴇᴍᴏᴛᴇ*
> ┃✯│➣ 64.${prefix} *ᴍᴜᴛᴇ*
> ┃✯│➣ 65.${prefix} *ᴜɴᴍᴜᴛᴇ*
> ┃✯│➣ 66.${prefix} *ᴊɪᴅ*
> ┃✯│➣ 67.${prefix} *ɪɴᴠɪᴛᴇ*
> ┃✯│➣ 68.${prefix} *ʀᴇᴠᴏᴋᴇ*
> ┃✯│➣ 69.${prefix} *ᴜɴᴍᴜᴛᴇ2*
> ┃✯│➣ 70.${prefix} *ᴍᴜᴛᴇ2*
> ┃✯│➣ 71.${prefix} *ʀᴇᴊᴇᴄᴛᴀʟʟ*
> ┃✯│➣ 72.${prefix} *ᴀᴄᴄᴇᴘᴛᴀʟʟ*
> ┃✯│➣ 73.${prefix} *ᴄᴏᴍᴍᴏɴ*
> ┃✯│➣ 74.${prefix} *ᴛᴀɢ*
> ┃✯│➣ 75.${prefix} *ɢsᴛᴀᴛᴜs*
> ┃✯│➣ 76.${prefix} *ᴍsɢs*
> ┃✯│➣ 77.${prefix} *ɪɴᴀᴄᴛɪᴠᴇ*
> ┃✯│➣ 78.${prefix} *ᴡᴀʀɴ*
> ┃✯│➣ 79.${prefix} *ᴡᴀʀɴɪɴɢs*
> ┃✯│➣ 80.${prefix} *ᴀᴜᴛᴏᴀᴘᴘʀᴏᴠᴇ*
> ┃✯│➣ 81.${prefix} *ʀᴇsᴇᴛᴡᴀʀɴ*
> ┃✯│➣ 82.${prefix} *ᴡᴀʀɴʟɪsᴛ*
> ┃✯│➣ 83.${prefix} *sᴇᴛᴡᴀʀɴʟɪᴍɪᴛ*
> ┃✯│➣ 84.${prefix} *ᴡᴀʀɴsᴛᴀᴛᴜs*
> ┃✯│➣ 85.${prefix} *ᴡᴇʟᴄᴏᴍᴇ*
> ┃✯│➣ 86.${prefix} *ɢᴏᴏᴅʙʏᴇ*
> ┃✯│➣ 87.${prefix} *sᴇᴛᴡᴇʟᴄᴏᴍᴇ*
> ┃✯│➣ 88.${prefix} *sᴇᴛɢᴏᴏᴅʙʏᴇ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝚄𝚃𝙸𝙻𝙸𝚃𝚈* 〙════⊷❍
> ┃✯│→ *\`ʙᴏᴛ ᴄᴏᴜɴᴛs\`*
> ┃✯│➣ 89.${prefix} *ᴜᴘᴛɪᴍᴇ*
> ┃✯│➣ 90.${prefix} *ᴍᴇɴᴜ*
> ┃✯│➣ 91.${prefix} *ᴛᴇsᴛᴀʟɪᴠᴇ*
> ┃✯│➣ 92.${prefix} *ᴄᴀʟᴄᴜʟᴀᴛᴇ*
> ┃✯│➣ 93.${prefix} *ᴛᴛs*
> ┃✯│➣ 94.${prefix} *sᴇᴛʟᴀɴɢᴜᴀɢᴇ*
> ┃✯│➣ 95.${prefix} *ᴡᴇᴀᴛʜᴇʀ*
> ┃✯│➣ 96.${prefix} *ʀᴇsᴇᴛᴘʀᴏᴄᴇss*
> ┃✯│➣ 97.${prefix} *ᴄᴀɴᴄᴇʟᴘʀᴏᴄᴇss*
> ┃✯│➣ 98.${prefix} *sᴘᴀᴍ2*
> ┃✯│➣ 99.${prefix} *ᴄʏʙᴇʀɴᴇᴡs*
> ┃✯│➣ 100.${prefix} *sᴘᴀᴍ*
> ┃✯│➣ 101.${prefix} *ᴄʜᴀɴɴᴇʟ*
> ┃✯│➣ 102.${prefix} *ɢʀᴏᴜᴘ*
> ┃✯│➣ 103.${prefix} *ᴜɴsᴛɪᴄᴋ*
> ┃✯│➣ 104.${prefix} *ɢᴇᴛsᴛɪᴄᴋ*
> ┃✯│➣ 105.${prefix} *ᴅɪғғ*
> ┃✯│➣ 106.${prefix} *ɢᴇᴛᴊɪᴅs*
> ┃✯│➣ 107.${prefix} *ᴜsᴇʀs*
> ┃✯│➣ 108.${prefix} *sᴄʜᴇᴅᴜʟᴇ*
> ┃✯│➣ 109.${prefix} *sᴄʜᴇᴅᴜʟᴇᴅ*
> ┃✯│➣ 110.${prefix} *ᴄᴀɴᴄᴇʟ*
> ┃✯│➣ 111.${prefix} *ᴀɢᴇ*
> ┃✯│➣ 112.${prefix} *ᴄɴᴛᴅ*
> ┃✯│➣ 113.${prefix} *ᴘɪɴɢ*
> ┃✯│➣ 114.${prefix} *ᴠᴠ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝚂𝙴𝙰𝚁𝙲𝙷* 〙════⊷❍
> ┃✯│→ *\`ᴡᴇʙ sᴇᴀʀᴄʜ\`*
> ┃✯│➣ 115.${prefix} *ɪᴍɢ*
> ┃✯│➣ 116.${prefix} *ғɪɴᴅ*
> ┃✯│➣ 117.${prefix} *ɪɢ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍
> ╭════〘 *𝙴𝙳𝙸𝚃* 〙════⊷❍
> ┃✯│→ *\`ᴡᴀ ᴇᴅɪᴛᴏʀ\`*
> ┃✯│➣ 118.${prefix} *sᴛɪᴄᴋᴇʀ*
> ┃✯│➣ 119.${prefix} *ᴍᴘ3*
> ┃✯│➣ 120.${prefix} *sʟᴏᴡ*
> ┃✯│➣ 121.${prefix} *sᴘᴇᴇᴅ*
> ┃✯│➣ 122.${prefix} *ʙᴀss*
> ┃✯│➣ 123.${prefix} *ᴘʜᴏᴛᴏ*
> ┃✯│➣ 124.${prefix} *ᴅᴏᴄ*
> ┃✯│➣ 125.${prefix} *sǫᴜᴀʀᴇ*
> ┃✯│➣ 126.${prefix} *ʀᴇsɪᴢᴇ*
> ┃✯│➣ 127.${prefix} *ᴄᴏᴍᴘʀᴇss*
> ┃✯│➣ 128.${prefix} *ᴛʀɪᴍ*
> ┃✯│➣ 129.${prefix} *ʙʟᴀᴄᴋ*
> ┃✯│➣ 130.${prefix} *ᴀᴠᴍɪx*
> ┃✯│➣ 131.${prefix} *ᴠᴍɪx*
> ┃✯│➣ 132.${prefix} *sʟᴏᴡᴍᴏ*
> ┃✯│➣ 133.${prefix} *ᴄɪʀᴄʟᴇ*
> ┃✯│➣ 134.${prefix} *ɪɴᴛᴇʀᴘ*
> ┃✯│➣ 135.${prefix} *ᴛᴀᴋᴇ*
> ┃✯│➣ 136.${prefix} *ᴍᴘ4*
> ┃✯│➣ 137.${prefix} *ᴜʀʟ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝙼𝙸𝚂𝙲* 〙════⊷❍
> ┃✯│→ *\`ʙᴏᴛ ᴍɪsᴄ\`*
> ┃✯│➣ 138.${prefix} *ᴄʟᴇᴀʀ*
> ┃✯│➣ 139.${prefix} *ʀᴇᴛʀʏ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝙲𝙾𝙽𝚅𝙴𝚁𝚃𝙴𝚁𝚂* 〙═══⊷❍
> ┃✯│→ *\`ᴘᴅғ ᴄᴠɴᴛᴇʀs\`*
> ┃✯│➣ 140.${prefix} *ᴘᴅғ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝚂𝚈𝚂𝚃𝙴𝙼* 〙════⊷❍
> ┃✯│→ *\`ʙᴏᴛ sʏsᴛᴇᴍ\`*
> ┃✯│➣ 141.${prefix} *ʀᴇsᴛᴀʀᴛ*
> ┃✯│➣ 142.${prefix} *sʜᴜᴛᴅᴏᴡɴ*
> ┃✯│➣ 143.${prefix} *ᴏɴʟɪɴᴇᴏғғ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳* 〙════⊷❍
> ┃✯│→ *\`ᴀʟʟ ᴍᴇᴅɪᴀ ᴅᴏᴡɴʟᴏᴀᴅ\`*
> ┃✯│➣ 144.${prefix} *ᴘʟᴀʏ2*
> ┃✯│➣ 145.${prefix} *sᴏɴɢ2*
> ┃✯│➣ 146.${prefix} *sᴛᴏʀʏ*
> ┃✯│➣ 147.${prefix} *ᴘɪɴᴛᴇʀᴇsᴛ*
> ┃✯│➣ 148.${prefix} *ᴛɪᴋᴛᴏᴋ*
> ┃✯│➣ 149.${prefix} *sᴏɴɢ*
> ┃✯│➣ 150.${prefix} *ʏᴛs*
> ┃✯│➣ 151.${prefix} *ʏᴛᴠ*
> ┃✯│➣ 152.${prefix} *ᴠɪᴅᴇᴏ*
> ┃✯│➣ 153.${prefix} *ᴀᴘᴋ*
> ┃✯│➣ 154.${prefix} *ᴘʟᴀʏ*
> ┃✯│➣ 155.${prefix} *sᴘᴏᴛɪғʏ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝙵𝚄𝙽* 〙════⊷❍
> ┃✯│→ *\`ғᴜɴ ᴄᴍᴅᴢ\`*
> ┃✯│➣ 156.${prefix} *ɢᴀᴍᴇʀs*
> ┃✯│➣ 157.${prefix} *ᴛɪᴄᴛᴀᴄᴛᴏᴇ*
> ┃✯│➣ 158.${prefix} *sʟᴏᴛ*
> ┃✯│➣ 159.${prefix} *ᴍᴀᴛʜ*
> ┃✯│➣ 160.${prefix} *sʜɪᴘ*
> ┃✯│➣ 161.${prefix} *ʟᴏᴠᴇ*
> ┃✯│➣ 162.${prefix} *ᴋɪss*
> ┃✯│➣ 163.${prefix} *ʜᴜɢ*
> ┃✯│➣ 164.${prefix} *ᴘᴀᴛ*
> ┃✯│➣ 165.${prefix} *sʟᴀᴘ*
> ┃✯│➣ 166.${prefix} *ᴄᴜᴅᴅʟᴇ*
> ┃✯│➣ 167.${prefix} *ᴍᴇᴍᴇ*
> ┃✯│➣ 168.${prefix} *sᴘᴏʀᴛs*
> ┃✯│➣ 169.${prefix} *ғᴏᴏᴛʏᴀʟʟ*
> ┃✯│➣ 170.${prefix} *ᴄʀɪᴄᴋᴇᴛ*
> ┃✯│➣ 171.${prefix} *ɴʙᴀ*
> ┃✯│➣ 172.${prefix} *ᴅᴀʀᴇ*
> ┃✯│➣ 173.${prefix} *ᴛʀᴜᴛʜ*
> ┃✯│➣ 174.${prefix} *ʀɪᴅᴅʟᴇ*
> ┃✯│➣ 175.${prefix} *ᴡᴏʀᴅɢᴀᴍᴇ*
> ┃✯│➣ 176.${prefix} *ɢᴜᴇss*
> ┃✯│➣ 177.${prefix} *ǫᴜɪᴢ*
> ┃✯│➣ 178.${prefix} *ᴄʜᴇss*
> ┃✯│➣ 179.${prefix} *ʟᴜᴅᴏ*
> ┃✯│➣ 180.${prefix} *ʜᴀɴɢᴍᴀɴ*
> ┃✯│➣ 181.${prefix} *ᴅɪᴄᴇ*
> ┃✯│➣ 182.${prefix} *ғʟɪᴘᴄᴏɪɴ*
> ┃✯│➣ 183.${prefix} *ᴄᴏɪɴғʟɪᴘ*
> ┃✯│➣ 184.${prefix} *8ʙᴀʟʟ*
> ┃✯│➣ 185.${prefix} *ʀᴏᴀsᴛ*
> ┃✯│➣ 186.${prefix} *ᴄᴏᴍᴘʟɪᴍᴇɴᴛ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝙶𝙷𝙾𝚂𝚃* 〙════⊷❍
> ┃✯│→ *\`ɢʜᴏsᴛ ᴄᴍᴅ\`*
> ┃✯│➣ 187.${prefix} *ʙᴜɢ-ᴍᴇɴᴜ*
> ┃✯│➣ 188.${prefix} *ʟᴏᴄᴋ2*
> ┃✯│➣ 189.${prefix} *ʙᴀɴ*
> ┃✯│➣ 190.${prefix} *ᴜɴʙᴀɴ*
> ┃✯│➣ 191.${prefix} *ʀᴇᴘᴏ*
> ┃✯│➣ 192.${prefix} *ʟɪsᴛsᴜᴅᴏ*
> ┃✯│➣ 193.${prefix} *ᴛᴀɢᴀᴅᴍɪɴ*
> ┃✯│➣ 194.${prefix} *sᴜᴘᴘᴏʀᴛ*
> ┃✯│➣ 195.${prefix} *ᴏᴡɴᴇʀ*
> ┃✯│➣ 196.${prefix} *ʙᴏᴛ*
> ┃✯│➣ 197.${prefix} *sᴘᴇᴇᴅ*
> ┃✯│➣ 198.${prefix} *ᴀɴɪᴍᴇ*
> ┃✯│➣ 199.${prefix} *ᴋɪᴄᴋᴀʟʟ*
> ┃✯│➣ 200.${prefix} *ᴘʀɪᴠᴀᴛᴇ*
> ┃✯│➣ 201.${prefix} *sᴇʟғ*
> ┃✯│➣ 202.${prefix} *ᴘᴜʙʟɪᴄ*
> ┃✯│➣ 203.${prefix} *ʜɪᴅᴇ*
> ┃✯│➣ 204.${prefix} *ᴠᴠ2*
> ┃✯│➣ 205.${prefix} *ʟɪɴᴋ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍
> ╭════〘 *𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿* 〙════⊷❍
> ┃✯│→ *\`ᴡᴀ ᴄᴍᴅᴢ\`*
> ┃✯│➣ 206.${prefix} *ʀᴇᴀᴄᴛ*
> ┃✯│➣ 207.${prefix} *ᴇᴅɪᴛ*
> ┃✯│➣ 208.${prefix} *sᴇɴᴅ*
> ┃✯│➣ 209.${prefix} *ғᴏʀᴡᴀʀᴅ*
> ┃✯│➣ 210.${prefix} *ᴊᴏɪɴᴄʜᴀɴɴᴇʟ*
> ┃✯│➣ 211.${prefix} *ʟᴇᴀᴠᴇᴄʜᴀɴɴᴇʟ*
> ┃✯│➣ 212.${prefix} *ᴄʜᴀɴɴᴇʟɪɴғᴏ*
> ┃✯│➣ 213.${prefix} *ɴᴇᴡsʟᴇᴛᴛᴇʀ*
> ┃✯│➣ 214.${prefix} *ᴡᴀᴄʜᴀɴɴᴇʟ*
> ┃✯│➣ 215.${prefix} *ᴅᴇʟᴇᴛᴇᴄʜᴀɴɴᴇʟ*
> ┃✯│➣ 216.${prefix} *ғᴏʟᴏᴡ*
> ┃✯│➣ 217.${prefix} *ᴜɴғᴏʟʟᴏᴡ*
> ┃✯│➣ 218.${prefix} *ɢᴄ-ɪᴄᴏɴ*
> ┃✯│➣ 219.${prefix} *ᴄʜᴀɴɴᴇʟ-ɪᴄᴏɴ*
> ┃✯│➣ 220.${prefix} *ᴠᴏᴛᴇ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝙲𝚈𝙱𝙴𝚁 𝙲𝙾𝚁𝙴* 〙═══⊷❍
> ┃✯│→ *\`ᴄᴏʀᴇ ᴍᴏᴅᴇʟs\`*
> ┃✯│➣ 221.${prefix} *ᴅᴅᴏs*
> ┃✯│➣ 222.${prefix} *ᴘᴏʀᴛsᴄᴀɴ*
> ┃✯│➣ 223.${prefix} *ɪᴘʟᴏᴏᴋᴜᴘ*
> ┃✯│➣ 224.${prefix} *ᴡʜᴏɪs*
> ┃✯│➣ 225.${prefix} *ᴘʜɪsʜᴄʜᴇᴄᴋ*
> ┃✯│➣ 226.${prefix} *ʜᴀsʜ*
> ┃✯│➣ 227.${prefix} *ᴇɴᴄʀʏᴘᴛ*
> ┃✯│➣ 228.${prefix} *ᴅᴇᴄʀʏᴘᴛ*
> ┃✯│➣ 229.${prefix} *ʙᴀsᴇ64*
> ┃✯│➣ 230.${prefix} *ʙɪɴᴀʀʏ*
> ┃✯│➣ 231.${prefix} *ǫʀ*
> ┃✯│➣ 232.${prefix} *ǫʀsᴄᴀɴ*
> ┃✯│➣ 233.${prefix} *sʜᴏʀᴛᴇɴ*
> ┃✯│➣ 234.${prefix} *ᴜɴsʜᴏʀᴛ*
> ┃✯│➣ 235.${prefix} *ᴡᴇʙsᴄᴀɴ*
> ┃✯│➣ 236.${prefix} *ᴠᴜʟɴsᴄᴀɴ*
> ┃✯│➣ 237.${prefix} *ᴇxᴘʟᴏɪᴛ*
> ┃✯│➣ 238.${prefix} *ᴘᴀʏʟᴏᴀᴅ*
> ┃✯│➣ 239.${prefix} *ᴛʀᴀᴄᴋ*
> ┃✯│➣ 240.${prefix} *ʟᴏᴄᴀᴛᴇ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *𝙰𝙸 𝙿𝚁𝙾* 〙════⊷❍
> ┃✯│→ *\`ᴀɪ ᴘʀᴏ ᴍᴏᴅᴇʟs\`*
> ┃✯│➣ 241.${prefix} *ɢᴘᴛ*
> ┃✯│➣ 242.${prefix} *ɢᴇᴍɪɴɪ*
> ┃✯│➣ 243.${prefix} *sᴛᴏʀᴍᴀɪ*
> ┃✯│➣ 244.${prefix} *ɪᴍᴀɢɪɴᴇ*
> ┃✯│➣ 245.${prefix} *ᴍɪᴅᴊᴏᴜʀɴᴇʏ*
> ┃✯│➣ 246.${prefix} *ᴅᴀʟʟᴇ*
> ┃✯│➣ 247.${prefix} *sᴛᴀʙʟᴇᴅɪғғ*
> ┃✯│➣ 248.${prefix} *ʀᴇᴍᴏᴠᴇʙɢ*
> ┃✯│➣ 249.${prefix} *ᴜᴘsᴄᴀʟᴇ*
> ┃✯│➣ 250.${prefix} *ᴄᴏʟᴏʀɪᴢᴇ*
> ┃✯│➣ 251.${prefix} *ᴛᴏᴄᴀʀᴛᴏᴏɴ*
> ┃✯│➣ 252.${prefix} *ᴠᴏɪᴄᴇ*
> ┃✯│➣ 253.${prefix} *ᴛʀᴀɴsʟᴀᴛᴇ*
> ┃✯│➣ 254.${prefix} *sᴜᴍᴍᴀʀʏ*
> ┃✯│➣ 255.${prefix} *ᴡʀɪᴛᴇ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 〙════⊷❍
> ┃✯│→ *\`ᴘʀᴇᴍɪᴜᴍ ᴀᴄᴄᴇss\`*
> ┃✯│➣ 256.${prefix} *ᴘʀᴇᴍɪᴜᴍ*
> ┃✯│➣ 257.${prefix} *ʙᴜʏᴘʀᴇᴍ*
> ┃✯│➣ 258.${prefix} *ᴠɪᴘ*
> ┃✯│➣ 259.${prefix} *sᴜᴘᴇʀʙᴀɴ*
> ┃✯│➣ 260.${prefix} *ᴀɴᴛɪᴄᴀʟʟ*
> ┃✯│➣ 261.${prefix} *ᴀᴜᴛᴏsᴛᴀᴛᴜs*
> ┃✯│➣ 262.${prefix} *ᴀᴜᴛᴏʟɪᴋᴇ*
> ┃✯│➣ 263.${prefix} *ᴀᴜᴛᴏʀᴇᴀᴄᴛ*
> ┃✯│➣ 264.${prefix} *sᴛᴀᴛᴜssᴀᴠᴇʀ*
> ┃✯│➣ 265.${prefix} *ᴄᴀʟʟʙʟᴏᴄᴋ*
> ┃✯│➣ 266.${prefix} *ᴘᴍʏʟᴏᴄᴋ*
> ┃✯│➣ 267.${prefix} *ɢʜᴏsᴛᴍᴏᴅᴇ*
> ┃✯│➣ 268.${prefix} *ɪɴᴠɪsɪʙʟᴇ*
> ┃✯│➣ 269.${prefix} *ᴛᴇᴍᴘᴍᴀɪʟ*
> ┃✯│➣ 270.${prefix} *ғᴀᴋᴇɴᴜᴍʙᴇʀ*
> ┃✯│➣ 271.${prefix} *sᴘᴀᴍʏᴜɢ*
> ┃✯│➣ 272.${prefix} *ᴄʀᴀsʜ*
> ┃✯│➣ 273.${prefix} *ʟᴀɢ*
> ┃✯│➣ 274.${prefix} *ᴋɪʟʟ*
> ┃✯│➣ 275.${prefix} *ʜᴀᴄᴋ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 𝙴𝚇𝚃𝚁𝙰 〙════⊷❍
> ┃✯│→ *\`ᴇxᴛʀᴀ ᴍᴏᴅᴇʟᴢ\`*
> ┃✯│➣ 276.${prefix} *ᴡᴀʟʟᴘᴀᴘᴇʀ*
> ┃✯│➣ 277.${prefix} *ʀɪɴɢᴛᴏɴᴇ*
> ┃✯│➣ 278.${prefix} *ʟʏʀɪᴄs*
> ┃✯│➣ 279.${prefix} *ᴋᴀʀᴀᴏᴋᴇ*
> ┃✯│➣ 280.${prefix} *sʜᴀᴢᴀᴍ*
> ┃✯│➣ 281.${prefix} *ɢᴏɢʟᴇ*
> ┃✯│➣ 282.${prefix} *ʏᴏᴜᴛᴜʙᴇ*
> ┃✯│➣ 283.${prefix} *ᴡɪᴋɪ*
> ┃✯│➣ 284.${prefix} *ᴄʜᴀᴛɢᴘᴛ*
> ┃✯│➣ 285.${prefix} *ʙɪɴɢ*
> ┃✯│➣ 286.${prefix} *ᴄᴏᴘɪʟᴏᴛ*
> ┃✯│➣ 287.${prefix} *ғʟᴏᴡᴇʀ*
> ┃✯│➣ 288.${prefix} *ʜᴏʀᴏsᴄᴏᴘᴇ*
> ┃✯│➣ 289.${prefix} *ᴊᴏᴋᴇ*
> ┃✯│➣ 290.${prefix} *ғᴀᴄᴛ*
> ┃✯│➣ 291.${prefix} *ǫᴜᴏᴛᴇ*
> ┃✯│➣ 292.${prefix} *ᴄᴏᴜᴘʟᴇ*
> ┃✯│➣ 293.${prefix} *ᴘᴘᴄᴏᴜᴘʟᴇ*
> ┃✯│➣ 294.${prefix} *ʟᴏɢᴏ*
> ┃✯│➣ 295.${prefix} *ᴛᴇxᴛᴍᴀᴋᴇʀ*
> ┃✯│➣ 296.${prefix} *ᴇᴘʜᴏᴛᴏ*
> ┃✯│➣ 297.${prefix} *sᴛʏʟᴇᴛᴇxᴛ*
> ┃✯│➣ 298.${prefix} *ғᴀɴᴄʏ*
> ┃✯│➣ 299.${prefix} *ᴠᴄᴀʀᴅ*
> ┃✯│➣ 300.${prefix} *ᴘᴀɪʀ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *ᴀɴɪᴍᴇ* 〙════⊷❍
> ┃✯│→ *\`ᴀɴɪᴍᴇ ᴀᴄᴄᴇss\`*
> ┃✯│➣ 301.${prefix} *ɢᴇᴛʙᴏᴛ*
> ┃✯│➣ 302.${prefix} *ᴅᴇsᴛʀᴏʏ*
> ┃✯│➣ 303.${prefix} *ɢᴄ-ᴅᴇsᴄ*
> ┃✯│➣ 304.${prefix} *ᴅɪsᴋ*
> ┃✯│➣ 305.${prefix} *ᴛʀᴀɴsʟᴀᴛᴇ*
> ┃✯│➣ 306.${prefix} *ᴀʟʟᴏᴡ*
> ┃✯│➣ 307.${prefix} *ᴅᴇʟᴀʟʟᴏᴡ*
> ┃✯│➣ 308.${prefix} *ᴛᴀᴋᴇ-ɢᴄ*
> ┃✯│➣ 309.${prefix} sᴇᴛᴛᴘᴘɢʀᴏᴜᴘ*
> ┃✯│➣ 310.${prefix} *ʙᴏᴛsᴛᴀᴛᴜs*
> ┃✯│➣ 311.${prefix} *sʜᴇɪʟᴅ*
> ┃✯│➣ 312.${prefix} *sᴇᴛᴀᴜᴅɪᴏᴍᴇɴᴜ*
> ┃✯│➣ 313.${prefix} *ʙᴏᴛɪɴғᴏ*
> ┃✯│➣ 314.${prefix} *ɢᴄ-ɪᴅ*
> ┃✯│➣ 315.${prefix} *ᴜsᴇʀ-ɪᴅ*
> ┃✯│➣ 316.${prefix} *ɢᴇᴛᴄʜᴀɴɴᴇʀᴏᴡɴᴇʀ*
> ┃✯│➣ 317.${prefix} *sʜᴀᴅᴏᴡʏᴀɴ*
> ┃✯│➣ 318.${prefix} *ᴄʏʙᴇʀᴋɪʟʟ*
> ┃✯│➣ 319.${prefix} *ɴᴜᴋᴇɢᴄ*
> ┃✯│➣ 320.${prefix} *ᴠɪʀᴜsʙᴜɢ*
> ┃✯│➣ 321.${prefix} *ғʀᴇᴇᴢᴇɢᴄ*
> ┃✯│➣ 322.${prefix} *ᴅᴀʀᴋɴᴇᴛ*
> ┃✯╰─────────────────❍
> ╰══════════════════⊷❍

> ╭════〘 *ᴄʏʙᴇʀ sᴛʀɪᴋᴇ* 〙════⊷❍
> ┃✯│→ *\`ᴄᴇɴᴛᴇʀ sʀɪᴋᴇs\`*
> ┃✯│➣ 323.${prefix} *ᴅᴅᴏsᴀᴛᴛᴀᴄᴋ*
> ┃✯│➣ 324.${prefix} *ʙᴏᴛɴᴇᴛ*
> ┃✯│➣ 325.${prefix} *sǫʟɪɴᴊᴇᴄᴛ*
> ┃✯│➣ 326.${prefix} *xssᴀᴛᴛᴀᴄᴋ*
> ┃✯│➣ 327.${prefix} *ʀᴀᴛɢᴇɴ*
> ┃✯│➣ 328.${prefix} *ᴋᴇʏʟᴏɢ*
> ┃✯│➣ 329.${prefix} *sɴɪғғᴇʀ*
> ┃✯│➣ 330.${prefix} *ʙʀᴜᴛᴇғᴏʀᴄᴇ*
> ┃✯│➣ 331.${prefix}  *ᴄʟᴏɴᴇɪᴅ*
> ┃✯│➣ 332.${prefix} *sᴘᴏᴏғ*
> ┃✯│➣ 333.${prefix} *ᴘʜɪsʜɢᴇɴ*
> ┃✯│➣ 334.${prefix} *ᴅᴇғᴀᴄᴇ*
> ┃✯│➣ 335.${prefix} *ᴇxᴘʟᴏɪᴛᴅʙ*
> ┃✯│➣ 336.${prefix} *ᴄʀᴀᴄᴋᴇʀ*
> ┃✯│➣ 337.${prefix} *ᴡɪғɪʜᴀᴄᴋ*
> ┃✯│➣ 338.${prefix} *ɪᴘᴅʀᴏɴᴇ*
> ┃✯│➣ 339.${prefix} *ᴛʀᴀᴄᴋɪᴘ*
> ┃✯│➣ 340.${prefix} *ɢʜᴏsᴛʜᴀᴄᴋ*
> ┃✯╰─────────────────❍
> ╰═══════════════════⊷❍

> ╭════〘 *ᴄʏʙᴇʀ ᴅᴇᴀᴛʜɴᴏᴛᴇ* 〙══⊷❍
> ┃✯│→ *\`ɢᴄ-ᴏɴʟʏ_ ᴜsᴇ ᴊɪᴅ\`*
> ┃✯│➣ 341.${prefix} *ɢʀᴀɴᴛsᴜᴅᴏᴀᴄᴄᴇss*
> ┃✯│➣ 342.${prefix} *ᴠɪʀᴜs*
> ┃✯│➣ 343.${prefix} *ᴅᴇᴀᴛʜᴡʀɪᴛᴇ*
> ┃✯│➣ 344.${prefix} *sʜɪɴɪɢᴀᴍɪʏᴜɢ*
> ┃✯│➣ 345.${prefix} *ᴋɪʀᴀᴊᴜᴅɢᴇ*
> ┃✯│➣ 346.${prefix} *ʀʏᴜᴋᴄʀᴀsʜ*
> ┃✯│➣ 347.${prefix} *ɴᴏᴛᴇɴᴜᴋᴇ*
> ┃✯│➣ 348.${prefix} *ᴅᴀʀᴋʟᴀᴡ*
> ┃✯│➣ 349.${prefix} *ᴅᴇᴀᴛʜʙᴏᴍʙ*
> ┃✯│➣ 350.${prefix} *ᴄʏʙᴇʀᴋɪʀᴀ*
> ┃✯╰──────────────────❍
> ╰════════════════════⊷⍟

> ╭════〘 *ᴏᴛʜᴇʀs*  〙════⊷❍
> ┃✯│→ *\`ʙᴏᴛ ᴇxᴛʀᴀ-ᴄᴍᴅᴢ\`*
> ┃✯│➣ 351.${prefix} *ᴜᴘᴅᴀᴛᴇ*
> ┃✯│➣ 352.${prefix} *ᴏᴡɴᴇʀɪɴғᴏ*
> ┃✯│➣ 353.${prefix} *ɢᴅᴇsᴄ*
> ┃✯│➣ 354.${prefix} *ᴇɴᴅ*
> ┃✯│➣ 355.${prefix} *ʜᴏʀʀᴏʀ*
> ┃✯│➣ 356.${prefix} *ᴍᴀʀᴋᴜsᴇʀ*
> ┃✯│➣ 357.${prefix} *ᴍᴇɴᴜ2*
> ┃✯│➣ 358.${prefix} *sᴇʀᴠᴇʀ*
> ┃✯│➣ 359.${prefix} *ᴅᴀʀᴋ*
> ┃✯│➣ 360.${prefix} *sʟᴏᴡ*
> ┃✯│➣ 361.${prefix} *ғᴀsᴛ*
> ┃✯│➣ 362.${prefix} *ᴅɪsᴋɪɴғᴏ*
> ┃✯│➣ 363.${prefix} *ᴀᴅᴍɪɴᴛʀᴀᴄᴋᴇʀ*
> ┃✯│➣ 364.${prefix} *ᴛʀᴀᴄᴋɢᴄᴏᴡɴᴇʀ*
> ┃✯│➣ 365.${prefix} *ᴀɪᴠᴏɪᴄᴇ*
> ┃✯│➣ 366.${prefix} *ᴀᴅᴅᴠᴏɪᴄᴇ*
> ┃✯│➣ 367.${prefix} *ʀᴇsᴛɢᴀᴍᴇs*
> ┃✯│➣ 368.${prefix} *ᴏᴜᴛ*
> ┃✯│➣ 369.${prefix} *ᴠᴠ3*
> ┃✯│➣ 370.${prefix} *ᴀᴜᴛᴏᴋɪᴄᴋʙᴏᴛ*
> ┃✯╰──────────────────❍
> ╰════════════════════⊷⍟
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ _sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ_*`

  // --- FIXED send part ---
  const chatId = m.chat || m.key?.remoteJid || m.from
  const quotedMsg = m.key ? m : undefined
  const contextInfo = {
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid: jid,
      newsletterName: "STORM CYBER MD",
      serverMessageId: 1
    }
  }

  // 1. Try cached / local image - under 800KB only
  const imgBuf = await getMenuImage()
  if(imgBuf){
    try{
      await sock.sendMessage(chatId, { image: imgBuf, caption: menu, contextInfo }, { quoted: quotedMsg })
      return
    }catch(e){ console.log('[MENU] image send failed:', e.message) }
  }

  // 2. Fallback: text + channel - never freezes, always works
  try{
    await sock.sendMessage(chatId, { text: menu, contextInfo }, { quoted: quotedMsg })
    return
  }catch(e){ console.log('[MENU] text+channel failed:', e.message) }

  // 3. Last fallback: plain text
  await sock.sendMessage(chatId, { text: menu }, { quoted: quotedMsg })

 } catch(e){ console.log(e) }
}
}
