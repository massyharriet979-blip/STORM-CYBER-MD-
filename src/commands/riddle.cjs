import fs from 'fs';
function toSC(s){const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};return s.toLowerCase().split('').map(c=>mp[c]||c).join('')}

const RIDDLES=[
{q:"What has to be broken before you can use it?", a:"egg", cat:"easy"},
{q:"I speak without a mouth and hear without ears. What am I?", a:"echo", cat:"easy"},
{q:"What gets wetter the more it dries?", a:"towel", cat:"easy"},
{q:"I have keys but no locks, space but no room. What am I?", a:"keyboard", cat:"medium"},
{q:"What has many eyes but cannot see?", a:"potato", cat:"medium"},
{q:"The more you take, the more you leave behind. What are they?", a:"footsteps", cat:"medium"},
{q:"What can travel around the world while staying in one corner?", a:"stamp", cat:"hard"},
{q:"I have cities but no houses, mountains but no trees. What am I?", a:"map", cat:"hard"},
{q:"What has hands but can't clap?", a:"clock", cat:"easy"},
{q:"What goes up but never comes down?", a:"age", cat:"easy"},
{q:"If you have me you want to share me, if you share me you haven't got me. What am I?", a:"secret", cat:"hard"},
{q:"What has a head and a tail but no body?", a:"coin", cat:"easy"}
];

function getDB(chat){ let p=`./database/riddle_${chat}.json`; if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p)); return null; }
function saveDB(chat,d){ fs.mkdirSync("./database",{recursive:true}); fs.writeFileSync(`./database/riddle_${chat}.json`,JSON.stringify(d)); }

export default{
name:"riddle",
aliases:["riddles"],
execute: async(sock,m,args)=>{
 try{
  await sock.sendMessage(m.chat,{react:{text:"🧩",key:m.key}});
  let chat=m.chat;
  let data=getDB(chat);
  let sub=args.join(" ").toLowerCase();

  if(!data || sub=="start" || sub=="new" || sub=="next"){
   let cat = data?.cat || "easy";
   let pool = RIDDLES.filter(r=>r.cat===cat);
   let r = pool[Math.floor(Math.random()*pool.length)];
   data={...r, cat, solved:0, tries:0, flip: data?.flip||false};
   saveDB(chat,data);
   let cap=`**╭─❍ ${toSC("riddle")} [${toSC(cat)}] ❍─**\n`;
   cap+=`**│ 🧩 ${r.q}**\n`;
   cap+=`**│**\n**│ 💡 ${toSC("reply with answer")}.riddle youranswer**\n`;
   cap+=`**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("riddle controls"),
     buttons:[
       {buttonId:`.riddle answer`, buttonText:{displayText:`👁️ ${toSC("show answer")}`}, type:1},
       {buttonId:`.riddle next`, buttonText:{displayText:`⏭️ ${toSC("next")}`}, type:1},
       {buttonId:`.riddle flip`, buttonText:{displayText:`🔄 ${toSC("flip difficulty")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub=="board" || sub=="hint"){
   let hint = data.a[0] + "_".repeat(data.a.length-1);
   return await sock.sendMessage(chat,{text:`**🔍 ${toSC("hint")}: ${hint} (${data.a.length} ${toSC("letters")})**`},{quoted:m});
  }

  if(sub=="flip" || sub=="rotate"){
   let cats=["easy","medium","hard"];
   let idx=cats.indexOf(data.cat);
   let next=cats[(idx+1)%cats.length];
   data.cat=next; data.flip=!data.flip;
   let pool=RIDDLES.filter(r=>r.cat===next);
   let r=pool[Math.floor(Math.random()*pool.length)];
   data.q=r.q; data.a=r.a;
   saveDB(chat,data);
   let cap=`**🔄 ${toSC("flipped to")} ${toSC(next)}**\n\n**🧩 ${r.q}**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("new difficulty"),
     buttons:[
       {buttonId:`.riddle answer`, buttonText:{displayText:`👁️ ${toSC("answer")}`}, type:1},
       {buttonId:`.riddle board`, buttonText:{displayText:`🎯 ${toSC("hint")}`}, type:1},
       {buttonId:`.riddle flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  if(sub=="answer" || sub=="show"){
   let cap=`**👁️ ${toSC("answer")}: ${data.a}**\n\n**❓ ${data.q}**\n\n> ${toSC("powered by storm")} 𝐗`;
   return await sock.sendMessage(chat,{
     text:cap,
     footer: toSC("answer revealed"),
     buttons:[
       {buttonId:`.riddle next`, buttonText:{displayText:`⏭️ ${toSC("next riddle")}`}, type:1},
       {buttonId:`.riddle flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

  // check answer
  let guess=sub.trim();
  data.tries++;
  saveDB(chat,data);
  if(guess===data.a.toLowerCase()){
   let cap=`**🎉 ${toSC("correct!")} ${toSC("answer is")} ${data.a}**\n\n**🏆 ${toSC("solved in")} ${data.tries} ${toSC("tries")}**\n\n> ${toSC("powered by storm")} 𝐗`;
   // auto next
   let pool=RIDDLES.filter(r=>r.cat===data.cat);
   let r=pool[Math.floor(Math.random()*pool.length)];
   data={...r, cat:data.cat, solved:data.solved+1, tries:0, flip:data.flip};
   saveDB(chat,data);
   return await sock.sendMessage(chat,{
     text:cap+`\n\n**⏭️ ${toSC("next")}: ${r.q}**`,
     footer: toSC("you solved it"),
     buttons:[
       {buttonId:`.riddle answer`, buttonText:{displayText:`👁️ ${toSC("answer")}`}, type:1},
       {buttonId:`.riddle flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1},
       {buttonId:`.riddle board`, buttonText:{displayText:`🎯 ${toSC("hint")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  } else {
   return await sock.sendMessage(chat,{
     text:`**❌ ${toSC("wrong!")} ${toSC("try again")}**\n\n**🧩 ${data.q}**\n\n> ${toSC("powered by storm")} 𝐗`,
     footer: toSC("try again"),
     buttons:[
       {buttonId:`.riddle board`, buttonText:{displayText:`🎯 ${toSC("hint")}`}, type:1},
       {buttonId:`.riddle answer`, buttonText:{displayText:`👁️ ${toSC("show answer")}`}, type:1},
       {buttonId:`.riddle flip`, buttonText:{displayText:`🔄 ${toSC("flip")}`}, type:1}
     ],
     headerType:1
   },{quoted:m});
  }

 }catch(e){ await sock.sendMessage(m.chat,{text:`**Error:** ${e.message}`},{quoted:m}); }
}
}
