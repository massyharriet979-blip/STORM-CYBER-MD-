const fs=require('fs')
const os=require('os')

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ',0:'0',1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

module.exports={
name:"info",
aliases:["botinfo","information","about"],
execute: async(sock,m,args)=>{
 try{
  // react emoji
  try{ await sock.sendMessage(m.chat,{react:{text:"🤖", key:m.key}}) }catch{}

  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sec=Math.floor(process.uptime())
  let h=Math.floor(sec/3600)
  let mm=Math.floor((sec%3600)/60)
  let s=sec%60
  let uptime=`${h}h ${mm}m ${s}s`

  let mode="public"
  try{
    let f=`./database/mode_${botId}.json`
    if(fs.existsSync(f)){
      let j=JSON.parse(fs.readFileSync(f))
      if(j.mode) mode=j.mode
    }
  }catch{}

  let total=0
  try{ total=fs.readdirSync('./sessions').length }catch{ total=1 }

  let platform=os.platform()
  let mem=`${(os.totalmem()/1024/1024/1024).toFixed(1)}GB`
  let push=m.pushName||"User"

  let text=`${toSmallCaps(`storm cyber md v2.0.0`)}

${toSmallCaps(`hey @${push}`)}
${toSmallCaps(`bot is alive and powerful`)}

╭─❍ ${toSmallCaps(`bot information`)} ❍─
│ ${toSmallCaps(`owner: storm x`)}
│ ${toSmallCaps(`creator: ghost ai`)}
│ ${toSmallCaps(`version: v2.0.0 stable`)}
│ ${toSmallCaps(`mode: ${mode}`)}
│ ${toSmallCaps(`uptime: ${uptime}`)}
│ ${toSmallCaps(`platform: ${platform}`)}
│ ${toSmallCaps(`memory: ${mem}`)}
│ ${toSmallCaps(`users: ${total} paired`)}
│ ${toSmallCaps(`prefix:.`)}
│ ${toSmallCaps(`jid: ${botId}`)}
╰───────────────❍

╭─❍ ${toSmallCaps(`system status`)} ❍─
│ ${toSmallCaps(`active: yes ✅`)}
│ ${toSmallCaps(`speed: super fast ⚡`)}
│ ${toSmallCaps(`antidelete: enabled ♻️`)}
│ ${toSmallCaps(`autotyping: ready ⌨️`)}
│ ${toSmallCaps(`pair: stable 🔗`)}
╰───────────────❍

> ${toSmallCaps(`powered by storm x - the legend`)}`

  let img="https://files.catbox.moe/ssnist.jpg"
  let jid="120363414065055650@newsletter"
  let channelUrl="https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P"

  await sock.sendMessage(m.chat,{
    image:{url:img},
    caption:text,
    mentions:[m.sender],
    contextInfo:{
      isForwarded:true,
      forwardedNewsletterMessageInfo:{
        newsletterJid:jid,
        newsletterName:"STORM CYBER MD",
        serverMessageId:1
      },
      externalAdReply:{
        title:toSmallCaps("storm cyber md - info"),
        body:toSmallCaps("bot information & status"),
        thumbnailUrl:img,
        sourceUrl:channelUrl,
        mediaType:1,
        renderLargerThumbnail:true
      }
    }
  },{quoted:m})

  try{ await sock.sendMessage(m.chat,{react:{text:"✅", key:m.key}}) }catch{}

 }catch(e){ console.log(e) }
}
}
