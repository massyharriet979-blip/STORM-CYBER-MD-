import express from 'express'
import cors from 'cors'
import fs from 'fs'
import makeWASocket, { useMultiFileAuthState, Browsers, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'
const app=express()
app.use(cors({origin:'*'}));app.use(express.json())
const PORT=process.env.PORT||process.env.SERVER_PORT||2505
const tempSockets=new Map()
app.get('/',(req,res)=>res.send('PAIR ONLINE'))
app.get('/api/stats',(req,res)=>{try{const d=fs.existsSync('./sessions')?fs.readdirSync('./sessions').filter(x=>x.length>=10):[];res.json({total:d.length,connected:global.subbots?.size||0,disconnected:d.length-(global.subbots?.size||0),paired:d.length})}catch{res.json({total:0,connected:0,disconnected:0,paired:0})}})
app.post('/api/status',(req,res)=>res.json(statusOf(req.body.number||'')))
app.post('/api/disconnect',(req,res)=>{const id=(req.body.number||'').replace(/[^0-9]/g,'');try{global.subbots?.delete(id)}catch{};if(fs.existsSync('./sessions/'+id))fs.rmSync('./sessions/'+id,{recursive:true,force:true});res.json({success:true})})
export function startPairServer(){app.listen(PORT,'0.0.0.0',()=>console.log('✅ PAIR SERVER ONLINE '+PORT))}
