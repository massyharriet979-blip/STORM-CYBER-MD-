const fs=require('fs')
const path=require('path')

module.exports={
name:"reload",
aliases:["rl","refresh"],
execute: async(sock,m,args)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]
  if(sender!==botId) return await sock.sendMessage(m.chat,{text:"ᴏᴡɴᴇʀ ᴏɴʟʏ"},{quoted:m})

  // if user wants fake
  if(args[0]==="fake"){
    let msg=await sock.sendMessage(m.chat,{text:"♻️ ʀᴇʟᴏᴀᴅɪɴɢ... 0%"},{quoted:m})
    for(let t of ["ʟᴏᴀᴅɪɴɢ ᴄᴏᴍᴍᴀɴᴅs... 40%","ᴄʟᴇᴀʀɪɴɢ ᴄᴀᴄʜᴇ... 70%","✅ 78 ᴄᴏᴍᴍᴀɴᴅs ʀᴇʟᴏᴀᴅᴇᴅ [ғᴀᴋᴇ] 100%"]){
      await new Promise(r=>setTimeout(r,800))
      await sock.sendMessage(m.chat,{text:t, edit:msg.key})
    }
    return
  }

  let dir=path.join(__dirname)
  let files=fs.readdirSync(dir).filter(f=>f.endsWith(".js"))
  let ok=0,fail=0
  let failedList=[]

  for(let f of files){
    try{
      let full=path.join(dir,f)
      delete require.cache[require.resolve(full)]
      let mod=require(full)
      if(!mod.name) throw new Error("no name export")
      ok++
    }catch(e){
      fail++
      failedList.push(`${f}: ${e.message}`)
      console.log(`reload skip ${f}:`,e.message)
      // don't crash, continue
    }
  }

  let txt=`♻️ sᴀғᴇ ʀᴇʟᴏᴀᴅ ᴅᴏɴᴇ\n\n✅ ʟᴏᴀᴅᴇᴅ: ${ok}\n${fail?`❌ ғᴀɪʟᴇᴅ: ${fail}\n${failedList.slice(0,3).join("\n")}`:`❌ ғᴀɪʟᴇᴅ: 0`}\n\n> ʙᴏᴛ sᴛɪʟʟ ʀᴜɴɴɪɴɢ - ɴᴏ ᴄʀᴀsʜ`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})

 }catch(e){
  await sock.sendMessage(m.chat,{text:`sᴀғᴇ: ʙᴏᴛ ɴᴏᴛ ᴄʀᴀsʜᴇᴅ\nᴇʀʀ: ${e.message}`},{quoted:m})
 }
}
}

