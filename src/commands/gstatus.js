import fs from 'fs';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"gstatus",
aliases:["groupstatus","gstat"],
execute: async(sock,m,args)=>{
 if(!m.isOwner) return await sock.sendMessage(m.chat,{text:`⛔ ${toSC("owner only")}`},{quoted:m});
 await sock.sendMessage(m.chat,{react:{text:"📢",key:m.key}});

 let q=m.quoted;
 let text=args.join(" ");
 let mediaMsg=null;
 let mtype="";

 if(q){
  mtype=q.mtype;
  mediaMsg=q.msg || q.message?.[mtype];
 }else if(m.mtype!=="conversation" && m.mtype!=="extendedTextMessage"){
  // current message is media
  // try to get from main msg cache is hard, so treat as direct
  mtype=m.mtype;
 }

 // helper to send to a group
 const sendToGroup=async(gid, content)=>{
  try{ await sock.sendMessage(gid, content); }catch{}
 };

 let groups=[];
 try{
  let all=await sock.groupFetchAllParticipating().catch(()=>({}));
  groups=Object.keys(all);
 }catch{ groups=[m.chat]; }

 // build content from quoted or current
 let content=null;
 if(q){
  if(q.mtype==="imageMessage"){
   content={image: mediaMsg, caption: text||mediaMsg?.caption||""};
  }else if(q.mtype==="videoMessage"){
   content={video: mediaMsg, caption: text||mediaMsg?.caption||""};
  }else if(q.mtype==="stickerMessage"){
   content={sticker: mediaMsg};
  }else if(q.mtype==="audioMessage" || q.mtype==="pttMessage"){
   content={audio: mediaMsg, mimetype:"audio/mp4", ptt: q.mtype==="pttMessage"};
  }else{
   let qtext=q.msg?.text || q.msg?.caption || q.message?.conversation || "";
   content={text: text||qtext};
  }
 }else{
  if(!text) return await sock.sendMessage(m.chat,{text:`${toSC("usage")}:.gstatus <text> or reply to image/video/audio/sticker\n\n${toSC("add 'all' to post to all groups")}:.gstatus all <text>`},{quoted:m});
  // check if "all" keyword
  if(args[0]?.toLowerCase()==="all"){
   let finalText=args.slice(1).join(" ");
   if(!finalText) return await sock.sendMessage(m.chat,{text:`${toSC("provide text after all")}`});
   content={text: finalText};
   for(let gid of groups){
    await sendToGroup(gid, content);
    await new Promise(r=>setTimeout(r,500));
   }
   return await sock.sendMessage(m.chat,{text:`✅ GROUP STATUS POSTED SUCCESSFULLY TO ${groups.length} GROUPS\n\n> ${toSC("powered by storm cyber md")}`});
  }else{
   content={text: text};
  }
 }

 // if single group (current) or all groups if media + all flag
 if(args[0]?.toLowerCase()==="all" || text.toLowerCase().startsWith("all ")){
  for(let gid of groups){
   await sendToGroup(gid, content);
   await new Promise(r=>setTimeout(r,500));
  }
  await sock.sendMessage(m.chat,{text:`✅ GROUP STATUS POSTED SUCCESSFULLY TO ${groups.length} GROUPS\n\n> ${toSC("powered by storm cyber md")}`});
 }else{
  await sock.sendMessage(m.chat, content);
  await sock.sendMessage(m.chat,{text:`✅ GROUP STATUS POSTED SUCCESSFULLY.\n\n> ${toSC("powered by storm cyber md")}`});
 }
}
}
