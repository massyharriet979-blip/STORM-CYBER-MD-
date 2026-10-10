const fs=require('fs');
const path='./src/database/subbotLang.json';

const langs = {
  af:"Afrikaans", sq:"Albanian", am:"Amharic", ar:"Arabic", hy:"Armenian", az:"Azerbaijani",
  eu:"Basque", be:"Belarusian", bn:"Bengali", bs:"Bosnian", bg:"Bulgarian", ca:"Catalan",
  ceb:"Cebuano", zh:"Chinese", co:"Corsican", hr:"Croatian", cs:"Czech", da:"Danish",
  nl:"Dutch", en:"English", eo:"Esperanto", et:"Estonian", fi:"Finnish", fr:"French",
  fy:"Frisian", gl:"Galician", ka:"Georgian", de:"German", el:"Greek", gu:"Gujarati",
  ht:"Haitian", ha:"Hausa", haw:"Hawaiian", he:"Hebrew", hi:"Hindi", hmn:"Hmong",
  hu:"Hungarian", is:"Icelandic", ig:"Igbo", id:"Indonesian", ga:"Irish", it:"Italian",
  ja:"Japanese", jw:"Javanese", kn:"Kannada", kk:"Kazakh", km:"Khmer", ko:"Korean",
  ku:"Kurdish", ky:"Kyrgyz", lo:"Lao", la:"Latin", lv:"Latvian", lt:"Lithuanian",
  lb:"Luxembourgish", mk:"Macedonian", mg:"Malagasy", ms:"Malay", ml:"Malayalam",
  mt:"Maltese", mi:"Maori", mr:"Marathi", mn:"Mongolian", my:"Myanmar", ne:"Nepali",
  no:"Norwegian", ny:"Nyanja", ps:"Pashto", fa:"Persian", pl:"Polish", pt:"Portuguese",
  pa:"Punjabi", ro:"Romanian", ru:"Russian", sm:"Samoan", gd:"Scots Gaelic", sr:"Serbian",
  st:"Sesotho", sn:"Shona", sd:"Sindhi", si:"Sinhala", sk:"Slovak", sl:"Slovenian",
  so:"Somali", es:"Spanish", su:"Sundanese", sw:"Swahili", sv:"Swedish", tl:"Tagalog",
  tg:"Tajik", ta:"Tamil", te:"Telugu", th:"Thai", tr:"Turkish", uk:"Ukrainian",
  ur:"Urdu", uz:"Uzbek", vi:"Vietnamese", cy:"Welsh", xh:"Xhosa", yi:"Yiddish",
  yo:"Yoruba", zu:"Zulu"
};

module.exports={
name:"setlanguage",
aliases:["setlang","lang","language"],
execute: async(sock,m,args)=>{
 const toSC = (s)=>{ const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
 try{
   const config=require('../../config');
   let botId=sock.user?.id?.split(":")[0].split("@")[0]||""
   let sender=m.sender.split("@")[0]
   let isOwner = sender===botId
   let isSudo = config.SUDO? config.SUDO.includes(sender) || config.SUDO.includes(m.sender) : false
   let isSubBot = m.isSubBot || false

   if(!isOwner &&!isSudo &&!isSubBot){
     await sock.sendMessage(m.chat,{react:{text:"❌",key:m.key}});
     return await sock.sendMessage(m.chat,{text:`${toSC("quantum clearance required")}\n${toSC("owner or sudo or subbot only")}\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m})
   }

   if(!fs.existsSync('./src/database')) fs.mkdirSync('./src/database',{recursive:true});
   if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({},null,2));
   let db=JSON.parse(fs.readFileSync(path));

   let code=(args[0]||"").toLowerCase();

   if(!code){
     let list=Object.entries(langs).map(([c,n])=>`${c} - ${n}`).join("\n");
     return await sock.sendMessage(m.chat,{text:`${toSC("set language for this subbot only")}\n\n${toSC("usage")}:.setlanguage fr\n${toSC("current")}: ${db[botId]||"en"} (${langs[db[botId]]||"English"})\n\n${toSC("supported all languages")}:\n${list}\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m})
   }

   if(!langs[code]) return await sock.sendMessage(m.chat,{text:`${toSC("invalid code")}. ${toSC("try")}.setlanguage list`},{quoted:m});

   db[botId]=code;
   fs.writeFileSync(path, JSON.stringify(db,null,2));

   // translate confirmation
   let confirm=`Language set to ${langs[code]} (${code}) for this subbot only. Everything will now respond in ${langs[code]}`;
   // quick translate confirmation using same api
   try{
     const axios=require('axios');
     let url=`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${code}&dt=t&q=${encodeURIComponent(confirm)}`;
     let res=await axios.get(url);
     confirm=res.data[0].map(x=>x[0]).join("");
   }catch{}

   await sock.sendMessage(m.chat,{text:`${confirm}\n\n> ${toSC("powered by storm")} 𝐗`},{quoted:m});

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
