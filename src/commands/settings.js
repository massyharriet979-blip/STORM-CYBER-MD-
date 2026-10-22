import os from "os"

function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"settings",
alias:["botsettings","config"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner && !m.isSubBotOwner){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 🔐 〙══⊷❍\n┃ ${toSmallCaps("quantum clearance required")}\n┃ ${toSmallCaps("owner only")}\n╰═══════════════════⊷❍\n> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  let pushuser = m.pushName || "USER"
  let mode = "public"
  if(process.env.MODE) mode = process.env.MODE.toLowerCase()
  if(global.botMode) mode = global.botMode
  if(m.chat.endsWith("@s.whatsapp.net")) mode = "self"
  let ramUsed = (process.memoryUsage().heapUsed/1024/1024).toFixed(0)
  let prefix = m.prefix || global.prefix || "."
  let up = Math.floor(process.uptime())
  let d = Math.floor(up/86400), h = Math.floor(up%86400/3600), min = Math.floor(up%3600/60), s = up%60
  let now = new Date()
  let dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`
  let day = now.toLocaleDateString('en-US',{weekday:'long'}).toLowerCase()

  // Get real bot settings if stored
  let st = global.botSettings || {}
  let onOff = (v) => v ? "ᴏɴ ✅" : "ᴏғғ ❌"

  let txt = `╭══〘 sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ〙 ══⊷❍
┃✯╭──────────────
┃✯│ ᴏᴡɴᴇʀ : \`sᴛᴏʀᴍ 𝐗\`
┃✯│ ᴜsᴇʀ : ${pushuser}
┃✯│ ᴍᴏᴅᴇ : ${mode}
┃✯│ sᴇʀᴠᴇʀ : sᴛᴏʀᴍ ᴄʟᴏᴜᴅ
┃✯│ ʀᴀᴍ : ${ramUsed} ᴍʙ ᴏғ 36 ɢʙ
┃✯│ ᴄᴏᴍᴍᴀɴᴅs: \`370\`
┃✯│ ᴠᴇʀsɪᴏɴ : ᴠ2.0.0 sᴛᴀʙʟᴇ
┃✯│ ᴄʀᴇᴀᴛᴏʀ: \`ɢʜᴏsᴛ ᴀɪ\`
┃✯│ ᴘʀᴏᴊᴇᴄᴛ: ᴄʏʙᴇʀ sᴇᴄᴜʀɪᴛʏ ʙᴏᴛ
┃✯│ ᴅᴀᴛᴇ : ${dateStr}
┃✯│ ᴜᴘᴛɪᴍᴇ : ${d}d ${h}h ${min}m ${s}s
┃✯│ sᴛᴀᴛᴜs : ᴏɴʟɪɴᴇ
┃✯│ ᴘʀᴇғɪx : ${prefix}
┃✯│ ᴅᴀʏ : ${day}
┃✯╰───────────────
╰═══════════════════⊷❍

╭════〘 \`𝙶𝙴𝙽𝙴𝚁𝙰𝙻 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂\` 〙════⊷❍
┃✯│ ᴘʀᴇғɪx : ${prefix}
┃✯│ ᴍᴏᴅᴇ : ${mode}
┃✯│ ᴘʟᴀᴛғᴏʀᴍ : ᴡʜᴀᴛsᴀᴘᴘ
┃✯│ ʟᴀɴɢᴜᴀɢᴇ : ${st.language || "en"}
┃✯│ ᴏᴡɴᴇʀ ɴᴜᴍʙᴇʀ : ${st.ownerNumber || "sᴛᴏʀᴍ 𝐗"}
┃✯│ ʙᴏᴛ ɴᴀᴍᴇ : sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ
┃✯╰─────────────────❍
╰══════════════════⊷❍

╭════〘 \`𝙰𝚄𝚃𝙾 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂\` 〙════⊷❍
┃✯│ ᴀᴜᴛᴏᴛʏᴘɪɴɢ : ${onOff(st.autotyping)}
┃✯│ ᴀᴜᴛᴏʀᴇᴘʟʏ : ${onOff(st.autoreply)}
┃✯│ ᴀᴜᴛᴏʟɪᴋᴇ : ${onOff(st.autolike)}
┃✯│ ᴀᴜᴛᴏʀᴇᴀᴄᴛ : ${onOff(st.autoreact)}
┃✯│ ᴀᴜᴛᴏsᴛᴀᴛᴜs : ${onOff(st.autostatus)}
┃✯│ ᴀᴜᴛᴏsᴛᴀᴛᴜs sᴀᴠᴇʀ : ${onOff(st.statussaver)}
┃✯│ ᴀᴜᴛᴏᴋɪᴄᴋʙᴏᴛ : ${onOff(st.autokickbot)}
┃✯│ ᴀᴜᴛᴏᴀᴘᴘʀᴏᴠᴇ : ${onOff(st.autoapprove)}
┃✯│ ᴀᴜᴛᴏᴍᴜᴛᴇ : ${onOff(st.automute)}
┃✯│ ᴀᴜᴛᴏᴜɴᴍᴜᴛᴇ : ${onOff(st.autounmute)}
┃✯╰─────────────────❍
╰══════════════════⊷❍

╭════〘 \`𝙶𝚁𝙾𝚄𝙿 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂\` 〙════⊷❍
┃✯│ ᴀɴᴛɪʟɪɴᴋ : ${onOff(st.antilink)}
┃✯│ ᴀɴᴛɪʙᴏᴛ : ${onOff(st.antibot)}
┃✯│ ᴀɴᴛɪsᴘᴀᴍ : ${onOff(st.antispam)}
┃✯│ ᴀɴᴛɪᴡᴏʀᴅ : ${onOff(st.antiword)}
┃✯│ ᴀɴᴛɪᴅᴇʟᴇᴛᴇ : ${onOff(st.antidelete)}
┃✯│ ᴀɴᴛɪᴅᴇᴍᴏᴛᴇ : ${onOff(st.antidemote)}
┃✯│ ᴀɴᴛɪᴘʀᴏᴍᴏᴛᴇ : ${onOff(st.antipromote)}
┃✯│ ᴀɴᴛɪᴄᴀʟʟ : ${onOff(st.anticall)}
┃✯│ ᴡᴇʟᴄᴏᴍᴇ : ${onOff(st.welcome)}
┃✯│ ɢᴏᴏᴅʙʏᴇ : ${onOff(st.goodbye)}
┃✯│ ᴡᴀʀɴʟɪᴍɪᴛ : ${st.warnlimit || 3}
┃✯╰─────────────────❍
╰══════════════════⊷❍

╭════〘 \`𝙿𝚁𝙸𝚅𝙰𝙲𝚈 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂\` 〙════⊷❍
┃✯│ ɢʜᴏsᴛᴍᴏᴅᴇ : ${onOff(st.ghostmode)}
┃✯│ ɪɴᴠɪsɪʙʟᴇ : ${onOff(st.invisible)}
┃✯│ ᴏɴʟɪɴᴇᴏғғ : ${onOff(st.onlineoff)}
┃✯│ ᴄᴀʟʟʙʟᴏᴄᴋ : ${onOff(st.callblock)}
┃✯│ ᴘᴍʏʟᴏᴄᴋ : ${onOff(st.pmylock)}
┃✯╰─────────────────❍
╰══════════════════⊷❍

╭════〘 \`𝙾𝚃𝙷𝙴𝚁 𝚂𝙴𝚃𝚃𝙸𝙽𝙶𝚂\` 〙════⊷❍
┃✯│ sᴇᴛɪɴғᴏ : ${st.botinfo || "not set"}
┃✯│ sᴇᴛɴᴀᴍᴇ : ${st.botname || "sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ"}
┃✯│ sᴇᴛᴏᴡɴᴇʀ : sᴛᴏʀᴍ 𝐗
┃✯│ sᴇᴛɪᴍᴀɢᴇ : ${onOff(st.setimage)}
┃✯│ sᴇᴛᴀᴜᴅɪᴏᴍᴇɴᴜ : ${onOff(st.setaudiomenu)}
┃✯╰─────────────────❍
╰══════════════════⊷❍
╭┉┉┉┉┉┉┉⊷❍
┃◆│ᴘᴏᴡᴇʀᴇᴅ ʙʏ STORM CYBER MD
╰════════════════════⊷❍
> *© SPONSORED ʙʏ  STORM  𝐗  𖤍*`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})
 }catch(e){console.log(e)}
}
};
