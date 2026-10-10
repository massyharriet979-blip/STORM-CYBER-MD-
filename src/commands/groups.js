module.exports={
name:"groups",
aliases:["allgroups","grouplist","grps"],
execute: async(sock,m)=>{
 try{
  const toSmallCaps = (str) => {
    const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ',A:'ᴀ',B:'ʙ',C:'ᴄ',D:'ᴅ',E:'ᴇ',F:'ғ',G:'ɢ',H:'ʜ',I:'ɪ',J:'ᴊ',K:'ᴋ',L:'ʟ',M:'ᴍ',N:'ɴ',O:'ᴏ',P:'ᴘ',Q:'ǫ',R:'ʀ',S:'s',T:'ᴛ',U:'ᴜ',V:'ᴠ',W:'ᴡ',X:'x',Y:'ʏ',Z:'ᴢ'};
    return str.split('').map(c=>map[c]||c).join('');
  };

  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  if(m.sender.split("@")[0]!==botId){
    return await sock.sendMessage(m.chat,{text:`${toSmallCaps("quantum clearance required")}\n${toSmallCaps("its not for local users")}`},{quoted:m})
  }

  let allChats = Object.keys(sock.chats || {});
  let groups = allChats.filter(j=>j.endsWith("@g.us"));
  let total = groups.length;

  let text = `${toSmallCaps("cyber-md groups")}\n\n${toSmallCaps("total groups")}: ${total}\n${toSmallCaps("date")}: ${new Date().toLocaleDateString('en-GB')}\n\n`;

  let list = [];
  for(let i=0;i<groups.length; i++){
    try{
      let meta = await sock.groupMetadata(groups[i]);
      list.push(`${i+1}. ${meta.subject}\n ɪᴅ: ${groups[i]}\n ᴍᴇᴍʙᴇʀs: ${meta.participants.length}`);
    }catch{
      list.push(`${i+1}. ${groups[i]}\n ᴍᴇᴍʙᴇʀs:?`);
    }
    if(list.join("\n\n").length > 3500) break;
  }

  text += list.join("\n\n");
  if(total > list.length) text += `\n\n${toSmallCaps("and")} ${total-list.length} ${toSmallCaps("more...")}`;

  await sock.sendMessage(m.chat,{text},{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
