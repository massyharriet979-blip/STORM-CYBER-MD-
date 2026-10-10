function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

global.autoReact = global.autoReact || false;
global.autoReactEmojis = ["❤️","🔥","😂","😮","😢","🙏","👍","🥺","🤖","✨"];

export default{
name:"autoreact",
aliases:["areact","autorea","reactauto"],
execute: async(sock,m,args)=>{
 try{
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`*${toSC("autoreact")}* ⚙️\n\n${toSC("usage")}:\n.autoreact on - ${toSC("enable autoreact")}\n.autoreact off - ${toSC("disable")}\n.autoreact status\n\n${toSC("current")}: ${global.autoReact? "ON ✅":"OFF ❌"}\n\n> ${toSC("powered by storm cyber md")}`},{quoted:m});
  }

  let mode = args[0].toLowerCase();

  if(mode === "on" || mode === "enable"){
   global.autoReact = true;
   await sock.sendMessage(m.chat,{text:`*${toSC("autoreact enabled")}* ✅\n${toSC("bot will auto react to all messages")}`},{quoted:m});
  }else if(mode === "off" || mode === "disable"){
   global.autoReact = false;
   await sock.sendMessage(m.chat,{text:`*${toSC("autoreact disabled")}* ❌`},{quoted:m});
  }else if(mode === "status"){
   await sock.sendMessage(m.chat,{text:`*${toSC("autoreact status")}:* ${global.autoReact? "ON ✅":"OFF ❌"}`},{quoted:m});
  }else{
   await sock.sendMessage(m.chat,{text:`${toSC("use:.autoreact on/off")}`},{quoted:m});
  }

  // --- NOTE: ADD THIS IN YOUR main handler (index.js / message.js) ---
  // if(global.autoReact){
  // let emoji = global.autoReactEmojis[Math.floor(Math.random()*global.autoReactEmojis.length)];
  // await sock.sendMessage(m.chat,{react:{text:emoji,key:m.key}});
  // }

 }catch(e){
  console.log(e);
 }
}
}
