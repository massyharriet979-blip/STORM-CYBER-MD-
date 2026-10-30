import express from 'express'
import cors from 'cors'
import fs from 'fs'
import makeWASocket, { useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'
const app = express()
app.use(cors({origin:'*'})); app.use(express.json())
const PORT = process.env.PORT || process.env.SERVER_PORT || 2505
const tempSockets = new Map()

function statusOf(n){
  const id=(n||'').replace(/[^0-9]/g,'')
  if(!id) return {paired:false,connected:false,message:"NUMBER REQUIRED"}
  const credsExists=fs.existsSync(`./sessions/${id}/creds.json`) || fs.existsSync(`./sessions/${id}`)
  const connected=global.subbots?.has(id)
  const meta=global.sessionMeta?.get(id)
  const isConn = connected || (meta && meta.isConnected)
  
  if(!credsExists){
    return {number:id, paired:false, connected:false, status:"not_paired", message:`${id} IS NOT PAIRED YET. NO NEED TO CHECK.`}
  }
  if(credsExists && !isConn){
    return {number:id, paired:true, connected:false, status:"paired_not_connected", message:`YOUR ${id} IS PAIRED BUT YOUR NUMBER IS NOT CONNECTED`}
  }
  return {number:id, paired:true, connected:true, status:"running", message:`${id} IS RUNNING SMOOTHLY IN WHATSAPP.`}
}

app.get('/', (req,res)=>{ res.send('STORM PAIR ONLINE - '+PORT) })

app.get('/api/stats',(req,res)=>{
  try{
    const dirs=fs.existsSync('./sessions')?fs.readdirSync('./sessions').filter(d=>d.length>=10):[]
    res.json({total:dirs.length, connected:global.subbots?.size||0, disconnected:dirs.length-(global.subbots?.size||0), paired:dirs.length})
  }catch{ res.json({total:0, connected:0, disconnected:0, paired:0}) }
})

app.post('/api/status',(req,res)=>{
  const num = req.body.number || req.query.number || ''
  res.json(statusOf(num))
})

app.get('/api/status',(req,res)=>{
  const num = req.query.number || ''
  res.json(statusOf(num))
})

app.post('/api/pair',async(req,res)=>{
  try{
    let id=(req.body.number||'').replace(/[^0-9]/g,'')
    if(!id) return res.status(400).json({error:"number required"})
    if(global.subbots?.has(id)) return res.json({status:"already_connected", ...statusOf(id)})
    if(global.pairingInProgress?.has(id)) return res.json({status:"pairing_in_progress",message:"Wait 60s - pairing in progress"})
    global.pairingInProgress?.add(id)
    const tmp=`./temp_pair/${id}`; fs.mkdirSync(tmp,{recursive:true})
    const {state,saveCreds}=await useMultiFileAuthState(tmp)
    const {version}=await fetchLatestBaileysVersion()
    const sock=makeWASocket({version, logger:pino({level:'silent'}), auth:{creds:state.creds, keys:makeCacheableSignalKeyStore(state.keys,pino({level:'silent'}))}, browser:Browsers.ubuntu('Chrome')})
    sock.ev.on('creds.update',saveCreds); await new Promise(r=>setTimeout(r,2000))
    let code=await sock.requestPairingCode(id); let formatted=code.match(/.{1,4}/g).join('-')
    tempSockets.set(id,sock)
    const to=setTimeout(()=>{tempSockets.delete(id); global.pairingInProgress?.delete(id); try{fs.rmSync(tmp,{recursive:true,force:true})}catch{}},120000)
    sock.ev.on('connection.update',u=>{if(u.connection==='open'){clearTimeout(to); const real=`./sessions/${id}`; fs.mkdirSync(real,{recursive:true}); try{fs.cpSync(tmp,real,{recursive:true})}catch{}; try{fs.rmSync(tmp,{recursive:true,force:true})}catch{}; tempSockets.delete(id); global.pairingInProgress?.delete(id); if(global.startSubBotSession) global.startSubBotSession(id)}})
    res.json({status:"code_sent", code:formatted, copy:formatted.replace(/-/g,''), formatted:formatted, number:id})
  }catch(e){ const nid=(req.body.number||'').replace(/[^0-9]/g,''); global.pairingInProgress?.delete(nid); res.status(500).json({error:e.message}) }
})

app.post('/api/disconnect',(req,res)=>{
  const id=(req.body.number||'').replace(/[^0-9]/g,''); try{global.subbots?.get(id)?.ws?.close()}catch{}; try{global.subbots?.delete(id)}catch{}; if(fs.existsSync(`./sessions/${id}`)) fs.rmSync(`./sessions/${id}`,{recursive:true,force:true}); res.json({success:true, message:`${id} DISCONNECTED`})
})

export function startPairServer(){ app.listen(PORT, '0.0.0.0', ()=>console.log(`✅ PAIR SERVER ONLINE ${PORT}`)) }
