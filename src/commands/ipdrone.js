function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"ipdrone",
alias:["droneip","ipscan","iplookup"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return sock.sendMessage(m.chat,{
    text:`╭━━━〘 🔐 〙━━━╮
┃ ${toSmallCaps("quantum clearance required")}
┃ ${toSmallCaps("owner only")}
┃ ${toSmallCaps("access denied")}
╰━━━━━━━━━━━━╯`
   },{quoted:m})
  }

  let ip = args[0]?.trim()
  if(!ip){
   return sock.sendMessage(m.chat,{
    text:`${toSmallCaps("provide ip to scan")}\n>.ipdrone 8.8.8.8`
   },{quoted:m})
  }

  // basic ip validation
  if(!/^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&!/^[0-9a-fA-F:]+$/.test(ip)){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("invalid ip format")}`},{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"🛰️",key:m.key}}).catch(()=>{})
  await sock.sendMessage(m.chat,{
   text:`${toSmallCaps("drone launching")}...\n${toSmallCaps(`target ip: ${ip}`)}\n${toSmallCaps("scanning nodes...")}`
  },{quoted:m})

  await new Promise(r=>setTimeout(r,1200))

  try{
   let res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp,org,as,query,lat,lon,timezone`)
   let data = await res.json()

   if(data.status!== "success"){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("drone failed: ")}${data.message}`},{quoted:m})
   }

   let txt = `
╭══〘 🛰️ 𝐈𝐏 𝐃𝐑𝐎𝐍𝐄 〙══⊷❍
┃ ${toSmallCaps(`ip: ${data.query}`)}
┃ ${toSmallCaps(`country: ${data.country}`)}
┃ ${toSmallCaps(`region: ${data.regionName}`)}
┃ ${toSmallCaps(`city: ${data.city}`)}
┃ ${toSmallCaps(`lat/lon: ${data.lat}, ${data.lon}`)}
┃ ${toSmallCaps(`timezone: ${data.timezone}`)}
┃ ${toSmallCaps(`isp: ${data.isp}`)}
┃ ${toSmallCaps(`org: ${data.org}`)}
┃ ${toSmallCaps(`as: ${data.as}`)}
┃ ${toSmallCaps(`status: locked`)}
╰═══════════════════⊷❍
> ${toSmallCaps("drone scan complete")}
`
   await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
   await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}}).catch(()=>{})

  }catch(e){
   await sock.sendMessage(m.chat,{text:`${toSmallCaps("api error, try again")}`},{quoted:m})
  }

 }catch(e){ console.log(e) }
}
}
