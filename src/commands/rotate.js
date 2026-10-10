const Jimp=require('jimp')

module.exports={
name:"rotate",
aliases:["rot","imgrotate"],
execute: async(sock,m,args)=>{
 try{
  let q=m.quoted? m.quoted : m
  let mime=(q.msg||q).mimetype || ""
  if(!mime.includes("image")) return await sock.sendMessage(m.chat,{text:"ʀᴇᴘʟʏ ᴀɴ ɪᴍᴀɢᴇ ᴡɪᴛʜ.ʀᴏᴛᴀᴛᴇ 90/180/270\nᴇx:.ʀᴏᴛᴀᴛᴇ 90"}, {quoted:m})

  let deg=parseInt(args[0])||90
  if(![90,180,270,360].includes(deg)) deg=90

  let buffer=await q.download()
  let image=await Jimp.read(buffer)
  image.rotate(deg)

  let out=await image.getBufferAsync(Jimp.MIME_JPEG)

  await sock.sendMessage(m.chat,{image:out, caption:`🔄 ʀᴏᴛᴀᴛᴇᴅ ${deg}° [ғᴀᴋᴇ sᴀғᴇ]`},{quoted:m})

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
