function toSmallCaps(t){
 const m={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}
 return t.toLowerCase().split('').map(c=>m[c]||c).join('')
}

const COMMANDS = [
"8ball","acceptall","add","addsudo","addvoice","admintracker","age","ai","aivoice","alive","allvar","allow","anime","antibot","anticall","antidelete","antidemote","antigroupmention","antilink","antipromote","antispam","antiword","apk","asphalt","autoapprove","autokickbot","autolike","automute","autoreact","autoreply","autostatus","autotyping","autounmute","avmix","ban","bass","base64","binary","bing","black","block","boatrace","bot","botinfo","botnet","botstatus","bruteforce","bug-menu","buyprem","callblock","calculate","cancel","cancelprocess","carpark","channel","channel-icon","channelinfo","chatgpt","chess","circle","clear","cloneid","cntd","coinflip","colorize","common","compliment","compress","copilot","couple","cracker","crash","creategroup","cricket","crush","cuddle","cyberkill","cyberkira","cybernews","cyberstrike","dalle","dare","dark","darklaw","darknet","ddos","ddosattack","deathbomb","deathlaw","deathwrite","decrypt","deface","delallow","delete","deletechannel","delsudo","delvar","demote","destroy","device","dice","diff","disk","diskinfo","doc","drift","edit","encrypt","end","ephoto","exploit","exploitdb","f1","fact","fakenumber","fancy","fast","find","flip","flipcoin","flower","follow","football","forward","freezegc","gamer","gamers","games","gc-desc","gc-icon","gc-id","gcid","gdesc","gemini","getbot","getchannelowner","getchannerowner","getjids","getstick","getvar","ghosthack","ghostmode","gif","google","goodbye","gpt","grantsudoaccess","group","groups","gstatus","guess","hack","hacktool","hangman","hash","hide","hidetag","horoscope","horror","hug","ig","image","imagine","img","inactive","info","install","interp","invite","ipdrone","iplookup","jadibot","jet","jid","join","joinchannel","joke","karaoke","keylog","kick","kickadmin","kickall","kill","kirajudge","kiss","lag","language","leave","leavechannel","link","list","listactive","listinactive","listsudo","liveposter","livescore","locate","lock2","logo","love","ludo","lyrics","markuser","math","meme","mention","menu","menu2","midjourney","mode","motogp","mp3","mp4","msgs","mute","mute2","nba","newsletter","nfs","notenuke","nukegc","online","onlineoff","out","owner","ownerinfo","pair","pat","payload","pdf","phishcheck","phishgen","photo","ping","ping2","ping3","ping4","pinterest","platform","play","play2","plugin","pmylock","portscan","potscan","pp","ppcouple","premium","private","promote","public","qr","qrscan","quiz","quote","ratgen","react","rebot","reboot","rejectall","reload","removebg","repo","requests","resetgame","resetlink","resetprocess","resetwarn","restart","restgames","retry","revoke","riddle","ringtone","roast","rotate","ryukcrash","schedule","scheduled","screenshot","self","send","server","setaudiomenu","setgoodbye","setimage","setinfo","setlanguage","setname","setowner","setppgroup","setprefix","setsudo","setvar","setwarnlimit","setwelcome","settings","shadowyan","shazam","shield","shinigamiyug","ship","shorten","shutdown","slap","slot","slow","slowmo","sniffer","song","song2","spam","spam2","spamyug","speed","spoof","sports","spotify","sqlinject","square","stablediff","statussaver","sticker","stormai","story","story2","styletext","summary","superban","superman","support","tag","tagadmin","take","take-gc","takegcowner","tempmail","testalive","textmaker","tictactoe","tiktok","tocartoon","togstatus","track","trackgcowner","trackip","translate","translate2","trim","truck","truth","tts","unban","unblock","unfollow","unmute","unmute2","unshort","unstick","update","upscale","uptime","url","userid","user-id","users","vcard","video","vip","virus","virusbug","voice","vote","vulnscan","vv","vv2","vv3","wachannel","wallpaper","warn","warnings","warnlimit","warnlist","warnstatus","weather","webscan","welcome","whois","wifihack","wiki","wordgame","write","xssattack","youtube","yts","ytv"
].sort();

export default {
name:"list",
alias:["commands","listcmd","allcmd"],
execute: async(sock, m, args)=>{
 try{
  let prefix = m.prefix || "."
  let listText = COMMANDS.map((c,i)=>`${i+1}. ${prefix}${c}`).join("\n")

  let txt = `
╭══〘 📜 𝐂𝐎𝐌𝐀𝐍𝐃 𝐋𝐈𝐒𝐓 〙══⊷❍
┃ ${toSmallCaps("total commands")}: ${COMMANDS.length}
┃ ${toSmallCaps("sorted alphabetically")}
┃
┃ ${listText}
┃
╰═══════════════════⊷❍
> ${toSmallCaps("powered by storm cyber md")}
`

  // View Channel button, no link shown in text
  // Using templateButtons for View Channel
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
   // Newsletter context - makes it look like from channel
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

  await sock.sendMessage(m.chat,{react:{text:"📜",key:m.key}}).catch(()=>{})

 }catch(e){
  console.log(e)
  // Fallback if buttons fail
  try{
   await sock.sendMessage(m.chat,{text: "List failed, try again"},{quoted:m})
  }catch{}
 }
}
};
