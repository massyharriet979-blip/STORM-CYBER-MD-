import fs from 'fs'
import { isBugMessage } from '../commands/antibug.js'
// src/whatsapp/antibug.js - moved from index.js

const delay = (ms) => new Promise(r=>setTimeout(r,ms))

export async function handleAntibug(sock, remoteJid, sender, body, botIdNum, msg, dynamicPrefix){
  try{
    let abugFile = `./database/antibug_${botIdNum}.json`;
    if(!fs.existsSync(abugFile)) return false
    if(!remoteJid.endsWith('@g.us')) return false
    if(!body) return false
    if(body.startsWith(dynamicPrefix)) return false

    let abugDb = JSON.parse(fs.readFileSync(abugFile));
    if(!abugDb[remoteJid]?.enabled) return false
    if(!isBugMessage(body)) return false

    let senderNum = sender.split('@')[0]
    if(senderNum === botIdNum) return false

    let metaChk = await sock.groupMetadata(remoteJid).catch(()=>null);
    if(!metaChk) return false
    
    let isSenderAdmin = metaChk.participants.find(p=>p.id===sender)?.admin;
    let botJidChk = sock.user.id.split(':')[0]+'@s.whatsapp.net';
    let isBotAdmin = metaChk.participants.find(p=>p.id===botJidChk || p.id===sock.user.id)?.admin;
    if(isSenderAdmin || !isBotAdmin) return false

    let wlFile=`./database/warnlimit_${botIdNum}.json`;
    let warnsFile=`./database/warns_${botIdNum}.json`;
    let limit=3;
    if(fs.existsSync(wlFile)){ try{ let l=JSON.parse(fs.readFileSync(wlFile)); if(l[remoteJid]?.limit) limit=l[remoteJid].limit; }catch{} }
    let warnsDb={};
    if(fs.existsSync(warnsFile)) try{ warnsDb=JSON.parse(fs.readFileSync(warnsFile)); }catch{}
    if(!warnsDb[remoteJid]) warnsDb[remoteJid]={};
    if(!warnsDb[remoteJid][sender]) warnsDb[remoteJid][sender]={count:0};
    warnsDb[remoteJid][sender].count+=1;
    let count=warnsDb[remoteJid][sender].count;
    fs.mkdirSync('./database',{recursive:true});
    fs.writeFileSync(warnsFile, JSON.stringify(warnsDb,null,2));
    try{ await sock.sendMessage(remoteJid,{delete: msg.key}); }catch{}
    if(count>=limit){
      await sock.sendMessage(remoteJid,{text:`╭───「 ᴀɴᴛɪʙᴜɢ 」───\n│ ⚠️ @${senderNum} ᴄʀᴀsʜ ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ\n│ 🚫 ᴡᴀʀɴ ${count}/${limit} - ᴋɪᴄᴋɪɴɢ\n╰────────────────`, mentions:[sender]});
      await sock.groupParticipantsUpdate(remoteJid,[sender],"remove").catch(()=>{});
      delete warnsDb[remoteJid][sender];
      fs.writeFileSync(warnsFile, JSON.stringify(warnsDb,null,2));
    } else {
      await sock.sendMessage(remoteJid,{text:`╭───「 ᴀɴᴛɪʙᴜɢ 」───\n│ ⚠️ @${senderNum} ᴄʀᴀsʜ ᴍᴇssᴀɢᴇ ᴅᴇʟᴇᴛᴇᴅ\n│ ᴡᴀʀɴ ${count}/${limit}\n╰────────────────`, mentions:[sender]});
    }
    return true
  }catch(e){
    console.log('antibug error', e.message)
    return false
  }
}
