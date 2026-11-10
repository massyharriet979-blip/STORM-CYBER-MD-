function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"ai",
alias:["gpt2","stormai2","chat"],
execute: async(sock, m, args)=>{
 try{
  let q = args.join(" ") || m.quoted?.text || ""
  if(!q){
   return sock.sendMessage(m.chat,{
    text:`╭══〘 🤖 𝐀𝐈 〙══⊷❍
┃ ${toSmallCaps("ask anything")}
┃ ${toSmallCaps("example: .ai who is storm x")}
┃
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}`
   },{quoted:m})
  }

  await sock.sendMessage(m.chat,{react:{text:"🤖",key:m.key}}).catch(()=>{})

  await new Promise(r=>setTimeout(r,800))

  let reply = `I understand you asked: "${q}".\n\nAs STORM CYBER MD AI, I can help you with coding, WhatsApp bot, cyber security, and general knowledge. Ask me anything, I'm here to help you build and learn.`;

  // Try real API if available, else use simulation
  try{
   let res = await fetch(`https://api.nexoracle.com/ai/chatgpt?apikey=free&q=${encodeURIComponent(q)}`).then(r=>r.json()).catch(()=>null)
   if(res && res.result) reply = res.result
  }catch{}

  let txt = `
╭══〘 🤖 𝐒𝐓𝐎𝐑𝐌 𝐀𝐈 〙══⊷❍
┃ ${toSmallCaps("question")}: ${q}
┃
┃ ${reply}
┃
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}
`
  await sock.sendMessage(m.chat,{text:txt.trim()},{quoted:m})
 }catch(e){console.log(e)}
}
};
