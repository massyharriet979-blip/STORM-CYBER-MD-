import fs from 'fs';
import path from 'path';

function toSC(s){
 const mp={a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
 return s.toLowerCase().split('').map(c=>mp[c]||c).join('');
}

const DIR = path.join(process.cwd(), 'database');
const FILE_W = 'welcome.json';

function ensureDir(){ if(!fs.existsSync(DIR)) fs.mkdirSync(DIR,{recursive:true}); }
function load(file){
 ensureDir();
 let p=path.join(DIR,file);
 if(!fs.existsSync(p)) return {};
 try{ return JSON.parse(fs.readFileSync(p)); }catch{ return {}; }
}
function save(file,data){
 ensureDir();
 fs.writeFileSync(path.join(DIR,file), JSON.stringify(data,null,2));
}

const WELCOME_IMG='https://files.catbox.moe/jtb63o.jpg';
const CHANNEL_JID='120363414065055650@newsletter';
const CHANNEL_LINK='https://whatsapp.com/channel/0029Vb8NIZf4SpkJvluL3G3P';

export async function handleWelcomeGoodbye(sock, anu, botId){
 try{
  const { id, participants, action } = anu;
  if(!id.endsWith('@g.us')) return;
  if(!participants || participants.length===0) return;

  let db = load(FILE_W);
  if(!db[id]) db[id] = { welcome: false, goodbye: false };
  // fix old format {enabled:true}
  if(typeof db[id].enabled === 'boolean'){
    db[id].welcome = db[id].enabled;
    delete db[id].enabled;
    save(FILE_W, db);
  }

  let meta;
  try{ meta = await sock.groupMetadata(id); }catch{ meta = { subject: "this group", participants: [] }; }
  let memCount = meta.participants?.length || 0;

  try{ await sock.newsletterFollow(CHANNEL_JID).catch(()=>{}); }catch{}

  if(action === 'add'){
    if(!db[id].welcome) return;
    for(let user of participants){
      let caption = toSC(`hello @${user.split('@')[0]} 👋

welcome to ${meta.subject} ✨

we're truly happy you joined us. you are now part of our family, feel at home, feel loved, you belong here.

stay active, be kind, let's grow and vibe together. your presence means a lot to us 💫

you are member number ${memCount}, we are so blessed to have you ❤️`);

      await sock.sendMessage(id,{
        image:{url:WELCOME_IMG},
        caption: caption,
        footer: toSC("powered by dark nova labs"),
        mentions:[user],
        templateButtons: [
          { index: 1, urlButton: { displayText: "✨ View Channel", url: CHANNEL_LINK } }
        ]
      });
    }
  }

  if(action === 'remove'){
    if(!db[id].goodbye) return;
    for(let user of participants){
      let caption = toSC(`goodbye @${user.split('@')[0]} 🥺

we will truly miss you from ${meta.subject}. thank you for being part of our journey, for the vibes and memories you shared.

wherever you go, we wish you love, peace and happiness. the door is always open for you to come back ❤️

we remain ${memCount} members, but a part of our family just left 💔`);

      await sock.sendMessage(id,{
        image:{url:WELCOME_IMG},
        caption: caption,
        footer: toSC("powered by dark nova labs"),
        mentions:[user],
        templateButtons: [
          { index: 1, urlButton: { displayText: "✨ View Channel", url: CHANNEL_LINK } }
        ]
      });
    }
  }

 }catch(e){
  console.log('welcomeGoodbye error', e.message);
 }
}

// keep default export also for compatibility
export default { handleWelcomeGoodbye };
