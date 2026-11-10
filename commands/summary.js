function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

export default{
name:"summary",
aliases:["summ","summarize","sum"],
execute: async(sock,m,args)=>{
 try{
  let textToSumm = "";

  // If reply to a message
  if(m.quoted){
   textToSumm = m.quoted.text || m.quoted.body || "";
  }

  // If user typed after command
  if(args[0]){
   textToSumm = args.join(" ");
  }

  if(!textToSumm || textToSumm.length < 10){
   return await sock.sendMessage(m.chat,{text:`${toSC("usage: reply to long text with.summary or.summary your long text")}`},{quoted:m});
  }

  await sock.sendMessage(m.chat,{react:{text:"📝",key:m.key}});

  let apiKey = process.env.GROQ_API_KEY;

  let res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
   method:"POST",
   headers:{
    "Authorization":`Bearer ${apiKey}`,
    "Content-Type":"application/json"
   },
   body: JSON.stringify({
    model:"llama-3.3-70b-versatile",
    messages:[
     {role:"system",content:"You are a summarizer. Summarize the text in 3-5 short bullet points, very clear, cyber style, no fluff."},
     {role:"user",content:`Summarize this:\n\n${textToSumm.slice(0,6000)}`}
    ],
    max_tokens:500,
    temperature:0.3
   })
  });

  let data = await res.json();
  let summary = data.choices?.[0]?.message?.content || `${toSC("summary error")}`;

  let txt = `*${toSC("summary pro")}* 📝\n\n${summary}\n\n> ${toSC("powered by storm cyber md")}`;

  await sock.sendMessage(m.chat,{text:txt},{quoted:m});
  await sock.sendMessage(m.chat,{react:{text:"✅",key:m.key}});

 }catch(e){
  console.log(e);
  await sock.sendMessage(m.chat,{text:`${toSC("summary failed")}`},{quoted:m});
 }
}
}
