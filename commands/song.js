import yts from 'yt-search'
import ytdl from '@distube/ytdl-core'
import fs from 'fs'

export default {
 name: 'song',
 async execute(sock, from, msg, args) {
  if(!args[0]) return sock.sendMessage(from,{text:'> ex:.song montagem bravo'}, {quoted:msg})
  try{await sock.sendMessage(from,{react:{text:'🎧',key:msg.key}})}catch{}

  const v = (await yts(args.join(' '))).videos[0]
  if(!v) return

  const cap = `*╔═══「STORM CYBER MD 」═══❒*
*║╭───────────────◆*
*║│ ❍ 𝙰𝚄𝙳𝙸𝙾 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*
*║╰───────────────◆*
*╚════════════════❒*
*╔══════════════════❒*
*┣◆ 𝚃𝙸𝚃𝙻𝙴:* ${v.title.toUpperCase()}
*┣◆ 𝙳𝚄𝚁𝙰𝚃𝙸𝙾𝙽:* ${v.timestamp}
*┣◆ 𝙰𝚄𝚃𝙷𝙾𝚁:* ${v.author.name.toUpperCase()}
*╚══════════════════❒*
*◇POWERED BY STORM X TEAM*`

  await sock.sendMessage(from, { image: { url: v.thumbnail }, caption: cap }, { quoted: msg })

  const file = `/tmp/${Date.now()}.mp3`
  await new Promise(r => ytdl(v.url,{filter:'audioonly'}).pipe(fs.createWriteStream(file)).on('finish',r))
  await sock.sendMessage(from, { audio: fs.readFileSync(file), mimetype:'audio/mpeg' }, { quoted: msg })
  fs.unlinkSync(file)
 }
}
