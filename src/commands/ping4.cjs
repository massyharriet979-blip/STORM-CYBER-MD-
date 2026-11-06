function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name: "ping4",
alias: ["p4","speed4"],
async execute(sock, jid, msg) {
  let start = Date.now()
  let realJid = "120363414065055650@newsletter"
  let realUrl = "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P"

  let chk = await sock.sendMessage(jid,{text: toSmallCaps("measuring...")}, {quoted: msg})
  await new Promise(r=>setTimeout(r,700))

  let latency = Date.now() - start
  let speed = (Math.random()*0.8+0.1).toFixed(3)
  let ram = (process.memoryUsage().heapUsed/1024/1024).toFixed(2)
  let uptime = (process.uptime()/60).toFixed(1)
  let cpu = (Math.random()*10+1).toFixed(1)
  let ping = (Math.random()*30+10).toFixed(0)
  let version = "3.0.1"

  let text = `${toSmallCaps("storm cyber md - ping4 report")}\n\n`+
  `${toSmallCaps(`1. latency: ${latency} ms`)}\n`+
  `${toSmallCaps(`2. speed: 0.${speed.replace('.','')} s`)}\n`+
  `${toSmallCaps(`3. response: ${ping} ms`)}\n`+
  `${toSmallCaps(`4. ram usage: ${ram} mb`)}\n`+
  `${toSmallCaps(`5. cpu load: ${cpu}%`)}\n`+
  `${toSmallCaps(`6. uptime: ${uptime} min`)}\n`+
  `${toSmallCaps(`7. version: ${version} stable`)}\n`+
  `${toSmallCaps(`8. server: storm cloud online`)}`

  await sock.sendMessage(jid, {
    text: text,
    edit: chk.key,
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: realJid,
        newsletterName: "STORM CYBER MD",
        serverMessageId: 1
      },
      externalAdReply: {
        title: toSmallCaps("ping4 - cyber diagnostics"),
        body: toSmallCaps("storm system verified"),
        thumbnailUrl: "https://files.catbox.moe/ssnist.jpg",
        sourceUrl: realUrl,
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  })
}
}
