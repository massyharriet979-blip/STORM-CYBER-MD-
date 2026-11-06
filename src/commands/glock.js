export default {
 name: 'glock',
 aliases: ['grouplock','lockgc','unlockgc'],
 async execute(sock, from, msg, args){
  const senderId = msg.key.participant || msg.key.remoteJid
  const isAllowed = global.owner?.includes(senderId) || global.sudo?.includes(senderId) || msg.key.fromMe
  if(!isAllowed){
   try{ await sock.sendMessage(from,{react:{text:'⛔',key:msg.key}}) }catch{}
   return sock.sendMessage(from,{text:`┏━━━━━━༻❁༺━━━━━━┓\n┃ ⚛️ 𝚀𝚄𝙰𝙽𝚃𝚄𝙼 𝙲𝙾𝚄𝙽𝙲𝙸𝙻 𝚁𝙴𝚀𝚄𝙸𝚁𝙴𝙳\n┃ 🧬 𝐀𝐑𝐂𝐇𝐈𝐓𝐄𝐂𝐓 𝐋𝐄𝐕𝐄𝐋 𝐎𝐍𝐋𝐘\n┗━━━━━━༻❁༺━━━━━━┛`},{quoted:msg})
  }
  if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:`╔════════════╗\n║ Group only\n╚════════════╝`},{quoted:msg})
  const action = args[0]?.toLowerCase() || msg.key.id.includes('unlock')? 'unlock' : 'lock'
  const isLock = args[0]?.toLowerCase() === 'lock' || msg.body?.includes('lock')
  try{
   await sock.sendMessage(from,{react:{text:'🔒',key:msg.key}})
   if(action==='lock'){
    await sock.groupSettingUpdate(from,'announcement')
    return sock.sendMessage(from,{text:`◈ ━━･ STORM ･━━ ◈\n┃ 🔒 𝗚𝗥𝗢𝗨𝗣 𝗟𝗢𝗖𝗞𝗘𝗗\n┃\n┃ ᴀᴅᴍɪɴ ᴏɴʟʏ ᴍᴏᴅᴇ\n◈ ━━━━━━━━ ◈`},{quoted:msg})
   }else{
    await sock.groupSettingUpdate(from,'not_announcement')
    return sock.sendMessage(from,{text:`◈ ━━･ STORM ･━━ ◈\n┃ 🔓 𝙶𝚁𝙾𝚄𝙿 𝚄𝙽𝙻𝙾𝙲𝙺𝙴𝙳\n┃\n┃ 𝐀𝐥𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐜𝐚𝐧 𝐜𝐡𝐚𝐭\n◈ ━━━━━━━━ ◈`},{quoted:msg})
   }
  }catch(e){ return sock.sendMessage(from,{text:`╔════════════╗\n║ ❌ ${e.message}\n╚════════════╝`},{quoted:msg}) }
 }
}
