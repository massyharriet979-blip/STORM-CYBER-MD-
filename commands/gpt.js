function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"gpt",
aliases:["gpt4","chatgpt"],
execute: async(sock,m,args)=>{
 try{
  if(!args[0]){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage:.gpt your question")}`},{quoted:m});
  }
  await sock.sendMessage(m.chat,{react:{text:"🧠",key:m.key}});

  let prompt = args.join(" ");
  let apiKey = process.env.GROQ_API_KEY;

  if(!apiKey){
   return await sock.sendMessage(m.chat,{text:`${toSC("groq_api_key not found in env")}`},{quoted:m});
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
     {role:"system",content:"You are ChatGPT powered by Storm Cyber MD. Helpful, concise, friendly."},
     {role:"user",content:prompt}
    ],
    max_tokens:1000
   })
  });

  let data = await res.json();
  let reply = data.choices?.[0]?.message?.content || "Error";

  let txt = `*${toSC("gpt pro")}* 🤖\n\n${reply}\n\n> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});
 }catch(e){
  await sock.sendMessage(m.chat,{text:`${toSC("gpt error")}`},{quoted:m});
 }
}
}
