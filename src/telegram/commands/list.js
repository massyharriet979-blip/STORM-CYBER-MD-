import fs from 'fs'

function loadTgSessions(){
  try{
    if(!fs.existsSync('./database/telegram_sessions.json')) return {}
    return JSON.parse(fs.readFileSync('./database/telegram_sessions.json','utf8'))
  }catch{ return {} }
}
function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return text.toLowerCase().split('').map(c=>map[c]||c).join('')
}
function doReply(ctx){
  try{ if(ctx.message) return { reply_parameters: { message_id: ctx.message.message_id } } }catch{}
  return {}
}
const delay = (ms) => new Promise(r=>setTimeout(r,ms))

function getServerSessions(){
  try{
    return fs.readdirSync('./sessions').filter(d=>{
      try{
        const file='./sessions/'+d+'/creds.json'
        if(!fs.existsSync(file)) return false
        const creds=JSON.parse(fs.readFileSync(file,'utf8'))
        return creds.registered === true
      }catch{ return false }
    })
  }catch{ return [] }
}

export async function listCommand(ctx){
  if(ctx.chat.type!=='private'){
    try{
      const mem=await ctx.telegram.getChatMember(ctx.chat.id, ctx.from.id)
      if(!['administrator','creator'].includes(mem.status)){
        return ctx.reply(toSmallCaps('only admins can use list command in group'), doReply(ctx))
      }
    }catch{
      return ctx.reply(toSmallCaps('only admins can use list command in group'), doReply(ctx))
    }
  }

  const chk=await ctx.reply(toSmallCaps(`🔎 requesting server information...`), doReply(ctx))
  await delay(800)

  try{
    let dirs=getServerSessions()

    // In private, show only user's own sessions from SERVER, not just json
    if(ctx.chat.type==='private'){
      let myDb=loadTgSessions()
      let myNums=myDb[String(ctx.from.id)]||[]
      if(myNums.length>0){
        dirs=dirs.filter(d=>myNums.includes(d))
      }
      // if json lost but server has sessions, we still show 0 for private to avoid leaking others - users command shows total
    }

    const total=dirs.length
    const connNow=dirs.filter(n=>global.subbots?.has(n)).length
    let listText=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connNow}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connNow)}\n\n`
    if(dirs.length>0){
      listText+=`📋 ${toSmallCaps('connected numbers list:')}\n`
      dirs.forEach((n,i)=>{
        let status=global.subbots?.has(n)?'🟢 online':'🔴 offline'
        listText+=`${i+1}. ${n} - ${status}\n`
      })
    }else{
      listText+=toSmallCaps('⚠️ no sessions found')
    }
    listText+=`\n\n𝚂𝙴𝚁𝚅𝙴𝚁(𝚂) 𝚁𝙴𝙰𝙳𝚈`
    await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,listText)
  }catch(e){
    console.log('LIST ERROR:',e.message)
    let dirs=getServerSessions()
    const total=dirs.length
    const connNow=global.subbots?.size||0
    const txt=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connNow}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connNow)}\n\n𝚂𝙴𝚁𝚅𝙴𝚁(𝚂) 𝚁𝙴𝙰𝙳𝚈`
    try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,txt) }catch{ await ctx.reply(txt, doReply(ctx)) }
  }
}
