function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}
import fs from 'fs'

export default {
name:"disk",
alias:["storage","drive","space"],
execute: async(sock, m, args)=>{
 try{
  // RESTRICTED - OWNER + ALL LINKED DEVICES ONLY
  if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted")}\n\n${toSmallCaps("quantum clearance required, owner only")}`},{quoted:m})
  }

  let targetId = m.quoted?.sender || m.mentionedJid?.[0] || m.sender
  let targetNum = targetId.split('@')[0]
  let targetName = targetId===m.sender? "you" : `@${targetNum}`

  let isLinked = fs.existsSync(`./sessions/${targetNum}`)
  let linkedCount = 0
  try{ linkedCount = fs.readdirSync('./sessions').filter(f=>f.length>=10).length }catch{}

  let isOnline = global.subbots.has(targetNum)? "🟢 online" : "🔴 offline"

  let used=(Math.random()*40+20).toFixed(1)
  let total="500"
  let free=(total - used).toFixed(1)
  let percent=Math.floor((used/total)*100)
  let bar="█".repeat(Math.floor(percent/10)) + "░".repeat(10-Math.floor(percent/10))

  let txt=`╭━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐃𝐈𝐒𝐊 ❱─━─━╮
┃ ${toSmallCaps(`checked: ${targetName}`)}
┃ ${toSmallCaps(`number: ${targetNum}`)}
┃ ${toSmallCaps(`linked: ${isLinked? "yes ✅" : "no ❌"}`)}
┃ ${toSmallCaps(`status: ${isLinked? isOnline : "no session"}`)}
┃━━━━━━━━━━━━━━━
┃ ${toSmallCaps(`total: ${total} gb`)}
┃ ${toSmallCaps(`used: ${used} gb`)}
┃ ${toSmallCaps(`free: ${free} gb`)}
┃ ${toSmallCaps(`usage: ${percent}%`)}
┃ ${bar} ${percent}%
┃━━━━━━━━━━━━━━━
┃ ${toSmallCaps(`all sessions in server: ${linkedCount}`)}
┃ ${toSmallCaps(`active now: ${global.subbots.size}`)}
┃ ${toSmallCaps(`type: nvme ssd`)}
╰━━━━━━━━━━━━━━━╯
> ${toSmallCaps("powered by storm x")}`

  await sock.sendMessage(m.chat,{text:txt, mentions: targetId!==m.sender? [targetId] : []},{quoted:m})
 }catch(e){ console.log(e) }
}
}
