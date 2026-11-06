const fs=require('fs')
const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const pino=require('pino')
module.exports={
name:"pp",
aliases:["setpp","setprofile","updatepp","ppbot"],
execute: async(sock,m,args)=>{
 try{
  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]

  let sudoList=[]
  try{ if(fs.existsSync("./database/sudo.json")) sudoList=JSON.parse(fs.readFileSync("./database/sudo.json")) }catch{}
  try{ if(fs.existsSync(`./database/sudo_${botId}.json`)){ let extra=JSON.parse(fs.readFileSync(`./database/sudo_${botId}.json`)); sudoList=sudoList.concat(extra) } }catch{}

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
  if(!isOwner &&!isSudo &&!isGroupAdmin) return await sock.sendMessage(m.chat,{text:"ǫᴜᴀɴᴛᴜᴍ ᴄʟᴇᴀʀᴀɴᴄᴇ ʀᴇǫᴜɪʀᴇᴅ"},{quoted:m})
  if(isGroupAdmin &&!isOwner &&!isSudo) return await sock.sendMessage(m.chat,{text:"ʏᴏᴜ ᴀʀᴇ ʀᴇsᴛʀɪᴄᴛᴇᴅ ᴛᴏ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ"},{quoted:m})
  if(isSudo &&!isOwner) return await sock.sendMessage(m.chat,{text:"ʏᴏᴜ ʜᴀᴠᴇ ʟɪᴍɪᴛs ᴛᴏ sᴏᴍᴇ ᴄᴏᴍᴍᴀɴᴅs"},{quoted:m})

  // get image
  let targetMsg=null
  if(m.quoted && (m.quoted.mtype==="imageMessage"||m.quoted.msg?.caption!==undefined)){
    // reconstruct quoted as baileys msg for download
    targetMsg={ key:m.quoted.key, message:m.quoted.message }
  }else if(m.mtype==="imageMessage"||m.mtype==="extendedTextMessage" && m.chat){
    // current msg has image
    let fullMsg={ key:m.key, message:{} }
    // we need to use m directly - m.quoted.msg not, so use sock message from cache? Instead download from m.key via media?
    // Simplest: try download from current msg object if present
    fullMsg.message=m.quoted?.message||{}
    // fallback - try to download current
    targetMsg={ key:m.key, message:{ imageMessage: {}} }
    // we will attempt download via m directly below
  }

  let buffer=null
  try{
    if(m.quoted && m.quoted.mtype==="imageMessage"){
      let qmsg={ key:m.quoted.key, message:m.quoted.message }
      buffer=await downloadMediaMessage(qmsg, 'buffer', {}, {logger:pino({level:'silent'}), reuploadRequest:sock.updateMediaMessage})
    }else if(m.mtype==="imageMessage"){
      // need original msg
      let curMsg={ key:m.key, message:{} }
      // m.msg is the imageMessage object
      curMsg.message.imageMessage=m.msg||m.quoted?.msg
      if(m.msg?.url || m.msg?.mimetype){
        buffer=await downloadMediaMessage(curMsg, 'buffer', {}, {logger:pino({level:'silent'}), reuploadRequest:sock.updateMediaMessage})
      }
    }else if(m.quoted && m.quoted.msg && m.quoted.msg.mimetype && m.quoted.msg.mimetype.includes('image')){
      let qmsg={ key:m.quoted.key, message:m.quoted.message }
      buffer=await downloadMediaMessage(qmsg, 'buffer', {}, {logger:pino({level:'silent'}), reuploadRequest:sock.updateMediaMessage})
    }
  }catch(e){ console.log('pp dl err',e.message) }

  // Second try - if buffer still null, try download from current message using sock msg structure we have in index? We'll use m.quoted fallback
  if(!buffer){
    // attempt direct from m.msg if it's buffer? fail
    return await sock.sendMessage(m.chat,{text:"ʀᴇᴘʟʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ ᴏʀ sᴇɴᴅ ɪᴍᴀɢᴇ ᴡɪᴛʜ ᴄᴀᴘᴛɪᴏɴ.ᴘᴘ\n\nᴇx: ʀᴇᴘʟʏ ɪᴍᴀɢᴇ >.ᴘᴘ"},{quoted:m})
  }

  try{
    await sock.updateProfilePicture(sock.user.id, buffer)
    await sock.sendMessage(m.chat,{text:"ᴘʀᴏғɪʟᴇ ᴘɪᴄᴛᴜʀᴇ ᴜᴘᴅᴀᴛᴇᴅ ✅\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x"},{quoted:m})
  }catch(e){
    console.log(e)
    await sock.sendMessage(m.chat,{text:`ғᴀɪʟᴇᴅ: ${e.message}`},{quoted:m})
  }

 }catch(e){ console.log(e) }
}
}
