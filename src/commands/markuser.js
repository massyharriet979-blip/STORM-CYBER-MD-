function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"markuser",
alias:["mark","tagmark","usermark"],
execute: async(sock, m, args)=>{
 try{
  // RESTRICTED - OWNER + ALL LINKED DEVICES ONLY
  if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted")}\n\n${toSmallCaps("quantum clearance required, owner only")}`},{quoted:m})
  }

  let target = m.quoted?.sender || m.mentionedJid?.[0]
  if(!target){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("reply or tag someone to mark")}\n\n${toSmallCaps("example:.markuser @user or reply")}`},{quoted:m})
  }

  let num = target.split('@')[0]
  let mark = args.join(' ') || "marked ✅"

  let txt=`╭━─━─❰ 𝐔𝐒𝐄𝐑 𝐌𝐀𝐑𝐊𝐄𝐃 ❱─━─━╮
┃ ${toSmallCaps(`user: @${num}`)}
┃ ${toSmallCaps(`mark: ${mark}`)}
┃ ${toSmallCaps(`by: ${m.pushName || "owner"}`)}
┃ ${toSmallCaps(`time: ${new Date().toLocaleTimeString()}`)}
╰━━━━━━━━━━━━━━━╯
> ${toSmallCaps("powered by storm x")}`

  await sock.sendMessage(m.chat,{text:txt, mentions:[target]},{quoted:m})

 }catch(e){ console.log(e) }
}
}
