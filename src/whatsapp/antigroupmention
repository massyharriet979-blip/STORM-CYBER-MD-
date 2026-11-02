import fs from 'fs'
export async function handleAntigroupmention(sock, remoteJid, sender, body, botIdNum, msg, isGroup){
 try{
  let agmFile = `./database/antigroupmention_${botIdNum}.json`;
  if(!fs.existsSync(agmFile) || !isGroup) return false
  let agmDb = JSON.parse(fs.readFileSync(agmFile));
  if(!agmDb[remoteJid]?.enabled) return false
  let senderNum=sender.split('@')[0]
  if(senderNum===botIdNum) return false
  let lowerBody = body.toLowerCase();
  let mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
  let isGroupMention = lowerBody.includes('https://chat.whatsapp.com') || lowerBody.includes('@g.us') || mentioned.length>=5;
  if(!isGroupMention) return false
  let metaChk = await sock.groupMetadata(remoteJid).catch(()=>null);
  if(!metaChk) return false
  let isSenderAdmin = metaChk.participants.find(p=>p.id===sender)?.admin;
  let botJidChk = sock.user.id.split(':')[0]+'@s.whatsapp.net';
  let isBotAdmin = metaChk.participants.find(p=>p.id===botJidChk || p.id===sock.user.id)?.admin;
  if(isSenderAdmin || !isBotAdmin) return false
  try{ await sock.sendMessage(remoteJid,{delete: msg.key}); }catch{}
  await sock.sendMessage(remoteJid,{text:`╭───「 ᴀɴᴛɪ ɢʀᴏᴜᴘ ᴍᴇɴᴛɪᴏɴ 」───\n│ 🚫 @${senderNum} ɢʀᴏᴜᴘ ᴍᴇɴᴛɪᴏɴ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ\n╰────────────────\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`, mentions:[sender]}).catch(()=>{});
  return true
 }catch{ return false }
}
