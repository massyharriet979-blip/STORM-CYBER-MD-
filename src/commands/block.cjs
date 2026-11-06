const fs=require('fs')
module.exports={
name:"block",
execute: async(sock,m,args)=>{
 let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
 let sender=m.sender.split("@")[0]
 if(sender!==botId) return await sock.sendMessage(m.chat,{text:"ǫᴜᴀɴᴛᴜᴍ ᴄʟᴇᴀʀᴀɴᴄᴇ ʀᴇǫᴜɪʀᴇᴅ"},{quoted:m})
 let target=null
 if(m.mentionedJid?.length) target=m.mentionedJid[0]
 else if(m.quoted) target=m.quoted.sender
 else if(args[0]) target=args[0].replace(/[^0-9]/g,"")+"@s.whatsapp.net"
 if(!target) return await sock.sendMessage(m.chat,{text:"ᴜsᴀɢᴇ:.ʙʟᴏᴄᴋ 256.../tag/reply"},{quoted:m})
 try{
  await sock.updateBlockStatus(target, "block")
  await sock.sendMessage(m.chat,{text:`ʙʟᴏᴄᴋᴇᴅ ✅ @${target.split("@")[0]}`, mentions:[target]},{quoted:m})
 }catch(e){ await sock.sendMessage(m.chat,{text:`ғᴀɪʟ: ${e.message}`},{quoted:m}) }
}
}
