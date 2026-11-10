function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"image",
aliases:["img","gen","imagine","dalle"],
execute: async(sock,m,args)=>{
 try{
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.image a cyber boy with hoodie")}`},{quoted:m});
  }
  await sock.sendMessage(m.chat,{react:{text:"🎨",key:m.key}});

  let prompt = args.join(" ");
  let encoded = encodeURIComponent(prompt);

  // FREE API - No key needed, uses your ONE KEY system host
  let url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&enhance=true`;

  let caption = `*${toSC("image pro")}* 🎨\n\n*${toSC("prompt")}:* ${prompt}\n\n> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{
   image:{url:url},
   caption:caption
  },{quoted:m});

  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
 }catch(e){
  console.log(e);
  await sock.sendMessage(m.chat,{text:`${toSC("image generation failed")}`},{quoted:m});
 }
}
}
