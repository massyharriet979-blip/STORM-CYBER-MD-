module.exports={
name:"age",
aliases:["myage","agecalc"],
execute: async(sock,m,args)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let input = args.join(" ").trim();
   if(!input) return await sock.sendMessage(m.chat,{text:`${toSC("usage")}:.age 2005-05-15\n${toSC("or")}.age 15-05-2005`},{quoted:m});

   let dob = new Date(input);
   if(isNaN(dob)) return await sock.sendMessage(m.chat,{text:toSC("invalid date format, use yyyy-mm-dd")},{quoted:m});

   let now = new Date();
   let diff = now - dob;
   let years = now.getFullYear() - dob.getFullYear();
   let months = now.getMonth() - dob.getMonth();
   let days = now.getDate() - dob.getDate();
   if(days<0){ months--; days+=30; }
   if(months<0){ years--; months+=12; }

   let totalDays = Math.floor(diff/(1000*60*60*24));

   let text = `${toSC("age calculator")}\n\n${toSC("dob")}: ${dob.toDateString()}\n${toSC("age")}: ${years} ${toSC("years")}, ${months} ${toSC("months")}, ${days} ${toSC("days")}\n${toSC("total days")}: ${totalDays}\n\n> ${toSC("powered by storm")} 𝐗`;
   await sock.sendMessage(m.chat,{text},{quoted:m});
 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
