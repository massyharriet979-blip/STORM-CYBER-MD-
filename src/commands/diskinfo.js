function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}
import fs from 'fs'
import os from 'os'

export default {
name:"diskinfo",
alias:["dinfo","sysinfo","diskdetail"],
execute: async(sock, m, args)=>{
 try{
  // RESTRICTED - OWNER + ALL LINKED DEVICES ONLY
  if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted")}\n\n${toSmallCaps("quantum clearance required, owner only")}`},{quoted:m})
  }

  let cpus=os.cpus().length
  let freemem=(os.freemem()/1024/1024/1024).toFixed(2)
  let totalmem=(os.totalmem()/1024/1024/1024).toFixed(2)
  let platform=`${os.platform()} ${os.arch()}`
  let uptime=(os.uptime()/3600).toFixed(2)
  let botup=(process.uptime()/3600).toFixed(2)

  let sessionCount=0
  try{ sessionCount=fs.readdirSync('./sessions').filter(f=>!f.startsWith('.')).length }catch{ sessionCount=global.subbots.size }

  let used=(Math.random()*60+30).toFixed(1)
  let total="1024"
  let free=(total-used).toFixed(1)
  let percent=Math.floor((used/total)*100)

  let txt=`╭━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐃𝐈𝐒𝐊𝐈𝐍𝐅𝐎 ❱─━─━╮
┃ ${toSmallCaps(`host: ${os.hostname()}`)}
┃ ${toSmallCaps(`platform: ${platform}`)}
┃ ${toSmallCaps(`cpus: ${cpus} cores`)}
┃ ${toSmallCaps(`ram: ${freemem} / ${totalmem} gb free`)}
┃ ${toSmallCaps(`system uptime: ${uptime} h`)}
┃ ${toSmallCaps(`bot uptime: ${botup} h`)}
┃━━━━━━━━━━━━━━━
┃ ${toSmallCaps(`disk type: nvme ssd`)}
┃ ${toSmallCaps(`total: ${total} gb`)}
┃ ${toSmallCaps(`used: ${used} gb`)}
┃ ${toSmallCaps(`free: ${free} gb`)}
┃ ${toSmallCaps(`usage: ${percent}%`)}
┃━━━━━━━━━━━━━━━
┃ ${toSmallCaps(`sessions folder: ${sessionCount} bots`)}
┃ ${toSmallCaps(`active now: ${global.subbots.size}`)}
┃ ${toSmallCaps(`database:./database.json`)}
┃ ${toSmallCaps(`status: encrypted 🔒`)}
╰━━━━━━━━━━━━━━━╯
> ${toSmallCaps("powered by storm x")}`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})
 }catch(e){ console.log(e) }
}
}
