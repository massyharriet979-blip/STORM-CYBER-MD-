import fs from 'fs';
import path from 'path';
const DIR = './src/database/admintracker';

export function trackAdmin(m){
 try{
  if(!m.isGroup) return;
  let groupId = m.chat;
  if(!m.sender) return;

  fs.mkdirSync(DIR,{recursive:true});
  let file = path.join(DIR, groupId.replace(/[^0-9@]/g,'_')+'.json');
  let data = {};
  if(fs.existsSync(file)){
   try{ data = JSON.parse(fs.readFileSync(file)); }catch{ data = {}; }
  }
  if(!data[groupId]) data[groupId] = {};
  let today = new Date().toISOString().split('T')[0];

  let jid = m.sender;
  if(!data[groupId][jid]){
   data[groupId][jid] = { msgs:0, days:[], last:"", media:0, chars:0, words:0, first: Date.now() };
  }
  data[groupId][jid].msgs += 1;
  data[groupId][jid].last = new Date().toISOString();
  if(!data[groupId][jid].days.includes(today)) data[groupId][jid].days.push(today);
  if(m.type!== "conversation" && m.type!== "extendedTextMessage") data[groupId][jid].media += 1;
  data[groupId][jid].chars += (m.body?.length || 0);
  data[groupId][jid].words += (m.body?.split(' ').length || 0);

  fs.writeFileSync(file, JSON.stringify(data,null,2));
 }catch{}
}
