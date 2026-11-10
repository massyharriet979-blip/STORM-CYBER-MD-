function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

export default {
name:"games",
alias:["enginegames","cargames","racing"],
execute: async(sock, m, args)=>{
 try{
  let prefix = m.prefix || "."

  let txt = `
╭══〘 🏎️ 𝐄𝐍𝐆𝐈𝐍𝐄 𝐆𝐀𝐌𝐄𝐒 〙══⊷❍
┃ ${toSmallCaps("only engine games")}
┃ ${toSmallCaps("cars, lorry, bike, race")}
┃
┃ 1. ${prefix}asphalt - ${toSmallCaps("asphalt racing")}
┃ 2. ${prefix}carpark - ${toSmallCaps("car parking")}
┃ 3. ${prefix}drift - ${toSmallCaps("drift race")}
┃ 4. ${prefix}f1 - ${toSmallCaps("formula 1")}
┃ 5. ${prefix}motogp - ${toSmallCaps("moto gp bike")}
┃ 6. ${prefix}boatrace - ${toSmallCaps("boat race")}
┃ 7. ${prefix}truck - ${toSmallCaps("lorry / truck simulator")}
┃ 8. ${prefix}jet - ${toSmallCaps("jet race")}
┃ 9. ${prefix}gamer - ${toSmallCaps("gamer mode")}
┃ 10. ${prefix}gamers - ${toSmallCaps("gamers hub")}
┃ 11. ${prefix}ludo - ${toSmallCaps("ludo")}
┃ 12. ${prefix}chess - ${toSmallCaps("chess")}
┃ 13. ${prefix}tictactoe - ${toSmallCaps("tic tac toe")}
┃ 14. ${prefix}hangman - ${toSmallCaps("hangman")}
┃ 15. ${prefix}slot - ${toSmallCaps("slot machine")}
┃ 16. ${prefix}dice - ${toSmallCaps("dice")}
┃ 17. ${prefix}wordgame - ${toSmallCaps("word game")}
┃ 18. ${prefix}guess - ${toSmallCaps("guess game")}
┃ 19. ${prefix}quiz - ${toSmallCaps("quiz game")}
┃ 20. ${prefix}math - ${toSmallCaps("math game")}
┃
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}
`

  await sock.sendMessage(m.chat,{
   text: txt.trim(),
   footer: "STORM CYBER MD",
   templateButtons: [
    {
     index: 1,
     urlButton: {
      displayText: "📢 View Channel",
      url: "https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P"
     }
    }
   ],
   contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
     newsletterJid: "120363414065055650@newsletter",
     newsletterName: "STORM X-CYBER_MD",
     serverMessageId: 1
    }
   }
  },{quoted:m})

  await sock.sendMessage(m.chat,{react:{text:"🏎️",key:m.key}}).catch(()=>{})
 }catch(e){console.log(e)}
}
};
