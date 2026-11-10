function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"wallpaper",
alias:["wp","wallp","ᴡᴀʟʟᴘᴀᴘᴇʀ"],
execute: async(sock, m, args)=>{
 try{
  let query = args.join(" ") || "anime dark cyber"

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("searching wallpaper for")} ${query}...`},{quoted:m})

  // using unsplash source - no api key needed
  let url = `https://source.unsplash.com/1080x1920/?${encodeURIComponent(query)}&t=${Date.now()}`

  await sock.sendMessage(m.chat,{
   image:{url:url},
   caption:`◈ ${toSmallCaps("wallpaper")}: ${query}\n> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
  },{quoted:m})

 }catch(e){
  console.log(e)
  await sock.sendMessage(m.chat,{text:`${toSmallCaps("failed to fetch wallpaper try again")}`},{quoted:m})
 }
}
}
