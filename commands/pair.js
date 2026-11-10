function s(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"pair",
alias:["ᴘᴀɪʀ"],
execute: async(sock, m)=>{
  let bg = "https://files.catbox.moe/pznw3z.jpg"
  let jid = "120363414065055650@newsletter"

  await sock.sendMessage(m.chat,{
    image:{url: bg},
    caption:`${s("storm cyber md official pairing")}

${s("welcome to the future of whatsapp automation where power meets simplicity. storm cyber md is built for speed, stability and limitless features. thousands trust us for daily automation, entertainment and ai tools.")}

${s("this bot is not just a bot, it's your digital partner. fast pairing, no restrictions, multi device support and 24/7 uptime guaranteed.")}

${s("join the revolution today and experience the difference.")}

https://t.me/Cyber_advanced_md_bot
${s("view channel")}

${s("follow the storm cyber md channel on whatsapp")}: https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P

${s("jid")},> ${jid}

> ${s("powered by storm cyber md")}`,
    contextInfo:{
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo:{
        newsletterJid: jid,
        newsletterName: "STORM CYBER MD",
        serverMessageId: 1
      }
    }
  },{quoted:m})
}
}
