function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"write",
aliases:["writetext","textpic","writeon"],
execute: async(sock,m,args)=>{
 try{
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.write your text")}`},{quoted:m});
  }
  await sock.sendMessage(m.chat,{react:{text:"✍️",key:m.key}});
  let text = args.join(" ").slice(0,80);
  let url = `https://image.pollinations.ai/prompt/beautiful%20typography%20art%20text%20'${encodeURIComponent(text)}'%20neon%20cyberpunk%20glow%20black%20background%204k?width=1024&height=1024&nologo=true&enhance=true`;
  await sock.sendMessage(m.chat,{image:{url:url},caption:`*${toSC("write pro")}* ✍️\n*${toSC("text")}:* ${text}\n> ${toSC("powered by storm cyber md")}`},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("write failed")}`},{quoted:m});
 }
}
}
