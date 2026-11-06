const fs=require('fs');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { translateText } = require('../lib/translate');

module.exports={
name:"getstick",
aliases:["getsticker","stealsticker","stickget","togif","toimg"],
execute: async(sock,m)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let botNum=sock.user?.id?.split(":")[0]||"";
   let t=async(txt)=>await translateText(txt,botNum);

   let quoted=m.quoted?m.quoted:m;
   let mime=(quoted.mimetype||quoted.msg?.mimetype||"").toLowerCase();
   let isSticker = mime.includes("webp") || quoted.type==="sticker" || quoted.msg?.type==="stickerMessage" || m.quoted?.type==="sticker";

   if(!isSticker){
     return await sock.sendMessage(m.chat,{text: await t(`${toSC("reply to a sticker to convert")}\n${toSC("usage")}: reply to sticker with.getstick\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   await sock.sendMessage(m.chat,{react:{text:"📦",key:m.key}});

   let buffer=await downloadMediaMessage(quoted, 'buffer', {}, { logger:console, reuploadRequest:sock.updateMediaMessage });

   let isAnimated = buffer.length>100000 || mime.includes("animated"); // rough check

   if(isAnimated){
     let file=`./${Date.now()}.mp4`;
     fs.writeFileSync(file, buffer);
     // WhatsApp will play webp animated as video if sent as video, but best send as sticker to mp4 via mimetype video
     await sock.sendMessage(m.chat,{video:buffer, caption: await t(`${toSC("sticker to video converted")}\n\n> ${toSC("powered by storm")} 𝐗`), gifPlayback:true},{quoted:m});
     if(fs.existsSync(file)) fs.unlinkSync(file);
   } else {
     await sock.sendMessage(m.chat,{image:buffer, caption: await t(`${toSC("sticker to image converted")}\n\n> ${toSC("powered by storm")} 𝐗`)},{quoted:m});
   }

   await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
   let botNum=sock.user?.id?.split(":")[0]||"";
   let err=await translateText(`Error: ${e.message}`,botNum);
   await sock.sendMessage(m.chat,{text:err},{quoted:m})
 }
}
}
