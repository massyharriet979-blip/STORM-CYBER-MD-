function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"trackip",
alias:["iptrack","iptracer","whereip"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isSubBotOwner){
   await sock.sendMessage(m.chat,{react:{text:"🚫",key:m.key}}).catch(()=>{})
   return sock.sendMessage(m.chat,{
    text:`╭━━━〘 🔐 〙━━━╮
┃ ${toSmallCaps("quantum clearance required")}
┃ ${toSmallCaps("owner only")}
╰━━━━━━━━━━━━╯`
   },{quoted:m})
  }

  let ip = args[0]?.trim()
  if(!ip){
   return sock.sendMessage(m.chat,{
    text:`${toSmallCaps("provide ip")}\n>.trackip 8.8.8.8`
   },{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"📍",key:m.key}}).catch(()=>{})
  await sock.sendMessage(m.chat,{
   text:`${toSmallCaps("tracking")} ${ip}...\n${toSmallCaps("satellite lock...")}`
  },{quoted:m})

  await new Promise(r=>setTimeout(r,1000))

  try{
   let res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query,proxy,hosting`)
   let d = await res.json()
   if(d.status!=="success"){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("failed: ")}${d.message}`},{quoted:m})
   }

   let maps = `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lon}`

   let txt=`
╭══〘 📍 𝐓𝐑𝐀𝐂𝐊 𝐈𝐏 〙══⊷❍
┃ ${toSmallCaps(`ip: ${d.query}`)}
┃ ${toSmallCaps(`country: ${d.country} (${d.countryCode})`)}
┃ ${toSmallCaps(`city: ${d.city} - ${d.regionName}`)}
┃ ${toSmallCaps(`zip: ${d.zip || "n/a"}`)}
┃ ${toSmallCaps(`coords: ${d.lat}, ${d.lon}`)}
┃ ${toSmallCaps(`tz: ${d.timezone}`)}
┃ ${toSmallCaps(`isp: ${d.isp}`)}
┃ ${toSmallCaps(`org: ${d.org}`)}
┃ ${toSmallCaps(`vpn/proxy: ${d.proxy? "yes" : "no"}`)}
┃ ${toSmallCaps(`hosting: ${d.hosting? "yes" : "no"}`)}
┃
┃ ${toSmallCaps("maps")}: ${maps}
╰═══════════════════⊷❍
> ${toSmallCaps("track complete")}
`
   await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
   await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}}).catch(()=>{})

  }catch(e){
   await sock.sendMessage(m.chat,{text:`${toSmallCaps("api down, try again")}`},{quoted:m})
  }

 }catch(e){console.log(e)}
}
}
