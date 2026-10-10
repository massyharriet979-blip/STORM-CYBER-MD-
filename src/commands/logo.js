import { createRequire } from "module"
const require = createRequire(import.meta.url)

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"logo",
alias:["ʟᴏɢᴏ","logomaker"],
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
      text:`◈ ʟᴏɢᴏ x3 [ǫᴜᴀɴᴛᴜᴍ]\n\n${toSmallCaps("usage")}:.logo Storm\n${toSmallCaps("creates 3 logos on your background")}\n\n> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
    },{quoted:m})
  }

  let text = args.join(" ").slice(0,20)
  let bgUrl = "https://files.catbox.moe/pznw3z.jpg"

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("generating 3 logos for")} ${text}...`},{quoted:m})

  // 3 style APIs with your bg as watermark/caption
  const styles = ["glitch","neon-light","3d-metal"]

  for(let i=0;i<3;i++){
    try{
      let api = `https://api.akuari.my.id/other/textpro?text=${encodeURIComponent(text)}&style=${styles[i]}`
      let res = await fetch(api)
      let json = await res.json()
      let logoImg = json.result || json.image || json.url || bgUrl

      // send with your bg as main if you want pure bg logo, comment the above and use this:
      // let finalImg = bgUrl

      await sock.sendMessage(m.chat,{
        image:{url: logoImg},
        caption:`◈ ʟᴏɢᴏ ${i+1}/3: ${text}\n${toSmallCaps("style")}: ${styles[i]}\n${toSmallCaps("bg")}: custom\n\n> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
      },{quoted:m})

      // also send your original background with text caption
      await sock.sendMessage(m.chat,{
        image:{url: bgUrl},
        caption:`◈ ${text} [${styles[i]}]\n> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`
      },{quoted:m})

    }catch(e){console.log(e)}
  }

 }catch(e){console.log(e)}
}
}
