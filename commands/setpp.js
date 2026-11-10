function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"setpp",
alias:["setprofilepic","setbotpp","updatepp"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner && !m.isSubBotOwner){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 🔐 〙══⊷❍
┃ ${toSmallCaps("quantum clearance required, owner only")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  let quoted = m.quoted || m.msg?.contextInfo?.quotedMessage
  let imgMsg = null

  if(m.msg?.imageMessage) imgMsg = m.msg
  else if(quoted?.imageMessage) imgMsg = quoted
  else if(m.quoted?.imageMessage) imgMsg = m.quoted

  if(!imgMsg){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 🖼️ 𝐒𝐄𝐓𝐏𝐏 〙══⊷❍
┃ ${toSmallCaps("reply to an image or send image with caption")}
┃ ${toSmallCaps("usage")}: .setpp [reply to image]
┃
┃ ${toSmallCaps("bot profile picture will be updated")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  const { downloadMediaMessage } = await import("@whiskeysockets/baileys")
  let buffer = null
  try{
   if(m.msg?.imageMessage) buffer = await downloadMediaMessage(m, "buffer", {})
   else buffer = await downloadMediaMessage({message: quoted}, "buffer", {})
  }catch{}

  if(!buffer){
   return sock.sendMessage(m.chat,{text:toSmallCaps("failed to download image, try again")},{quoted:m})
  }

  await sock.updateProfilePicture(sock.user.id, buffer)

  await sock.sendMessage(m.chat,{
   text:`╭══〘 🖼️ 𝐒𝐄𝐓𝐏𝐏 〙══⊷❍
┃ ${toSmallCaps("bot profile picture updated successfully")}
┃ ${toSmallCaps("new pp applied")}
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
  },{quoted:m})
 }catch(e){console.log(e); try{ await sock.sendMessage(m.chat,{text:toSmallCaps("failed to set pp, send image again")},{quoted:m}) }catch{}}
}
};
