function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

async function uploadToCatbox(buffer){
 const FormData = (await import('form-data')).default;
 const form = new FormData();
 form.append('reqtype','fileupload');
 form.append('fileToUpload',buffer,'cartoon.jpg');
 let res = await fetch('https://catbox.moe/user/api.php',{method:'POST',body:form});
 let url = await res.text();
 return url.trim();
}

export default{
name:"tocartoon",
aliases:["cartoon","tocart","toon"],
execute: async(sock,m,args)=>{
 try{
  let q = m.quoted? m.quoted : m;
  let mime = (q.msg || q.message)?.mimetype || q.mimetype || "";

  if(!/image/.test(mime)){
   return await sock.sendMessage(m.chat,{text:`${toSC("reply to an image with.tocartoon")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🎨",key:m.key}});

  let buffer = await sock.downloadMediaMessage(q);

  // Upload image to get link
  let imageUrl = await uploadToCatbox(buffer);

  // Free cartoonify API
  let cartoonUrl = `https://api.popcat.xyz/cartoonify?image=${encodeURIComponent(imageUrl)}`;

  // Fallback if popcat fails, use pollinations cartoon prompt
  try{
   let check = await fetch(cartoonUrl);
   if(!check.ok) throw new Error();
  }catch{
   cartoonUrl = `https://api.itsrose.rest/image/cartoon?apikey=${process.env.ROSE_API || 'free'}&url=${encodeURIComponent(imageUrl)}`;
  }

  await sock.sendMessage(m.chat,{
   image:{url:cartoonUrl},
   caption:`*${toSC("tocartoon pro")}* ✨\n\n> ${toSC("powered by storm cyber md")}`
  },{quoted:m});

  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  console.log(e);
  try{
   // LAST FALLBACK - POLLINATIONS CARTOON STYLE
   let q = m.quoted? m.quoted : m;
   let buffer = await sock.downloadMediaMessage(q);
   let imageUrl = await uploadToCatbox(buffer);
   let url = `https://image.pollinations.ai/prompt/cartoon%20style%20anime%20version%20of%20this%20image?image=${encodeURIComponent(imageUrl)}&nologo=true`;
   await sock.sendMessage(m.chat,{image:{url:url},caption:`*${toSC("tocartoon pro")}* ✨`},{quoted:m});
  }catch{
   await sock.sendMessage(m.chat,{text:`${toSC("tocartoon failed, reply to image")}`},{quoted:m});
  }
 }
}
}
