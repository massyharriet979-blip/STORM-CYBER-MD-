function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

const signs = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"]

export default {
name:"horoscope",
alias:["ʜᴏʀᴏsᴄᴏᴘᴇ","zodiac","horoskop"],
execute: async(sock, m, args)=>{
 try{
  if(!m.isOwner &&!m.isCreator &&!m.key.fromMe){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("only subbot owner")}`},{quoted:m})
  }

  let sign = args[0]?.toLowerCase()
  if(!sign ||!signs.includes(sign)){
    return sock.sendMessage(m.chat,{text:`${toSmallCaps("usage:.horoscope aries")}\n${toSmallCaps("signs:")} ${signs.join(", ")}`},{quoted:m})
  }

  await sock.sendMessage(m.chat,{text:`${toSmallCaps("reading horoscope for")} ${sign}...`},{quoted:m})

  let api = `https://api.akuari.my.id/other/horoscope?zodiac=${sign}`
  let res = await fetch(api)
  let json = await res.json()

  let data = json.result || json

  let txt = `◈ ${toSmallCaps("horoscope")}: ${sign.toUpperCase()} ♈

${toSmallCaps("date:")} ${data.date || data.tanggal || new Date().toDateString()}
${toSmallCaps("zodiac:")} ${sign}

${toSmallCaps("horoscope:")}
${data.horoscope || data.ramalan || "No reading"}

${toSmallCaps("mood:")} ${data.mood || "-"}
${toSmallCaps("lucky color:")} ${data.color || data.warna || "-"}
${toSmallCaps("lucky number:")} ${data.number || data.nomor || "-"}

> sᴛᴏʀᴍ ᴄʏʙᴇʀ ᴍᴅ`

  await sock.sendMessage(m.chat,{text:txt},{quoted:m})

 }catch(e){console.log(e)}
}
}
