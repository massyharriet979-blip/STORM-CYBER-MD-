function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"shazam",
alias:["sʜᴀᴢᴀᴍ","whatsong","findsong"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner")}`},{quoted:m})
  }

  let q = m.quoted? m.quoted : m
  let mime = q.mimetype || q.msg?.mimetype || ""

  if(!/audio|video/.test(mime)){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("reply to an audio / video / voice note to shazam")}`},{quoted:m})
  }

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("shazaming... listening")}`},{quoted:m})

  let buffer = await q.download()

  // free shazam api
  let form = new FormData()
  form.append("file", new Blob([buffer]), "audio.mp3")

  let res = await fetch("https://api.akuari.my.id/tools/shazam?upload=true",{
    method:"POST",
    body:form
  })
  let json = await res.json()

  if(!json.result){
    // fallback 2
    let res2 = await fetch(`https://api.akuari.my.id/tools/whatmusic?file=${encodeURIComponent("temp")}`)
    json = await res2.json()
  }

  let title = json.result?.title || json.result?.track || "Unknown"
  let artist = json.result?.artist || json.result?.artists || ""
  let album = json.result?.album || ""

  let txt = `◈ ${toSmallCaps("shazam found")}

${toSmallCaps("title:")} ${title}
${toSmallCaps("artist:")} ${artist}
${toSmallCaps("album:")} ${album}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})

  // send preview if available
  if(json.result?.preview || json.result?.url){
    await sock.sendMessage(m.chat,{
      audio:{url: json.result.preview || json.result.url},
      mimetype:'audio/mpeg',
      fileName:`${title}.mp3`
    },{quoted:m})
  }

 }catch(e){
  console.log(e)
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("failed to shazam make sure audio is clear")}`},{quoted:m})
 }
}
}
