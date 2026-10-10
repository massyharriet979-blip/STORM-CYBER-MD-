function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}
export default{
name:"dalle",
aliases:["dall","dalle2","openaiimg"],
execute: async(sock,m,args)=>{
 try{
  if(!args[0]) return await sock.sendMessage(m.chat,{text:`${toSC("usage:.dalle a futuristic city")}`},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"🎨",key:m.key}});
  let prompt = args.join(" ");
  let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux&enhance=true&nologo=true`;
  await sock.sendMessage(m.chat,{
   image:{url:url},
   caption:`*${toSC("dalle pro")}* 🤖🎨\n\n*${toSC("prompt")}:* ${prompt}\n\n> ${toSC("powered by storm cyber md")}`
  },{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
 }catch(e){
  console.log(e);
  await sock.sendMessage(m.chat,{text:`${toSC("dalle error")}`},{quoted:m});
 }
}
}
