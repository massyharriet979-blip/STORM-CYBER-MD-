function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name: "ping3",
alias: ["p3","speed3"],
async execute(sock, jid, msg) {
  let start = Date.now()
  let realJid = "120363414065055650@newsletter"
  let realUrl = "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P"

  let chk = await sock.sendMessage(jid,{text: toSmallCaps("initiating cyber diagnostic...")}, {quoted: msg})
  await new Promise(r=>setTimeout(r,900))
  await sock.sendMessage(jid,{text: toSmallCaps("analyzing server nodes..."), edit: chk.key})

  let latency = Date.now() - start
  let uptime = (process.uptime()/3600).toFixed(2)
  let ram = (process.memoryUsage().heapUsed/1024/1024).toFixed(2)

  let finalText = `${toSmallCaps("storm cyber md - system report 🛰️")}\n\n`+
  `${toSmallCaps(`hello boss, your bot is running perfectly fine on storm cloud servers.`)} `+
  `${toSmallCaps(`we just checked the connection and everything is stable and fast.`)} `+
  `${toSmallCaps(`your current latency is ${latency} ms which is super fast for whatsapp.`)} `+
  `${toSmallCaps(`the bot has been up for ${uptime} hours without any crash or error.`)} `+
  `${toSmallCaps(`ram usage is only ${ram} mb, so the system is very light and optimized.`)} `+
  `${toSmallCaps(`all cyber modules are active and ready to execute commands instantly.`)} `+
  `${toSmallCaps(`this is ping3 version designed only for storm family members.`)}`

  await sock.sendMessage(jid, {
    text: finalText,
    edit: chk.key,
    contextInfo: {
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
        newsletterJid: realJid,
        newsletterName: "STORM CYBER MD",
        serverMessageId: 1
      },
      externalAdReply: {
        title: toSmallCaps("storm cyber md verified ✅"),
        body: toSmallCaps("cyber system active - tap to join"),
        thumbnailUrl: "https://files.catbox.moe/jtb63o.jpg",
        sourceUrl: realUrl,
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true
      }
    }
  })
}
}
