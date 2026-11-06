function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"ephoto",
alias:["ᴇᴘʜᴏᴛᴏ","ephoto360","photoeffect"],
execute: async(sock, m, args)=>{
 try{
  // QUANTUM CLEARANCE REQUIRED, OWNER ONLY
  if(!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{
      text:`◈ ${toSmallCaps("quantum clearance required")}\n${toSmallCaps("owner only command")}`
    },{quoted:m})
  }

  if(!args[0]){
    return sock.sendMessage(m.chat,{
      text:`◈ ᴇᴘʜᴏᴛᴏ [ǫᴜᴀɴᴛᴜᴍ]

${toSmallCaps("usage")}:
.ephoto <style> <text>

${toSmallCaps("styles")}:
glitch, 3d, neon, blackpink, graffiti, thunder, gold, matrix, fire, ice, water, wolf, bear, avengers, joker, marvel, blood, horror, galaxy

${toSmallCaps("example")}:
.ephoto glitch Storm
.ephoto gold STORM CYBER
.ephoto neon Hello

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
    },{quoted:m})
  }

  let style = args[0].toLowerCase()
  let text = args.slice(1).join(" ")

  if(!text){
    text = style
    style = "glitch"
  }

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("generating ephoto")} ${style} ${toSmallCaps("for")} ${text}...`},{quoted:m})

  let api = `https://api.akuari.my.id/other/ephoto?text=${encodeURIComponent(text)}&style=${style}`

  let res = await fetch(api)
  let json = await res.json()
  let img = json.result || json.image || json.url

  // fallback to textpro if ephoto fails
  if(!img){
    let api2 = `https://api.akuari.my.id/other/textpro?text=${encodeURIComponent(text)}&style=${style}`
    let r2 = await fetch(api2)
    let j2 = await r2.json()
    img = j2.result || j2.image
  }

  if(!img) img = "https://files.catbox.moe/pznw3z.jpg"

  await sock.sendMessage(m.chat,{
    image:{url: img},
    caption:`◈ ᴇᴘʜᴏᴛᴏ [ǫᴜᴀɴᴛᴜᴍ]

${toSmallCaps("text")}: ${text}
${toSmallCaps("style")}: ${style}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
