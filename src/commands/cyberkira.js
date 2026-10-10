function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"cyberkira",
alias:["kira","deathnote","light"],
execute: async(sock, m, args)=>{
 try{
  let target = m.mentionedJid?.[0] || m.quoted?.sender || args[0]?.replace(/[^0-9]/g,'')+"@s.whatsapp.net"
  if(!args[0]) target = m.sender

  let reason = args.slice(1).join(" ") || "stealing cookies"
  let name = target.split('@')[0]

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("opening death note... 📓")}`},{quoted:m})
  await new Promise(r=> setTimeout(r,1000))

  let stage1 = `*DEATH NOTE*
${toSmallCaps("this note will cause death...")}

> ${toSmallCaps(`name: ${name}`)}
> ${toSmallCaps(`cause: ${reason}`)}
> ${toSmallCaps("status: writing... ✍️")}`

  await sock.sendMessage(m.chat,{text:stage1},{quoted:m})
  await new Promise(r=> setTimeout(r,2000))

  let stage2 = `
╭══〘 ☠️ 𝐂𝐘𝐁𝐄𝐑 𝐊𝐈𝐑𝐀 〙══⊷❍
┃ ${toSmallCaps(`victim: @${name}`)}
┃ ${toSmallCaps(`judgement: guilty`)}
┃ ${toSmallCaps(`method: cardiac arrest`)}
┃ ${toSmallCaps(`time: 40 seconds`)}
┃ ${toSmallCaps(`reason: ${reason}`)}
┃
┃ ${toSmallCaps("shinigami: ryuk approved")}
┃ ${toSmallCaps("note sealed with blood")}
╰═══════════════════⊷❍
${toSmallCaps("you have been judged by kira")}
> ${toSmallCaps("rest in pixels...")}
`

  await sock.sendMessage(m.chat,{
   image:{url:"https://files.catbox.moe/wk7vzi.jpg"},
   caption:stage2,
   mentions:[target],
   contextInfo:{
    forwardedNewsletterMessageInfo:{
     newsletterJid:"120363414065055650@newsletter",
     newsletterName:"STORM CYBER MD | KIRA",
     serverMessageId:1
    }
   }
  },{quoted:m})

  await sock.sendMessage(m.chat,{audio:{url:"https://files.catbox.moe/1m2j8r.mp3"}, mimetype:'audio/mpeg', ptt:true},{quoted:m}).catch(()=>{})

 }catch(e){ console.log(e) }
}
}
