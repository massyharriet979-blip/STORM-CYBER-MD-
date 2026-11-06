function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"out",
aliases:["leave","exit","bye"],
execute: async(sock,m,args)=>{
 if(!m.isGroup) return await sock.sendMessage(m.chat,{text:`❌ ${toSC("group only")}`},{quoted:m});

 // OWNER ONLY - NO ADMIN
 if(!m.isOwner) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("owner only command")}`},{quoted:m});

 await sock.sendMessage(m.chat,{react:{text:"👋",key:m.key}});

 let msg=`ᴛʜɪs ɢʀᴏᴜᴘ ɪs ɴᴏᴛ ɴᴏɴsᴇɴsᴇ ᴛᴏ ᴍᴇ. ʙʏᴇ, ᴀᴅᴍɪɴs ᴛᴀᴋᴇ ᴄᴀʀᴇ\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`;

 await sock.sendMessage(m.chat,{text:msg});
 await new Promise(r=>setTimeout(r,1500));
 await sock.groupLeave(m.chat);
}
}
