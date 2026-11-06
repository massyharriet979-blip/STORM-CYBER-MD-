function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}
import axios from 'axios'
import fs from 'fs'

export default {
name:"aivoice",
alias:["aivoicenote","askvoice","voicereply"],
execute: async(sock, m, args)=>{
 try{
  // SUBBOT OWNER = LINKED DEVICE OWNER (not main creator)
  // He owns his own instance
  if(!m.isOwner &&!m.isSubBotOwner){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted")}\n\n${toSmallCaps("quantum clearance required, owner only")}`},{quoted:m})
  }

  let q = args.join(' ')
  if(!q){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("ask something for voice reply")}\n\n${toSmallCaps("example:.aivoice what is ai")}`},{quoted:m})
  }

  // simple AI answer - you can replace with your AI API
  let answer = `You asked: ${q}. Here is the answer from STORM AI. Storm Cyber MD is the most powerful WhatsApp bot with quantum clearance. ${q} is explained in detail by our AI engine.`

  // If you have OpenAI / Storm AI API, put it here:
  try{
   if(global.aiChat){
    let res = await global.aiChat(q)
    if(res) answer = res
   }
  }catch{}

  // TTS using Google
  let ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(answer.slice(0,200))}`
  let audioBuffer
  try{
   let {data} = await axios.get(ttsUrl,{responseType:'arraybuffer', headers:{'User-Agent':'Mozilla/5.0'}})
   audioBuffer = data
  }catch{
   // fallback
   audioBuffer = null
  }

  if(audioBuffer){
   await sock.sendMessage(m.chat,{
    audio: audioBuffer,
    mimetype:'audio/mp4',
    ptt:true
   },{quoted:m})
   await sock.sendMessage(m.chat,{text:`> ${toSmallCaps(answer.slice(0,300))}`},{quoted:m})
  }else{
   await sock.sendMessage(m.chat,{text:`${toSmallCaps("voice engine error, here text:")}\n\n${answer}`},{quoted:m})
  }

 }catch(e){ console.log(e) }
}
}
