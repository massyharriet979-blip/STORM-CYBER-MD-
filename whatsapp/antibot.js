import fs from 'fs'
export async function handleAntibot(sock, remoteJid, sender, body, botIdNum){
 try{
  let abFile = `./database/antibot_${botIdNum}.json`;
  let wlFile = `./database/warnlimit_${botIdNum}.json`;
  let warnsFile = `./database/warns_${botIdNum}.json`;
  if(!fs.existsSync(abFile)) return false
  let abDb = JSON.parse(fs.readFileSync(abFile));
  if(!abDb[remoteJid]?.enabled) return false
  let senderNum=sender.split('@')[0]
  if(senderNum===botIdNum) return false
  let isOtherBot = false;
  if(global.subbots.has(senderNum)) isOtherBot=true;
  if((body.startsWith('.') || body.startsWith('/') || body.startsWith('!')) && senderNum!==botIdNum) isOtherBot=true;
  if(!isOtherBot) return false
  let limit = 3;
  if(fs.existsSync(wlFile)){ try{ let l=JSON.parse(fs.readFileSync(wlFile)); if(l[remoteJid]?.limit) limit=l[remoteJid].limit; }catch{} }
  let warnsDb = {};
  if(fs.existsSync(warnsFile)) try{ warnsDb=JSON.parse(fs.readFileSync(warnsFile)); }catch{}
  if(!warnsDb[remoteJid]) warnsDb[remoteJid]={};
  if(!warnsDb[remoteJid][sender]) warnsDb[remoteJid][sender]={count:0};
  warnsDb[remoteJid][sender].count+=1;
  let count=warnsDb[remoteJid][sender].count;
  fs.mkdirSync('./database',{recursive:true});
  fs.writeFileSync(warnsFile, JSON.stringify(warnsDb,null,2));
  if(count>=limit){
    await sock.sendMessage(remoteJid,{text:`╭───「 ᴀɴᴛɪʙᴏᴛ 」───\n│ ⚠️ @${senderNum} ᴀɴᴛɪʙᴏᴛ ᴡᴀʀɴ ${count}/${limit}\n│ 🚫 limit reached, kicking\n╰────────────────`, mentions:[sender]});
    await sock.groupParticipantsUpdate(remoteJid,[sender],"remove").catch(()=>{});
    delete warnsDb[remoteJid][sender];
    fs.writeFileSync(warnsFile, JSON.stringify(warnsDb,null,2));
  }else{
    await sock.sendMessage(remoteJid,{text:`╭───「 ᴀɴᴛɪʙᴏᴛ 」───\n│ 🤖 @${senderNum} other bot detected\n│ ⚠️ ᴡᴀʀɴ ${count}/${limit}\n╰────────────────`, mentions:[sender]});
  }
  return false
 }catch{ return false }
}
