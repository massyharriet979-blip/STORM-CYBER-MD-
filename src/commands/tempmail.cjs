function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"tempmail",
aliases:["tmpmail","mail","temp"],
execute: async(sock,m,args)=>{
 try{
  let cmd = args[0]?.toLowerCase() || "gen";

  if(cmd === "gen" || cmd === "create" || cmd === "new"){
   let res = await fetch(`https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1`);
   let data = await res.json();
   let mail = data[0];

   let txt = `*📧 ${toSC("temp mail generated")}*\n\n*${toSC("email")}:* ${mail}\n\n*${toSC("usage")}:*\n• ${toSC("use this email anywhere")}\n•.tempmail inbox ${mail} - ${toSC("check inbox")}\n\n> ${toSC("inbox expires in 24h")}`;

   return await sock.sendMessage(m.chat,{
    text: txt,
    footer: toSC("storm temp mail"),
    buttons:[
     {buttonId:`.tempmail inbox ${mail}`, buttonText:{displayText:`📥 ${toSC("check inbox")}`}, type:1},
     {buttonId:`.tempmail gen`, buttonText:{displayText:`🔄 ${toSC("new mail")}`}, type:1},
    ],
    headerType:1
   },{quoted:m});
  }

  if(cmd === "inbox" || cmd === "check" || cmd === "messages"){
   let email = args[1];
   if(!email) return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("provide email")}*\n>.tempmail inbox youremail@1secmail.com`},{quoted:m});

   let [login, domain] = email.split('@');
   let res = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
   let data = await res.json();

   if(!data || data.length === 0){
    return await sock.sendMessage(m.chat,{text:`*📭 ${toSC("inbox empty")}*\n\n*${toSC("email")}:* ${email}\n> ${toSC("no messages yet")}`},{quoted:m});
   }

   let list = data.map((v,i)=>`*${i+1}. ${toSC("from")}:* ${v.from}\n*${toSC("subject")}:* ${v.subject}\n*${toSC("date")}:* ${v.date}\n*ID:* ${v.id}`).join('\n\n');

   let txt = `*📥 ${toSC("inbox")}:* ${email}\n*${toSC("total")}:* ${data.length}\n\n${list}\n\n>.tempmail read ${email} <id> - ${toSC("read message")}`;

   return await sock.sendMessage(m.chat,{text: txt},{quoted:m});
  }

  if(cmd === "read" || cmd === "view"){
   let email = args[1];
   let id = args[2];
   if(!email ||!id) return await sock.sendMessage(m.chat,{text:`*❌ ${toSC("usage")}:*.tempmail read email id`},{quoted:m});
   let [login, domain] = email.split('@');
   let res = await fetch(`https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${id}`);
   let data = await res.json();

   let txt = `*📧 ${toSC("message")}*\n\n*${toSC("from")}:* ${data.from}\n*${toSC("subject")}:* ${data.subject}\n*${toSC("date")}:* ${data.date}\n\n*${toSC("body")}:*\n${data.textBody || data.body || toSC("no text")}`;

   return await sock.sendMessage(m.chat,{text: txt},{quoted:m});
  }

  return await sock.sendMessage(m.chat,{text:`*📧 ${toSC("tempmail menu")}*\n\n.tempmail gen - ${toSC("new email")}\n.tempmail inbox <email> - ${toSC("check inbox")}\n.tempmail read <email> <id> - ${toSC("read message")}`},{quoted:m});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`*❌ ${toSC("error")}:* ${e.message}`},{quoted:m});
 }
}
}
