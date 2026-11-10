function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

global.autoLike = global.autoLike || false;
global.autoLikeEmoji = ["❤️","🔥","😍","👏","🥺","💯"];

export default{
name:"autolike",
aliases:["alike","likestatus","autolikestatus"],
execute: async(sock,m,args)=>{
 try{
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`*${toSC("autolike status")}* ❤️\n\n${toSC("usage")}:\n.autolike on - ${toSC("enable auto like status")}\n.autolike off - ${toSC("disable")}\n.autolike emoji ❤️ - ${toSC("set custom emoji")}\n.autolike status\n\n${toSC("current")}: ${global.autoLike? "ON ✅":"OFF ❌"}\nEmoji: ${global.autoLikeEmoji.join(" ")}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});
  }

  let mode = args[0].toLowerCase();

  if(mode === "on" || mode === "enable"){
   global.autoLike = true;
   await sock.sendMessage(m.chat,{text:`*${toSC("autolike enabled")}* ✅\n${toSC("bot will auto like all status")}`},{quoted:m});
  }else if(mode === "off" || mode === "disable"){
   global.autoLike = false;
   await sock.sendMessage(m.chat,{text:`*${toSC("autolike disabled")}* ❌`},{quoted:m});
  }else if(mode === "emoji"){
   let newEmoji = args[1] || "❤️";
   global.autoLikeEmoji = [newEmoji];
   await sock.sendMessage(m.chat,{text:`*${toSC("emoji set to")}* ${newEmoji} ✅`},{quoted:m});
  }else if(mode === "status"){
   await sock.sendMessage(m.chat,{text:`*${toSC("autolike status")}:* ${global.autoLike? "ON ✅":"OFF ❌"}\nEmoji: ${global.autoLikeEmoji.join(" ")}`},{quoted:m});
  }else{
   await sock.sendMessage(m.chat,{text:`${toSC("use:.autolike on/off")}`},{quoted:m});
  }

 }catch(e){
  console.log(e);
 }
}
}
