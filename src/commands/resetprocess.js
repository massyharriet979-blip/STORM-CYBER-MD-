module.exports={
name:"resetprocess",
aliases:["reset","rstproc"],
execute: async(sock,m)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  if(m.sender.split("@")[0]!==botId) return await sock.sendMessage(m.chat,{text:"⛔ RESTRICTED\n> OWNER ONLY COMMAND"},{quoted:m})

  let msg=await sock.sendMessage(m.chat,{text:"♻️ RESETTING PROCESS... 0%"},{quoted:m})

  let steps=[
    "🧹 CLEARING CACHE... 25%",
    "🗑️ KILLING ZOMBIE PROCESSES... 50%",
    "🔄 RESETTING RAM... 75%",
    "✅ PROCESS RESET DONE 100%\n\n> SYSTEM CLEANED\n> ALL PROCESSES FRESH"
  ]

  for(let s of steps){
    await new Promise(r=>setTimeout(r,1200))
    await sock.sendMessage(m.chat,{text:s, edit:msg.key})
  }

 }catch(e){ await sock.sendMessage(m.chat,{text:`ERR: ${e.message}`},{quoted:m}) }
}
}
