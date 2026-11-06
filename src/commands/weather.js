const fs=require('fs')
module.exports={
name:"weather",
aliases:["wheather","wthr"],
execute: async(sock,m,args)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]

  let sudoList=[]
  try{ if(fs.existsSync("./database/sudo.json")) sudoList=JSON.parse(fs.readFileSync("./database/sudo.json")) }catch{}
  let subSudoPath=`./database/sudo_${botId}.json`
  try{ if(fs.existsSync(subSudoPath)){ let extra=JSON.parse(fs.readFileSync(subSudoPath)); sudoList=sudoList.concat(extra) } }catch{}

  let isOwner=sender===botId
  let isSudo=sudoList.includes(sender)

  let isGroupAdmin=false
  if(m.isGroup){
   try{
    let meta=await sock.groupMetadata(m.chat)
    let admins=meta.participants.filter(p=>p.admin!==null).map(a=>a.id.split("@")[0])
    if(admins.includes(sender)) isGroupAdmin=true
   }catch{}
  }

  // ONLY LOCAL BLOCKED
  if(!isOwner &&!isSudo &&!isGroupAdmin){
   return await sock.sendMessage(m.chat,{text:"ǫᴜᴀɴᴛᴜᴍ ᴄʟᴇᴀʀᴀɴᴄᴇ ʀᴇǫᴜɪʀᴇᴅ"},{quoted:m})
  }

  let location=args.join(" ").trim()
  if(!location) location="Kampala"

  await sock.sendMessage(m.chat,{react:{text:"⛅",key:m.key}})

  let url=`https://wttr.in/${encodeURIComponent(location)}?format=j1`
  let res=await fetch(url)
  let data=await res.json()

  if(!data.current_condition){
   return await sock.sendMessage(m.chat,{text:`ʟᴏᴄᴀᴛɪᴏɴ ɴᴏᴛ ғᴏᴜɴᴅ: ${location}`},{quoted:m})
  }

  let curr=data.current_condition[0]
  let area=data.nearest_area[0]

  let city=area.areaName[0].value
  let country=area.country[0].value
  let temp=curr.temp_C
  let feels=curr.FeelsLikeC
  let desc=curr.weatherDesc[0].value
  let humidity=curr.humidity
  let wind=curr.windspeedKmph
  let windDir=curr.winddir16Point
  let cloud=curr.cloudcover
  let vis=curr.visibility

  let msg=`ᴡᴇᴀᴛʜᴇʀ ɪɴ ${city}, ${country}

ᴅᴇsᴄ: ${desc.toLowerCase()}
ᴛᴇᴍᴘ: ${temp}°ᴄ (ғᴇᴇʟs ${feels}°ᴄ)
ʜᴜᴍɪᴅɪᴛʏ: ${humidity}%
ᴡɪɴᴅ: ${wind}ᴋᴍ/ʜ ${windDir}
ᴄʟᴏᴜᴅ: ${cloud}%
ᴠɪsɪʙɪʟɪᴛʏ: ${vis}ᴋᴍ

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`

  await sock.sendMessage(m.chat,{text:msg},{quoted:m})

 }catch(e){
  console.log(e)
  await sock.sendMessage(m.chat,{text:"ᴡᴇᴀᴛʜᴇʀ sᴇʀᴠɪᴄᴇ ᴇʀʀᴏʀ, ᴛʀʏ ᴀɢᴀɪɴ"},{quoted:m})
 }
}
}
