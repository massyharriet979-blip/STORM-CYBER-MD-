import fs from 'fs'
const delay = (ms) => new Promise(r=>setTimeout(r,ms))
export async function handleAutokick(sock, anu, botId){
 try{
  let botJid=botId+'@s.whatsapp.net';
  let akFile=`./database/autokickbot_${botId}.json`;
  if(!fs.existsSync(akFile)) return
  let akDb=JSON.parse(fs.readFileSync(akFile));
  if(!akDb[anu.id]?.enabled || anu.action!=="add") return
  let meta=await sock.groupMetadata(anu.id);
  if(!meta.participants.find(p=>p.id===botJid || p.id===sock.user.id)?.admin) return
  for(let jid of anu.participants){
    let isBot=global.subbots.has(jid.split('@')[0]) || jid.toLowerCase().includes('bot');
    if(isBot && jid!==botJid){
      await delay(2000);
      await sock.groupParticipantsUpdate(anu.id,[jid],"remove").catch(()=>{});
      await sock.sendMessage(anu.id,{text:`╭───「 ᴀᴜᴛᴏ ᴋɪᴄᴋ 」───\n│ 🤖 @${jid.split('@')[0]} ᴀᴜᴛᴏ ᴋɪᴄᴋᴇᴅ\n╰────────────────`, mentions:[jid]}).catch(()=>{});
    }
  }
 }catch{}
}
