module.exports={
name:"users",
aliases:["allusers","userlist"],
execute: async(sock,m)=>{
 try{
  const toSmallCaps = (str) => {
    const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ',A:'ᴀ',B:'ʙ',C:'ᴄ',D:'ᴅ',E:'ᴇ',F:'ғ',G:'ɢ',H:'ʜ',I:'ɪ',J:'ᴊ',K:'ᴋ',L:'ʟ',M:'ᴍ',N:'ɴ',O:'ᴏ',P:'ᴘ',Q:'ǫ',R:'ʀ',S:'s',T:'ᴛ',U:'ᴜ',V:'ᴠ',W:'ᴡ',X:'x',Y:'ʏ',Z:'ᴢ'};
    return str.split('').map(c=>map[c]||c).join('');
  };

  let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
  let sender=m.sender.split("@")[0]

  if(sender!==botId){
    return await sock.sendMessage(m.chat,{text:`${toSmallCaps("quantum clearance required")}\n${toSmallCaps("its not for local users")}`},{quoted:m})
  }

  let allChats = Object.keys(sock.chats || {});
  let users = allChats.filter(j=>j.endsWith("@s.whatsapp.net"));
  let total = users.length;

  let text = `${toSmallCaps("cyber-md users")}\n\n${toSmallCaps("total users")}: ${total}\n${toSmallCaps("date")}: ${new Date().toLocaleDateString('en-GB')}`;

  if(total > 0 && total < 40){
    text += `\n\n${users.map((u,i)=>`${i+1}. ${u.split("@")[0]}`).join("\n")}`;
  }

  await sock.sendMessage(m.chat,{text},{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
