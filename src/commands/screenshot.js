const axios=require('axios')
module.exports={
name:"screenshot",
aliases:["ss","webss","screen","shot"],
execute: async(sock,m,args)=>{
 try{
  let url=args[0]||""
  if(!url) return await sock.sendMessage(m.chat,{text:"ᴜsᴀɢᴇ:.ss https://google.com"},{quoted:m})
  if(!url.startsWith("http")) url="https://"+url

  await sock.sendMessage(m.chat,{text:`ᴄᴀᴘᴛᴜʀɪɴɢ ${url}...`},{quoted:m})

  // thum.io fast no key
  let ssUrl=`https://image.thum.io/get/fullpage/noanimate/width/1280/crop/1000/${url}`

  // try microlink fallback if thum fails
  try{
    await sock.sendMessage(m.chat,{image:{url:ssUrl}, caption:`sᴄʀᴇᴇɴsʜᴏᴛ ✅\n${url}\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})
  }catch{
    let api=`https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
    let res=await axios.get(api)
    let img=res.data?.data?.screenshot?.url
    if(!img) throw new Error("no image")
    await sock.sendMessage(m.chat,{image:{url:img}, caption:`sᴄʀᴇᴇɴsʜᴏᴛ ✅\n${url}`},{quoted:m})
  }

 }catch(e){
  await sock.sendMessage(m.chat,{text:`ғᴀɪʟᴇᴅ: ${e.message}\nᴛʀʏ.ss https://google.com`},{quoted:m})
 }
}
}
