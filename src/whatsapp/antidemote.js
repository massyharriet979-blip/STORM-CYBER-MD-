import fs from 'fs'
const delay = (ms) => new Promise(r=>setTimeout(r,ms))
export async function handleAntidemote(sock, anu, botId){
 try{
  if(anu.action!=="demote") return
  let botJid=botId+'@s.whatsapp.net';
  let adFile=`./database/antidemote_${botId}.json`;
  if(!fs.existsSync(adFile)) return
  let adDb=JSON.parse(fs.readFileSync(adFile));
  if(!adDb[anu.id]?.enabled) return
  let meta=await sock.groupMetadata(anu.id);
  if(!meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin) return
  for(let jid of anu.participants){
    if(jid!==botJid){
      await delay(1000);
      await sock.groupParticipantsUpdate(anu.id,[jid],"promote").catch(()=>{});
      await sock.sendMessage(anu.id,{text:`ᴀɴᴛɪᴅᴇᴍᴏᴛᴇ ᴀᴄᴛɪᴠᴇ, ᴘʀᴏᴍᴏᴛᴇᴅ ʙᴀᴄᴋ @${jid.split('@')[0]}`, mentions:[jid]}).catch(()=>{});
    }
  }
 }catch{}
}
