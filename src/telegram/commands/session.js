import fs from 'fs'

function loadTgSessions(){
  try{
    if(!fs.existsSync('./database/telegram_sessions.json')) return {}
    return JSON.parse(fs.readFileSync('./database/telegram_sessions.json','utf8'))
  }catch{ return {} }
}
function fmtTime(ts){
  if(!ts) return 'unknown'
  let d=new Date(ts)
  return d.toLocaleString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
}
function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return text.toLowerCase().split('').map(c=>map[c]||c).join('')
}
function doReply(ctx){
  try{ if(ctx.message) return { reply_parameters: { message_id: ctx.message.message_id } } }catch{}
  return {}
}
async function getBotPhoto(ctx){
  try{
    const me=await ctx.telegram.getMe()
    const p=await ctx.telegram.getUserProfilePhotos(me.id)
    if(p.total_count>0) return p.photos[0][0].file_id
  }catch{}
  return null
}

export async function sessionCommand(ctx){
  let db=loadTgSessions()
  let myNums=db[String(ctx.from.id)]||[]

  // also scan server folders to recover if json lost
  let serverSessions=[]
  try{
    serverSessions=fs.readdirSync('./sessions').filter(d=>{
      try{
        const file='./sessions/'+d+'/creds.json'
        if(!fs.existsSync(file)) return false
        const creds=JSON.parse(fs.readFileSync(file,'utf8'))
        return creds.registered===true
      }catch{ return false }
    })
  }catch{}

  // merge: if json empty but server has folders, use server as fallback for this user
  // we show only numbers that belong to user if possible, otherwise show all he paired before
  let effectiveNums = myNums.length>0 ? myNums : []
  if(myNums.length===0 && serverSessions.length>0){
    // if json lost, we cannot know owner, so show count but tell to re-pair? 
    // For now show 0 like before, but we will check server
    effectiveNums = []
  }

  let photo=await getBotPhoto(ctx)

  // if no numbers in json AND no server folders for anyone, no session
  if(effectiveNums.length===0){
    // check if there is any folder that matches nothing? we still say no session
    let txt0=toSmallCaps(`you dont have any active session in the server, use the pair button bellow to get connected ❌`)
    if(photo) await ctx.replyWithPhoto(photo,{caption:txt0,...doReply(ctx)})
    else await ctx.reply(txt0, doReply(ctx))
    return
  }

  let onlineNums=effectiveNums.filter(n=>global.subbots.has(n))
  let pairedCount=effectiveNums.length

  if(onlineNums.length>0){
    let meta=global.sessionMeta?.get(onlineNums[0])||{}
    let txt=toSmallCaps(`you have a running and active session in the server right now ✅️\n\nrun time: ${fmtTime(meta.pairedAt||meta.connectedAt)}\npaired: ${pairedCount}\nstatus: online 🟢`)
    if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...doReply(ctx)})
    else await ctx.reply(txt, doReply(ctx))
  }else{
    let meta=global.sessionMeta?.get(effectiveNums[0])||{}
    let txt=toSmallCaps(`you paired your number but its temporarily saved on the server\n\ndisconnected when: ${fmtTime(meta.disconnectedAt)}\npaired: ${pairedCount}\nstatus: stopped / offline 🔴`)
    if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...doReply(ctx)})
    else await ctx.reply(txt, doReply(ctx))
  }
}
