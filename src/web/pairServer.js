import express from 'express'
import cors from 'cors'
import fs from 'fs'

const app = express()
app.use(cors({origin:'*'})); app.use(express.json())
const PORT = process.env.PORT || process.env.SERVER_PORT || 2505
// DELETED: tempSockets - no more ./temp_pair/ socket, no more copy on open
// DELETED: makeWASocket import - Web never creates socket anymore, engine does

function statusOf(n){
  const id=(n||'').replace(/[^0-9]/g,'')
  if(!id) return {paired:false,connected:false,message:"NUMBER REQUIRED"}
  const credsExists=fs.existsSync(`./sessions/${id}/creds.json`)
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
    const dirs=fs.existsSync('./sessions')?fs.readdirSync('./sessions').filter(d=>fs.existsSync(`./sessions/${d}/creds.json`)):[]
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
    if(!id) return res.status(400).json({error:"NUMBER REQUIRED"})
    if(global.subbots?.has(id)) return res.json({status:"ALREADY_CONNECTED", ...statusOf(id)})
    // DELETED: global.pairingInProgress check - pairManager handles double-start via _sessionStarts
    const mainNum = (process.env.MAIN_NUMBER||'').replace(/[^0-9]/g,'')
    if(mainNum && id === mainNum) return res.status(400).json({error:"CANNOT PAIR MAIN BOT NUMBER"})

    if(typeof global.requestPairFromEngine !== 'function'){
      return res.status(500).json({error:"ENGINE NOT READY - RESTART BOT"})
    }

    // STEP 4: Web now uses SAME engine as Telegram - startSession + getPairingCode
    // No temp_pair, no 2nd socket, no copy on open.
    // If user does not enter code in 5 min, Telegram pending expiry / next startSession clears it.
    // Web does NOT auto-delete on timeout - next /pair will clear incomplete via startSession.
    const formatted = await global.requestPairFromEngine(id, {
      onConnected: () => {
        console.log(`✅ WEB PAIR CONNECTED ${id}`)
      }
    })

    res.json({status:"CODE_SENT", code:formatted, copy:formatted.replace(/-/g,''), formatted:formatted, number:id, message:"CODE GENERATED - ENTER IT IN WHATSAPP"})
  }catch(e){
    const nid=(req.body.number||'').replace(/[^0-9]/g,'');
    const msg = String(e.message || '').toUpperCase()
    // Map engine errors to your old Web messages
    if(msg.includes('ALREADY CONNECTED') || msg.includes('ALREADY REGISTERED')){
      return res.json({status:"ALREADY_CONNECTED", ...statusOf(nid)})
    }
    if(msg.includes('ALREADY PAIRING')){
      return res.json({status:"PAIRING_IN_PROGRESS",message:"WAIT 60S - PAIRING IN PROGRESS FOR THIS NUMBER"})
    }
    res.status(500).json({error:msg})
  }
})

app.post('/api/disconnect',async (req,res)=>{
  const id=(req.body.number||'').replace(/[^0-9]/g,'');
  if(!id) return res.status(400).json({error:"NUMBER REQUIRED"})
  try{
    // Use pairManager clearSession - closes socket + clears timers + deletes folder
    if(typeof global.clearSession === 'function'){
      await global.clearSession(id)
    } else {
      try{global.subbots?.get(id)?.ws?.close()}catch{}
      try{global.subbots?.delete(id)}catch{}
    }
  }catch{}
  try{
    if(global.reconnectTimers?.has(id)){
      clearTimeout(global.reconnectTimers.get(id))
      global.reconnectTimers.delete(id)
    }
  }catch{}
  try{ if(global.sessionMeta?.has(id)) global.sessionMeta.delete(id) }catch{}
  // clearSession already deleted ./sessions/${id}, but keep fallback if old path used
  if(fs.existsSync(`./sessions/${id}`) && typeof global.clearSession !== 'function') fs.rmSync(`./sessions/${id}`,{recursive:true,force:true});
  // Clean any leftover temp_pair from OLD version
  if(fs.existsSync(`./temp_pair/${id}`)) fs.rmSync(`./temp_pair/${id}`,{recursive:true,force:true});
  res.json({success:true, message:`${id} DISCONNECTED SUCCESSFULLY`})
})

export function startPairServer(){ app.listen(PORT, '0.0.0.0', ()=>console.log(`✅ PAIR SERVER ONLINE ${PORT}`)) }
