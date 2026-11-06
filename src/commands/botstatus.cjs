function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

function formatUptime(s){
 let d=Math.floor(s/86400)
 let h=Math.floor((s%86400)/3600)
 let m=Math.floor((s%3600)/60)
 let sec=Math.floor(s%60)
 return `${d}d ${h}h ${m}m ${sec}s`
}

export default {
name:"botstatus",
alias:["status","botstat","botinfo","stats"],
execute: async(sock, m, args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"📊",key:m.key}}).catch(()=>{})

  const uptime = formatUptime(process.uptime())
  const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
  const totalMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2)
  const platform = process.platform
  const nodeVer = process.version
  const cpus = require('os').cpus().length
  const arch = process.arch

  let txt=`
╭══〘 📊 𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒 〙══⊷❍
┃
┃ 🤖 ${toSmallCaps("bot: kira phantom")}
┃ ⏱️ ${toSmallCaps(`uptime: ${uptime}`)}
┃ 💾 ${toSmallCaps(`ram: ${mem}mb / ${totalMem}mb`)}
┃ 🖥️ ${toSmallCaps(`platform: ${platform} ${arch}`)}
┃ ⚙️ ${toSmallCaps(`node: ${nodeVer}`)}
┃ 🧠 ${toSmallCaps(`cpus: ${cpus}`)}
┃ 📅 ${toSmallCaps(`time: ${new Date().toLocaleString()}`)}
┃ 🔋 ${toSmallCaps("status: online [quantum]")}
┃
╰═══════════════════⊷❍
> ${toSmallCaps("kira phantom active")}
`
  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
  await sock.sendMessage(m.chat,{react:{text:"⚡",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
}
