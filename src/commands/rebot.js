module.exports={
name:"rebot",
aliases:["reboot","restart","rb","fakereboot"],
execute: async(sock,m,args)=>{
 try{
  let msg=await sock.sendMessage(m.chat,{text:"♻️ ʀᴇʙᴏᴏᴛɪɴɢ... 0%"},{quoted:m})
  let steps=[
    "♻️ ʟᴏᴀᴅɪɴɢ ᴍᴏᴅᴜʟᴇs... 25%",
    "⚡ ᴄᴏɴɴᴇᴄᴛɪɴɢ ᴛᴏ ᴡᴀ sᴇʀᴠᴇʀ... 50%",
    "🔗 sʏɴᴄɪɴɢ sᴇssɪᴏɴs... 75%",
    "✅ sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ ʀᴇʙᴏᴏᴛᴇᴅ sᴜᴄᴇssғᴜʟʏ! 100%\n> ᴜᴘᴛɪᴍᴇ: ғᴀᴋᴇ ʀᴇʙᴏᴏᴛ - ɴᴏ ᴀᴄᴛᴜᴀʟ ʀᴇsᴛᴀʀᴛ"
  ]
  for(let s of steps){
    await new Promise(r=>setTimeout(r,1200))
    await sock.sendMessage(m.chat,{text:s, edit:msg.key})
  }
 }catch(e){ console.log(e) }
}
}
