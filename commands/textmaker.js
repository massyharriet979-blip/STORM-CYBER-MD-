function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"textmaker",
alias:["ᴛᴇxᴛᴍᴀᴋᴇʀ","textpro","maker"],
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
      text:`◈ ᴛᴇxᴛᴍᴀᴋᴇʀ [ǫᴜᴀɴᴛᴜᴍ]

${toSmallCaps("usage")}:
.textmaker <style> <text>

${toSmallCaps("styles")}:
- glitch, neon, 3d, blackpink, thunder, magma, gold, water, fire, harrypotter, avengers, joker, bear, wolf, neonlight

${toSmallCaps("example")}:
.textmaker neon Storm
.textmaker gold STORM CYBER
.textmaker glitch Hello

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
    },{quoted:m})
  }

  let style = args[0].toLowerCase()
  let text = args.slice(1).join(" ")

  if(!text){
    text = style
    style = "glitch"
  }

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("making")} ${style} ${toSmallCaps("for")} ${text}...`},{quoted:m})

  let api = `https://api.akuari.my.id/other/textpro?text=${encodeURIComponent(text)}&style=${style}`

  let res = await fetch(api)
  let json = await res.json()
  let img = json.result || json.image || json.url

  if(!img){
    // fallback to ephoto360 style
    let fallback = `https://api.akuari.my.id/other/ephoto?text=${encodeURIComponent(text)}&style=${style}`
    try{
      let r2 = await fetch(fallback)
      let j2 = await r2.json()
      img = j2.result || j2.image
    }catch{}
  }

  if(!img) img = "https://files.catbox.moe/pznw3z.jpg"

  await sock.sendMessage(m.chat,{
    image:{url: img},
    caption:`◈ ᴛᴇxᴛᴍᴀᴋᴇʀ [ǫᴜᴀɴᴛᴜᴍ]

${toSmallCaps("text")}: ${text}
${toSmallCaps("style")}: ${style}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
  },{quoted:m})

 }catch(e){console.log(e)}
}
}
