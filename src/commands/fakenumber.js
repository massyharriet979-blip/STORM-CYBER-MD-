function toSC(s){
const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

function genNum(cc, len=9){
 let num = cc;
 for(let i=0;i<len;i++) num += Math.floor(Math.random()*10);
 return "+" + num;
}

export default{
name:"fakenumber",
aliases:["fakenn","fakenum","fake"],
execute: async(sock,m,args)=>{

 let countries = {
  usa: "1",
  uk: "44",
  tanzania: "255",
  uganda: "256",
  kenya: "254",
  india: "91",
  nigeria: "234",
  za: "27",
  pak: "92"
 };

 let input = args[0]?.toLowerCase();

 if(!input){
  let keys = Object.keys(countries);
  let random = keys[Math.floor(Math.random()*keys.length)];
  let num = genNum(countries[random], 9);

  return await sock.sendMessage(m.chat,{
   text:`*🎭 ${toSC("fake number generator")}*\n\n*${toSC("country")}:* ${random.toUpperCase()}\n*${toSC("number")}:* ${num}\n\n> ${toSC("this is fake number for fun only")}`,
   footer: toSC("storm fake generator"),
   buttons:[
    {buttonId:`.fakenumber`, buttonText:{displayText:`🎲 ${toSC("random")}`}, type:1},
    {buttonId:`.fakenumber usa`, buttonText:{displayText:`🇺🇸 ${toSC("usa")}`}, type:1},
    {buttonId:`.fakenumber uk`, buttonText:{displayText:`🇬🇧 ${toSC("uk")}`}, type:1},
   ],
   headerType:1
  },{quoted:m});
 }

 if(countries[input]){
  let num = genNum(countries[input], 9);
  return await sock.sendMessage(m.chat,{
   text:`*🎭 ${toSC("fake number")}*\n\n*${toSC("country")}:* ${input}\n*${toSC("number")}:* ${num}`,
   footer: toSC("fake only"),
   buttons:[
    {buttonId:`.fakenumber ${input}`, buttonText:{displayText:`🔁 ${toSC("again")}`}, type:1},
    {buttonId:`.fakenumber`, buttonText:{displayText:`🎲 ${toSC("random")}`}, type:1},
   ],
   headerType:1
  },{quoted:m});
 }

 // if user typed code like 255
 if(/^[0-9]+$/.test(input)){
  let num = genNum(input, 9);
  return await sock.sendMessage(m.chat,{
   text:`*🎭 ${toSC("fake number")}:* ${num}`,
   footer: toSC("fake only"),
   buttons:[
    {buttonId:`.fakenumber ${input}`, buttonText:{displayText:`🔁 ${toSC("again")}`}, type:1},
   ],
   headerType:1
  },{quoted:m});
 }

 // list
 let list = Object.keys(countries).map(c=>`• ${c} - +${countries[c]}`).join("\n");
 return await sock.sendMessage(m.chat,{
  text:`*${toSC("available countries")}*\n\n${list}\n\n*${toSC("example")}:*.fakenumber usa\n*${toSC("example")}:*.fakenumber 255`,
  footer: toSC("choose country"),
  buttons:[
   {buttonId:`.fakenumber usa`, buttonText:{displayText:`🇺🇸 usa`}, type:1},
   {buttonId:`.fakenumber tanzania`, buttonText:{displayText:`🇹🇿 tanzania`}, type:1},
  ],
  headerType:1
 },{quoted:m});

}
}
