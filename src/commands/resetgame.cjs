function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"resetgame",
alias:["cleargame","resetgames","rg","stopgame"],
execute: async(sock, m, args)=>{
 try{
  // OWNER + ALL LINKED DEVICES ONLY
  if(!m.isOwner &&!m.isSubBot &&!m.isSubBotOwner){
   return sock.sendMessage(m.chat,{text:`${toSmallCaps("restricted")}\n\n${toSmallCaps("quantum clearance required, owner only")}`},{quoted:m})
  }

  let count=0

  // clear all known game storages
  if(global.tictactoe) { count+=Object.keys(global.tictactoe).length; global.tictactoe={} }
  if(global.suit) { count+=Object.keys(global.suit).length; global.suit={} }
  if(global.games) { count+=Object.keys(global.games).length; global.games={} }
  if(global.chess) { count+=Object.keys(global.chess).length; global.chess={} }
  if(global.hangman) { count+=Object.keys(global.hangman).length; global.hangman={} }
  if(global.tebakgame) { count+=Object.keys(global.tebakgame).length; global.tebakgame={} }
  if(global.math) { count+=Object.keys(global.math).length; global.math={} }
  if(global.siapakahaku) { count+=Object.keys(global.siapakahaku).length; global.siapakahaku={} }
  if(global.family100) { count+=Object.keys(global.family100).length; global.family100={} }
  if(global.tebakkata) { count+=Object.keys(global.tebakkata).length; global.tebakkata={} }
  if(global.caklontong) { count+=Object.keys(global.caklontong).length; global.caklontong={} }
  if(global.kuis) { count+=Object.keys(global.kuis).length; global.kuis={} }

  // clear game in this chat too
  if(global.db && global.db.data && global.db.data.game){
   delete global.db.data.game[m.chat]
  }

  await sock.sendMessage(m.chat,{text:`╭━─━─❰ 𝐆𝐀𝐌𝐄 𝐑𝐄𝐒𝐄𝐓 ❱─━─━╮\n┃ ${toSmallCaps(`all games cleared ✅`)}\n┃ ${toSmallCaps(`total cleared: ${count} active games`)}\n┃ ${toSmallCaps(`chat: ${m.isGroup? "group reset" : "private reset"}`)}\n┃ ${toSmallCaps(`status: ready for new games`)}\n╰━━━━━━━━━━━━━━━╯\n> ${toSmallCaps("powered by storm x")}`},{quoted:m})

 }catch(e){ console.log(e) }
}
}
