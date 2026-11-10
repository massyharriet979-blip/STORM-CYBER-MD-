function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

global.voiceCache = global.voiceCache || new Map();

export default{
name:"voice",
aliases:["speak","tts","say"],
execute: async(sock,m,args)=>{
 try{
  // HANDLE BUTTON CLICK
  let btnId = m.message?.buttonsResponseMessage?.selectedButtonId || m.message?.templateButtonReplyMessage?.selectedId || m.body || "";

  if(btnId.startsWith("voice_")){
   let parts = btnId.split("_");
   let gender = parts[1]; // girl or boy
   let cacheId = parts[2];
   let text = global.voiceCache.get(cacheId);
   if(!text) return await sock.sendMessage(m.chat,{text:`${toSC("voice cache expired, send.voice again")}`},{quoted:m});

   await sock.sendMessage(m.chat,{react:{text: gender==="girl"?"🎀":"🧢",key:m.key}});

   // REAL VOICE - Free Streamelements API
   let voiceName = gender === "girl"? "Emma" : "Brian";
   let ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voiceName}&text=${encodeURIComponent(text.slice(0,900))}`;

   await sock.sendMessage(m.chat,{
    audio:{url:ttsUrl},
    mimetype:'audio/mpeg',
    ptt:true
   },{quoted:m});

   return;
  }

  // NORMAL COMMAND
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.voice what is storm md")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"🔊",key:m.key}});

  let prompt = args.join(" ");
  let apiKey = process.env.GROQ_API_KEY;

  // SEARCH / AI ANSWER
  let res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
   method:"POST",
   headers:{
    "Authorization":`Bearer ${apiKey}`,
    "Content-Type":"application/json"
   },
   body: JSON.stringify({
    model:"llama-3.3-70b-versatile",
    messages:[
     {role:"system",content:"You are Storm Cyber MD voice assistant. Answer short, clear, under 100 words for voice."},
     {role:"user",content:prompt}
    ],
    max_tokens:400
   })
  });

  let data = await res.json();
  let answer = data.choices?.[0]?.message?.content || `${toSC("voice search failed")}`;

  // SAVE TO CACHE
  let cacheId = Date.now().toString();
  global.voiceCache.set(cacheId, answer);

  // SEND TEXT RESULT
  let txt = `*${toSC("voice pro")}* 🔊\n\n${answer}\n\n> ${toSC("choose voice below")}`;
  await sock.sendMessage(m.chat,{text:txt},{quoted:m});

  // SEND 2 BUTTONS - GIRL & BOY
  let buttons = [
   {buttonId:`voice_girl_${cacheId}`, buttonText:{displayText:`🎀 ${toSC("girl voice")}`}, type:1},
   {buttonId:`voice_boy_${cacheId}`, buttonText:{displayText:`🧢 ${toSC("boy voice")}`}, type:1}
  ];

  await sock.sendMessage(m.chat,{
   text:`*${toSC("select voice type")}* 👇`,
   buttons:buttons,
   headerType:1
  },{quoted:m});

  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  console.log(e);
  await sock.sendMessage(m.chat,{text:`${toSC("voice error")}`},{quoted:m});
 }
}
}
