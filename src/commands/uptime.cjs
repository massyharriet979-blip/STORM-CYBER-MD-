module.exports={
name:"uptime",
aliases:["up","runtime"],
execute: async(sock,m)=>{
 try{
  const toSmallCaps = (str) => {
    const map = {
      a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ',
      A:'ᴀ',B:'ʙ',C:'ᴄ',D:'ᴅ',E:'ᴇ',F:'ғ',G:'ɢ',H:'ʜ',I:'ɪ',J:'ᴊ',K:'ᴋ',L:'ʟ',M:'ᴍ',N:'ɴ',O:'ᴏ',P:'ᴘ',Q:'ǫ',R:'ʀ',S:'s',T:'ᴛ',U:'ᴜ',V:'ᴠ',W:'ᴡ',X:'x',Y:'ʏ',Z:'ᴢ'
    };
    return str.split('').map(c=>map[c]||c).join('');
  };

  let msg = await sock.sendMessage(m.chat,{text: toSmallCaps("Checking servers...")},{quoted:m});

  await new Promise(r=>setTimeout(r,3000));

  await sock.sendMessage(m.chat,{text: toSmallCaps("Calculating..."), edit: msg.key});

  await new Promise(r=>setTimeout(r,1000));

  let up = process.uptime();
  let h = Math.floor(up / 3600);
  let min = Math.floor((up % 3600) / 60);
  let s = Math.floor(up % 60);
  let micro = Math.floor((up - Math.floor(up)) * 1000000);

  let date = new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'2-digit', year:'numeric'});

  let finalText = `
${toSmallCaps("cyber-md")}

${h} ${toSmallCaps("h")}
${min} ${toSmallCaps("m")}
${s} ${toSmallCaps("s")}
${micro} ${toSmallCaps("micro sec.")}
${toSmallCaps("Date")}: ${date}
`.trim();

  await sock.sendMessage(m.chat,{text: finalText, edit: msg.key});

 }catch(e){
  await sock.sendMessage(m.chat,{text:`ᴇʀʀ: ${e.message}`},{quoted:m})
 }
}
}
