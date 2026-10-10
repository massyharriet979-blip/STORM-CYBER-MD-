const axios=require('axios')
const {downloadMediaMessage}=require('@whiskeysockets/baileys')

module.exports={
name:"gif",
aliases:["togif","gifs","tenor"],
execute: async(sock,m,args)=>{
 try{
  let q=m.quoted? m.quoted : m
  let mime=(q.msg?.mimetype||q.mimetype||"").toLowerCase()

  // MODE 1: reply to video -> convert to gif
  if(mime.includes("video") && m.quoted){
    await sock.sendMessage(m.chat,{text:"ᴄᴏɴᴠᴇʀᴛɪɴɢ ᴛᴏ ɢɪғ..."},{quoted:m})
    let buf=await downloadMediaMessage(q, 'buffer', {})
    await sock.sendMessage(m.chat,{
      video:buf,
      caption:"> ɢɪғ ✅\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x",
      gifPlayback:true
    },{quoted:m})
    return
  }

  // MODE 2: search gif
  let query=args.join(" ")
  if(!query) return await sock.sendMessage(m.chat,{text:"ᴜsᴀɢᴇ:.ɢɪғ cat\nᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴠɪᴅᴇᴏ ᴡɪᴛʜ.ɢɪғ"},{quoted:m})

  await sock.sendMessage(m.chat,{text:`sᴇᴀʀᴄʜɪɴɢ ɢɪғ: ${query}...`},{quoted:m})

  try{
    // free tenor
    let res=await axios.get(`https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=LIVDSRZULELA&limit=10`)
    let results=res.data?.results
    if(!results||!results.length) throw new Error("no gif")
    let pick=results[Math.floor(Math.random()*results.length)]
    let url=pick.media[0]?.gif?.url || pick.media[0]?.mp4?.url

    await sock.sendMessage(m.chat,{
      video:{url:url},
      caption:`ɢɪғ: ${query}\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`,
      gifPlayback:true
    },{quoted:m})

  }catch(e){
    // fallback: send as sticker search? try waifu
    await sock.sendMessage(m.chat,{text:`ɴᴏ ɢɪғ ғᴏᴜɴᴅ ғᴏʀ ${query}`},{quoted:m})
  }

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
