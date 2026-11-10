function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"stormai",
aliases:["ai","gpt","storm","ask"],
execute: async(sock,m,args)=>{
 try{
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.stormai your question")}\n${toSC("ex:.stormai what is phishing")}`},{quoted:m});
  }
  await sock.sendMessage(m.chat,{react:{text:"🤖",key:m.key}});

  let prompt = args.join(" ");
  let apiKey = process.env.GROQ_API_KEY;

  if(!apiKey){
   return await sock.sendMessage(m.chat,{text:`${toSC("groq_api_key not found in host env")}`},{quoted:m});
  }

  let res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
   method:"POST",
   headers:{
    "Authorization":`Bearer ${apiKey}`,
    "Content-Type":"application/json"
   },
   body: JSON.stringify({
    model:"llama-3.3-70b-versatile",
    messages:[
     {role:"system",content:"You are Storm Cyber MD AI, built by Storm. You are helpful, cyber, short and smart. No long paragraphs."},
     {role:"user",content:prompt}
    ],
    max_tokens:1000,
    temperature:0.7
   })
  });

  let data = await res.json();

  if(data.error){
   return await sock.sendMessage(m.chat,{text:`${toSC("ai error")}: ${data.error.message}`},{quoted:m});
  }

  let reply = data.choices?.[0]?.message?.content || `${toSC("no response from ai")}`;

  let txt = `*${toSC("storm ai pro")}* 🧠\n\n${reply}\n\n> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  console.log(e);
  await sock.sendMessage(m.chat,{text:`${toSC("storm ai pro offline - check logs")}`},{quoted:m});
 }
}
}
