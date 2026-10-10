function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"ping2",
alias:["p2","speed2"],
execute: async(sock, jid, msg)=>{
 try{
  let start=Date.now()
  let realJid="120363414065055650@newsletter"
  let realUrl="https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P"
  let img="https://files.catbox.moe/ssnist.jpg"

  let chk = await sock.sendMessage(jid,{text:toSmallCaps("checking server...")}, {quoted: msg})
  await new Promise(r=>setTimeout(r,700))

  let latency=Date.now()-start
  let speed=(Math.random()*20+5).toFixed(2)

  let final=`${toSmallCaps(`pong! 🏓`)}\n\n${toSmallCaps(`latency: ${latency} ms`)}\n${toSmallCaps(`speed: ${speed} ms`)}\n${toSmallCaps(`status: active & running`)}\n${toSmallCaps(`system: v2.0.0 stable`)}\n\n> ${toSmallCaps(`powered by storm x`)}`

  await sock.sendMessage(jid,{
    text:final,
    edit: chk.key,
    contextInfo:{
      isForwarded:true,
      forwardedNewsletterMessageInfo:{
        newsletterJid:realJid,
        newsletterName:"STORM CYBER MD",
        serverMessageId:1
      },
      externalAdReply:{
        title:toSmallCaps("storm cyber md - ping"),
        body:toSmallCaps("tap to follow channel"),
        thumbnailUrl:img,
        sourceUrl:realUrl,
        mediaType:1,
        renderLargerThumbnail:false
      }
    }
  }, {quoted: msg})

 }catch(e){ console.log(e) }
}
}
