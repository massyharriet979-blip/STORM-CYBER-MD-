function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"gamer",
alias:["games","gamemenu","enginegames","racing"],
execute: async(sock, m, args)=>{
 try{
  let txt=`╭━─━─❰ 🏁 𝐒𝐓𝐎𝐑𝐌 𝐄𝐍𝐆𝐈𝐍𝐄 𝐆𝐀𝐌𝐄𝐒 ❱─━─━╮
┃
┃ ${toSmallCaps("🏎️ car engines")}
┃ • ɴᴇᴇᴅ ғᴏʀ sᴘᴇᴇᴅ -.nfs
┃ • ᴀsᴘʜᴀʟᴛ 9 -.asphalt
┃ • ᴄᴀʀ ᴘᴀʀᴋɪɴɢ -.carpark
┃ • ᴅʀɪғᴛ ʀᴀᴄɪɴɢ -.drift
┃ • ғ1 ʀᴀᴄɪɴɢ -.f1
┃ • ɢᴛᴀ ᴠ ʀᴀᴄɪɴɢ -.gtarace
┃
┃ ${toSmallCaps("🏍️ bike engines")}
┃ • ᴍᴏᴛᴏ ɢᴘ 24 -.motogp
┃ • ʙɪᴋᴇ ʀᴀᴄɪɴɢ 3ᴅ -.bikerace
┃ • ᴛʀᴀғғɪᴄ ʀɪᴅᴇʀ -.trafficrider
┃ • ᴍx ᴍᴏᴛᴏᴄʀᴏss -.mxrace
┃ • ʀᴇᴀʟ ʙɪᴋᴇ -.realbike
┃
┃ ${toSmallCaps("🚀 other engines")}
┃ • ᴊᴇᴛ ғʟɪɢʜᴛ -.jet
┃ • ʙᴏᴀᴛ ʀᴀᴄᴇ -.boatrace
┃ • ᴛʀᴀɪɴ sɪᴍ -.train
┃ • ᴛʀᴜᴄᴋ ᴄᴀʀɢᴏ -.truck
┃
┃ ${toSmallCaps("🎮 mini games")}
┃ • ᴛɪᴄᴛᴀᴄᴛᴏᴇ -.ttt
┃ • ᴄʜᴇss -.chess
┃ • ʜᴀɴɢᴍᴀɴ -.hangman
┃ • ᴍᴀᴛʜ -.math
┃ • ᴛᴇʙᴀᴋ -.tebak
╰━━━━━━━━━━━━━━━╯
> ${toSmallCaps("powered by storm x")}`

  await sock.sendMessage(m.chat,{
   image:{url:"https://files.catbox.moe/pznw3z.jpg"},
   caption:txt,
   contextInfo:{
    forwardedNewsletterMessageInfo:{
     newsletterJid:"120363414065055650@newsletter",
     newsletterName:"STORM CYBER MD",
     serverMessageId:1
    }
   }
  },{quoted:m})

 }catch(e){ console.log(e) }
}
}
