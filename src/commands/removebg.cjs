function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

async function uploadToCatbox(buffer){
 const FormData = (await import('form-data')).default;
 const form = new FormData();
 form.append('reqtype','fileupload');
 form.append('fileToUpload',buffer,'removebg.jpg');
 let res = await fetch('https://catbox.moe/user/api.php',{method:'POST',body:form});
 return (await res.text()).trim();
}

export default{
name:"removebg",
aliases:["rbg","rembg","nobg","rmbg"],
execute: async(sock,m,args)=>{
 try{
  let q = m.quoted? m.quoted : m;
  let mime = (q.msg || q.message)?.mimetype || q.mimetype || "";
  if(!/image/.test(mime)){
   return await sock.sendMessage(m.chat,{text:`${toSC("reply to an image with.removebg")}`},{quoted:m});
  }
  await sock.sendMessage(m.chat,{react:{text:"✂️",key:m.key}});

  let buffer = await sock.downloadMediaMessage(q);
  let imageUrl = await uploadToCatbox(buffer);

  // FREE REMOVEBG APIS - Try multiple
  let bgRemovedUrl = "";

  try{
   // API 1 - Popcat free
   bgRemovedUrl = `https://api.popcat.xyz/removebg?image=${encodeURIComponent(imageUrl)}`;
   let check = await fetch(bgRemovedUrl);
   if(!check.ok) throw new Error();
  }catch{
   // API 2 - itsrose fallback
   try{
    bgRemovedUrl = `https://api.itsrose.rest/image/removebg?url=${encodeURIComponent(imageUrl)}`;
   }catch{
    bgRemovedUrl = imageUrl;
   }
  }

  await sock.sendMessage(m.chat,{
   image:{url:bgRemovedUrl},
   caption:`*${toSC("removebg pro")}* ✂️\n\n> ${toSC("background removed")}\n> ${toSC("powered by storm cyber md")}`
  },{quoted:m});

  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  console.log(e);
  await sock.sendMessage(m.chat,{text:`${toSC("removebg failed, reply to image")}`},{quoted:m});
 }
}
}
