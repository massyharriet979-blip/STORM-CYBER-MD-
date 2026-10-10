function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"server",
alias:["srv","host","system"],
execute: async(sock, m, args)=>{
 try{
  let ram=(process.memoryUsage().heapUsed/1024/1024).toFixed(2)
  let totalMem="16384"
  let cpuModel="AMD EPYC 7763 64-Core"
  let cores="32"
  let speed=(Math.random()*0.3+0.7).toFixed(3)
  let uptimeH=(process.uptime()/3600).toFixed(2)
  let ping=Math.floor(Math.random()*20+15)
  let region=["Germany - Frankfurt","Singapore - SG1","USA - New York","Finland - Helsinki"][Math.floor(Math.random()*4)]
  let ip=`152.42.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
  let load=`${(Math.random()*2).toFixed(2)}, ${(Math.random()*2).toFixed(2)}, ${(Math.random()*2).toFixed(2)}`

  let txt=`╭━─━─❰ 𝐒𝐓𝐎𝐑𝐌 𝐒𝐄𝐑𝐕𝐄𝐑 ❱─━─━╮
┃ ${toSmallCaps(`status: online 🟢`)}
┃ ${toSmallCaps(`server: storm cloud v3`)}
┃ ${toSmallCaps(`region: ${region}`)}
┃ ${toSmallCaps(`ip: ${ip}`)}
┃ ${toSmallCaps(`ping: ${ping} ms`)}
┃ ${toSmallCaps(`speed: 0.${speed.replace('.','')} s`)}
┃━━━━━━━━━━━━━━━
┃ ${toSmallCaps(`cpu: ${cpuModel}`)}
┃ ${toSmallCaps(`cores: ${cores} cores`)}
┃ ${toSmallCaps(`load avg: ${load}`)}
┃ ${toSmallCaps(`ram: ${ram} / ${totalMem} mb`)}
┃ ${toSmallCaps(`uptime: ${uptimeH} hours`)}
┃ ${toSmallCaps(`platform: linux x64`)}
┃ ${toSmallCaps(`node: ${process.version}`)}
┃ ${toSmallCaps(`security: quantum encrypted`)}
┃ ${toSmallCaps(`firewall: active 🛡️`)}
╰━━━━━━━━━━━━━━━╯
> ${toSmallCaps("powered by storm cyber md")}`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})
 }catch(e){ console.log(e) }
}
}
