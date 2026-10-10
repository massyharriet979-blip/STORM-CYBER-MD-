module.exports={
name:"diff",
aliases:["difference","compare"],
execute: async(sock,m,args)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   let input = args.join(" ").trim();
   if(!input) return await sock.sendMessage(m.chat,{text:`${toSC("usage")}:\n.diff 2020-01-01 2025-01-01\n.diff 100 50\n.diff hello | world\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});

   // TEXT DIFF WITH |
   if(input.includes("|")){
     let [a,b]=input.split("|").map(s=>s.trim());
     let diffA = [...a].filter(c=>!b.includes(c)).join("") || toSC("none");
     let diffB = [...b].filter(c=>!a.includes(c)).join("") || toSC("none");
     let common = [...new Set([...a].filter(c=>b.includes(c)))].join("") || toSC("none");
     let txt = `${toSC("text diff")}\n\n${toSC("text1")}: ${a}\n${toSC("text2")}: ${b}\n\n${toSC("only in 1")}: ${diffA}\n${toSC("only in 2")}: ${diffB}\n${toSC("common")}: ${common}\n\n> ${toSC("powered by storm")} 𝐗`;
     return await sock.sendMessage(m.chat,{text:txt},{quoted:m});
   }

   let parts=args;
   // DATE DIFF
   let d1=new Date(parts[0]);
   let d2=new Date(parts[1]);
   if(!isNaN(d1)&&!isNaN(d2)){
     let diffMs=Math.abs(d2-d1);
     let days=Math.floor(diffMs/(1000*60*60*24));
     let years=Math.floor(days/365);
     let months=Math.floor(days/30);
     let txt=`${toSC("date diff")}\n\n${toSC("from")}: ${d1.toDateString()}\n${toSC("to")}: ${d2.toDateString()}\n\n${toSC("days")}: ${days}\n${toSC("months")} ~ ${months}\n${toSC("years")} ~ ${years}\n\n> ${toSC("powered by storm")} 𝐗`;
     return await sock.sendMessage(m.chat,{text:txt},{quoted:m});
   }

   // NUMBER DIFF
   let n1=parseFloat(parts[0]);
   let n2=parseFloat(parts[1]);
   if(!isNaN(n1)&&!isNaN(n2)){
     let diff=Math.abs(n1-n2);
     let perc = n1!==0? (diff/n1*100).toFixed(2):0;
     let txt=`${toSC("number diff")}\n\n${toSC("num1")}: ${n1}\n${toSC("num2")}: ${n2}\n\n${toSC("difference")}: ${diff}\n${toSC("percent")}: ${perc}%\n${toSC("sum")}: ${n1+n2}\n\n> ${toSC("powered by storm")} 𝐗`;
     return await sock.sendMessage(m.chat,{text:txt},{quoted:m});
   }

   await sock.sendMessage(m.chat,{text:toSC("invalid format, use | for text")},{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
