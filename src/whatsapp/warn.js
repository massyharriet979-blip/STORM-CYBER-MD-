import fs from 'fs'
export async function handleWarnReminder(sock, remoteJid, sender, body, botIdNum, msg, dynamicPrefix, isGroup){
 try{
  if(!isGroup || !body || body.startsWith(dynamicPrefix)) return false
  let warnsFile=`./database/warns_${botIdNum}.json`;
  if(!fs.existsSync(warnsFile)) return false
  let wDb=JSON.parse(fs.readFileSync(warnsFile));
  let uWarn=wDb[remoteJid]?.[sender];
  let senderNum=sender.split('@')[0]
  if(!uWarn || uWarn.count<=0 || senderNum===botIdNum) return false
  let wlFile=`./database/warnlimit_${botIdNum}.json`;
  let limit=3;
  if(fs.existsSync(wlFile)){ try{ let l=JSON.parse(fs.readFileSync(wlFile)); if(l[remoteJid]?.limit) limit=l[remoteJid].limit; }catch{} }
  let lastMarkFile=`./database/lastmark_${botIdNum}.json`;
  let lastDb={};
  if(fs.existsSync(lastMarkFile)) try{ lastDb=JSON.parse(fs.readFileSync(lastMarkFile)); }catch{}
  let key=`${remoteJid}_${sender}`;
  let now=Date.now();
  if(!lastDb[key] || now-lastDb[key]>30000){
    lastDb[key]=now;
    fs.mkdirSync('./database',{recursive:true});
    fs.writeFileSync(lastMarkFile, JSON.stringify(lastDb,null,2));
    await sock.sendMessage(remoteJid,{text:`@${senderNum} ⚠️ ᴡᴀʀɴᴇᴅ [${uWarn.count}/${limit}]`, mentions:[sender]}, {quoted: msg}).catch(()=>{});
  }
 }catch{}
 return false
}
