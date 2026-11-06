function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"vote",
aliases:["poll","votepoll"],
execute: async(sock,m,args)=>{
 try{
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.vote question | option1, option2, option3")}\n${toSC("ex:.vote best md? | storm, quantum")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"📊",key:m.key}});

  let full = args.join(" ").split("|");
  if(full.length < 2){
   return await sock.sendMessage(m.chat,{text:`${toSC("wrong format use | to separate")}`},{quoted:m});
  }

  let question = full[0].trim();
  let options = full[1].split(",").map(o=>o.trim()).filter(o=>o);

  if(options.length < 2){
   return await sock.sendMessage(m.chat,{text:`${toSC("need at least 2 options")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{
   poll:{
    name: toSC(question),
    values: options.map(o=>toSC(o)),
    selectableCount: 1
   }
  },{quoted:m});

  await new Promise(r=>setTimeout(r,1000));
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("failed to create poll")}`},{quoted:m});
 }
}
}
