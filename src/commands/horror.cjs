function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}
import axios from 'axios'

export default {
name:"horror",
alias:["scary","horrorimg","creepy"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted")}\n\n${toSmallCaps("quantum clearance required")}`},{quoted:m})
  }

  let prompt = args.join(' ') || "scary horror face, dark background, blood, creepy, 8k, ultra realistic"

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("generating horror image... 👹")}\n\n${toSmallCaps(`prompt: ${prompt}`)}`},{quoted:m})

  // Using free horror image API - pollinations AI
  let imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + " horror style, dark, scary, nightmare")}?nologo=true&model=flux`

  let txt=`╭━─━─❰ 👹 𝐇𝐎𝐑𝐑𝐎𝐑 𝐆𝐄𝐍 ❱─━─━╮
┃ ${toSmallCaps(`prompt: ${prompt}`)}
┃ ${toSmallCaps("type: nightmare")}
┃ ${toSmallCaps("status: generated 💀")}
╰━━━━━━━━━━━━━━━╯
> ${toSmallCaps("powered by storm x")}`

  await sock.sendMessage(m.chat,{
   image:{url:imageUrl},
   caption:txt,
   contextInfo:{
    forwardedNewsletterMessageInfo:{
     newsletterJid:"120363414065055650@newsletter",
     newsletterName:"STORM CYBER MD",
     serverMessageId:1
    }
   }
  },{quoted:m})

 }catch(e){ console.log(e)
  await sock.sendMessage(m.chat,{text:"Horror gen failed, try again"},{quoted:m})
 }
}
}
