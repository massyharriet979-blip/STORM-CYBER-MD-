import fs from 'fs'

function toSmallCaps(text){
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
  return text.toLowerCase().split('').map(c=>map[c]||c).join('')
}
function doReply(ctx){
  try{ if(ctx.message) return { reply_parameters: { message_id: ctx.message.message_id } } }catch{}
  return {}
}
const delay = (ms) => new Promise(r=>setTimeout(r,ms))

function countUsers(){
  try{
    return fs.readdirSync('./sessions').filter(d=>{
      try{
        const file='./sessions/'+d+'/creds.json'
        if(!fs.existsSync(file)) return false
        const creds=JSON.parse(fs.readFileSync(file,'utf8'))
        return creds.registered === true
      }catch{ return false }
    }).length
  }catch{ return 0 }
}

export async function usersCommand(ctx){
  const chk=await ctx.reply(toSmallCaps(`🔎 requesting server information...`), doReply(ctx))
  await delay(700)
  const total=countUsers()
  const connNow=global.subbots?.size||0
  const txt=`👥 ᴜsᴇʀs:\n𝙿𝙰𝙸𝚁𝙴𝙳: ${total}\n𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${connNow}\n𝙳𝙸𝚂𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳: ${Math.max(0,total-connNow)}`
  try{ await ctx.telegram.editMessageText(ctx.chat.id,chk.message_id,null,txt) }catch{ await ctx.reply(txt, doReply(ctx)) }
}
