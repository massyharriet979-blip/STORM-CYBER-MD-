const fs=require('fs')
const {downloadMediaMessage}=require('@whiskeysockets/baileys')

const flipMap={
a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',k:'ʞ',l:'ʅ',m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z',
A:'∀',B:'𐐒',C:'Ɔ',D:'ᗡ',E:'Ǝ',F:'Ⅎ',G:'פ',H:'H',I:'I',J:'ſ',K:'ʞ',L:'˥',M:'W',N:'N',O:'O',P:'Ԁ',Q:'Ό',R:'ᴚ',S:'S',T:'⊥',U:'∩',V:'Λ',W:'M',X:'X',Y:'⅄',Z:'Z',
'0':'0','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6',',':"'",'.':'˙','?':'¿','!':'¡','"':',,',"'":',','`':',','(' : ')',')':'(','[':']',']':'[','{':'}','}':'{','<':'>','>':'<','&':'⅋','_':'‾'
}
function flipText(t){
 return t.split('').map(c=>flipMap[c]||flipMap[c.toLowerCase()]||c).reverse().join('')
}

module.exports={
name:"flip",
aliases:["flop","reverse","coinflip"],
execute: async(sock,m,args)=>{
 try{
  let q=m.quoted? m.quoted : m
  let mime=(q.msg?.mimetype||q.mimetype||"").toLowerCase()

  // 1. If image quoted -> flip image
  if(mime.includes("image") && m.quoted){
    try{
      await sock.sendMessage(m.chat,{text:"ғʟɪᴘᴘɪɴɢ ɪᴍᴀɢᴇ..."},{quoted:m})
      let buf=await downloadMediaMessage(q, 'buffer', {})
      const Jimp= require('jimp')
      let image=await Jimp.read(buf)
      image.flip(true,false) // horizontal
      let out=await image.getBufferAsync(Jimp.MIME_JPEG)
      return await sock.sendMessage(m.chat,{image:out, caption:`ғʟɪᴘᴘᴇᴅ ✅\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ sᴛᴏʀᴍ x`},{quoted:m})
    }catch(e){ console.log(e) }
  }

  // 2. If text provided -> flip text
  let text=args.join(" ")||m.quoted?.text||m.quoted?.caption||""
  if(text){
    let flipped=flipText(text)
    return await sock.sendMessage(m.chat,{text:`*ᴏʀɪɢɪɴᴀʟ:* ${text}\n*ғʟɪᴘᴘᴇᴅ:* ${flipped}`},{quoted:m})
  }

  // 3. No args -> coin flip
  let coin=Math.random()>0.5?"HEADS":"TAILS"
  let emoji=coin==="HEADS"?"🪙 ✨":"🪙 💫"
  await sock.sendMessage(m.chat,{text:`${emoji}\nғʟɪᴘᴘᴇᴅ: *${coin}*`},{quoted:m})

 }catch(e){ await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m}) }
}
}
