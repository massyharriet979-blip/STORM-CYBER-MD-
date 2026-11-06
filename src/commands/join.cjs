const fs=require('fs')
module.exports={
name:"join",
aliases:["joingc","joingroup"],
execute: async(sock,m,args)=>{
 let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
 let sender=m.sender.split("@")[0]
 if(sender!==botId) return await sock.sendMessage(m.chat,{text:"ǫᴜᴀɴᴛᴜᴍ ᴄʟᴇᴀʀᴀɴᴄᴇ ʀᴇǫᴜɪʀᴇᴅ"},{quoted:m})
 let link=args[0]||m.quoted?.msg||""
 if(!link.includes("whatsapp.com")) return await sock.sendMessage(m.chat,{text:"ᴜsᴀɢᴇ:.ᴊᴏɪɴ https://chat.whatsapp.com/xxxxx"},{quoted:m})
 let code=link.split("https://chat.whatsapp.com/")[1]?.split(" ")[0]?.trim()
 if(!code) return await sock.sendMessage(m.chat,{text:"ɪɴᴠᴀʟɪᴅ ʟɪɴᴋ"},{quoted:m})
 try{
  let res=await sock.groupAcceptInvite(code)
  await sock.sendMessage(m.chat,{text:`ᴊᴏɪɴᴇᴅ ✅\nɪᴅ: ${res}`},{quoted:m})
 }catch(e){ await sock.sendMessage(m.chat,{text:`ғᴀɪʟ: ${e.message}`},{quoted:m}) }
}
}
