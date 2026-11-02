// src/whatsapp/antilink.js - Antilink logic separated from index.js
import fs from 'fs'

const delay = (ms) => new Promise(r=>setTimeout(r,ms))

export async function handleAntilink(sock, remoteJid, sender, body, botIdNum, msg){
  try{
    let alFile=`./database/antilink_${botIdNum}.json`;
    if(!fs.existsSync(alFile)) return false
    if(!remoteJid.endsWith('@g.us')) return false

    let alDb=JSON.parse(fs.readFileSync(alFile));
    let cfg=alDb[remoteJid];
    if(!cfg?.enabled) return false

    let senderNum=sender.split('@')[0]
    let isLink = /(https?:\/\/|www\.|chat\.whatsapp\.com|t\.me|wa\.me|telegram\.me|discord\.gg|instagram\.com|facebook\.com|tiktok\.com)/i.test(body);
    if(!isLink) return false
    if(senderNum===botIdNum) return false

    let metaChk=await sock.groupMetadata(remoteJid).catch(()=>null);
    if(!metaChk) return false
    let isSenderAdmin=metaChk.participants.find(p=>p.id===sender)?.admin;
    let botJidChk=sock.user.id.split(':')[0]+'@s.whatsapp.net';
    let isBotAdmin=metaChk.participants.find(p=>p.id===botJidChk || p.id===sock.user.id)?.admin;
    if(isSenderAdmin || !isBotAdmin) return false

    let mode=cfg.mode||"warn";

    if(mode==="delete"){
      try{ await sock.sendMessage(remoteJid,{delete: msg.key}); }catch{}
      await sock.sendMessage(remoteJid,{text:`@${senderNum} ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛᴇ ᴀʟʟᴏᴡᴇᴅ ʜᴇʀᴇ.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[sender]}).catch(()=>{});
      return true
    }
    if(mode==="kick"){
      try{ await sock.sendMessage(remoteJid,{delete: msg.key}); }catch{}
      await sock.sendMessage(remoteJid,{text:`ʟɪɴᴋ ᴅᴇᴛᴇᴄᴛᴇᴅ\n\n@${senderNum} sᴇɴᴛ ᴀ ʟɪɴᴋ ᴀɴᴅ ᴡᴀs ʀᴇᴍᴏᴠᴇᴅ ɪɴ ${metaChk.subject} ɢʀᴏᴜᴘ.\nsᴛᴀᴛᴜs: ᴋɪᴄᴋᴇᴅ ᴏᴜᴛ.\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[sender]});
      await sock.groupParticipantsUpdate(remoteJid,[sender],"remove").catch(()=>{});
      return true
    }
    if(mode==="mute"){
      try{ await sock.sendMessage(remoteJid,{delete: msg.key}); }catch{}
      await sock.groupSettingUpdate(remoteJid,'announcement').catch(()=>{});
      await sock.sendMessage(remoteJid,{text:`ʟɪɴᴋ ᴅᴇʟᴇᴛᴇᴅ\n\nɢʀᴏᴜᴘ ᴡɪʟʟ ʙᴇ ᴜɴᴍᴜᴛᴇᴅ ᴀғᴛᴇʀ 1 ᴍɪɴᴜᴛᴇ.\n@${senderNum} sᴛᴏᴘ sᴇɴᴅɪɴɢ ʟɪɴᴋs.\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[sender]});
      global.saveAutoMuteSchedule(botIdNum, remoteJid, "unmute", 60000);
      global.scheduleAutoAction(sock, botIdNum, remoteJid, "unmute", Date.now()+60000);
      return true
    }
    if(mode==="warn"){
      let wlFile=`./database/warnlimit_${botIdNum}.json`;
      let warnsFile=`./database/warns_${botIdNum}.json`;
      let limit=3;
      if(fs.existsSync(wlFile)){
        try{ let l=JSON.parse(fs.readFileSync(wlFile)); if(l[remoteJid]?.limit) limit=l[remoteJid].limit; }catch{}
      }
      let warnsDb={};
      if(fs.existsSync(warnsFile)) try{ warnsDb=JSON.parse(fs.readFileSync(warnsFile)); }catch{}
      if(!warnsDb[remoteJid]) warnsDb[remoteJid]={};
      if(!warnsDb[remoteJid][sender]) warnsDb[remoteJid][sender]={count:0};
      warnsDb[remoteJid][sender].count+=1;
      let count=warnsDb[remoteJid][sender].count;
      fs.mkdirSync('./database',{recursive:true});
      fs.writeFileSync(warnsFile, JSON.stringify(warnsDb,null,2));
      try{ await sock.sendMessage(remoteJid,{delete: msg.key}); }catch{}
      if(count < limit){
        let warnTxt=count===1 ? `@${senderNum} ʟɪɴᴋs ᴀʀᴇ ɴᴏᴛ ᴀʟʟᴏᴡᴇᴅ ʜᴇʀᴇ 🚫. ʏᴏᴜ ᴍᴜsᴛ ᴛᴀᴋᴇ ᴛʜɪs ᴡᴀʀɴ sᴇʀɪᴏᴜs. ${count}/${limit}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x` : `@${senderNum} ʟɪɴᴋs ᴀʀᴇ ғᴏʀʙɪᴅᴅᴇɴ 🚫. ɪ ᴅᴏɴᴛ ᴋɴᴏᴡ ᴡʜᴇʀᴇ ʏᴏᴜ ʟɪsᴛᴇɴ. ${count}/${limit}\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`;
        await sock.sendMessage(remoteJid,{text:warnTxt, mentions:[sender]});
      }else{
        await sock.sendMessage(remoteJid,{text:`@${senderNum} ᴡᴀs ᴋɪᴄᴋᴇᴅ ғᴏʀ sᴇɴᴅɪɴɢ ʟɪɴᴋs.\nsᴛᴀᴛᴜs: ᴋɪᴄᴋɪɴɢ...\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[sender]});
        await delay(1500);
        await sock.groupParticipantsUpdate(remoteJid,[sender],"remove").catch(()=>{});
        delete warnsDb[remoteJid][sender];
        fs.writeFileSync(warnsFile, JSON.stringify(warnsDb,null,2));
        await delay(1000);
        await sock.sendMessage(remoteJid,{text:`@${senderNum} ᴡᴀs sᴜᴄᴄᴇssғᴜʟʟʏ ᴋɪᴄᴋᴇᴅ ᴏᴜᴛ.\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`, mentions:[sender]}).catch(()=>{});
      }
      return true
    }
  }catch(e){
    console.log('antilink error', e.message)
    return false
  }
  return false
}
