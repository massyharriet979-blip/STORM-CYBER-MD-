import fs from 'fs'
const delay = (ms) => new Promise(r=>setTimeout(r,ms))
export async function handleAntipromote(sock, anu, botId){
 try{
  if(anu.action!=="promote") return
  let botJid=botId+'@s.whatsapp.net';
  let apFile=`./database/antipromote_${botId}.json`;
  if(!fs.existsSync(apFile)) return
  let apDb=JSON.parse(fs.readFileSync(apFile));
  if(!apDb[anu.id]?.enabled) return
  let meta=await sock.groupMetadata(anu.id);
  if(!meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin) return
  for(let jid of anu.participants){
    if(jid!==botJid){
      await delay(1000);
      await sock.groupParticipantsUpdate(anu.id,[jid],"demote").catch(()=>{});
      await sock.sendMessage(anu.id,{text:`ᴀɴᴛɪᴘʀᴏᴍᴏᴛᴇ ᴀᴄᴛɪᴠᴇ, ᴅᴇᴍᴏᴛᴇᴅ @${jid.split('@')[0]}`, mentions:[jid]}).catch(()=>{});
    }
  }
 }catch{}
}
