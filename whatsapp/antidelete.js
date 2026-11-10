import fs from 'fs'
import pino from 'pino'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

// save every incoming message to cache for antidelete
export async function saveMessageCache(msg, remoteJid, sender, msgCache, sock){
 try{
  let mtype=Object.keys(msg.message)[0]
  let text=msg.message.conversation||msg.message.extendedTextMessage?.text||msg.message.imageMessage?.caption||msg.message.videoMessage?.caption||""
  let entry={id:msg.key.id, chat:remoteJid, sender:sender, type:"text", text:text, time:Date.now()}
  if(mtype==="imageMessage"){
    entry.type="image"
    try{ entry.buffer=await downloadMediaMessage(msg, 'buffer', {}, {logger:pino({level:'silent'}), reuploadRequest:sock.updateMediaMessage}) }catch{}
  }else if(mtype==="videoMessage"){
    entry.type="video"
    try{ entry.buffer=await downloadMediaMessage(msg, 'buffer', {}, {logger:pino({level:'silent'}), reuploadRequest:sock.updateMediaMessage}) }catch{}
  }else if(mtype==="stickerMessage"){
    entry.type="sticker"
    try{ entry.buffer=await downloadMediaMessage(msg, 'buffer', {}, {logger:pino({level:'silent'}), reuploadRequest:sock.updateMediaMessage}) }catch{}
  }
  msgCache.set(msg.key.id, entry)
  if(msgCache.size>500){
    let firstKey=msgCache.keys().next().value
    msgCache.delete(firstKey)
  }
 }catch{}
}

// handle deleted message restore
export async function handleAntidelete(sock, msg, remoteJid, botIdNum, msgCache){
 try{
  if(!msg.message.protocolMessage || msg.message.protocolMessage.type!==0) return false
  let deletedId=msg.message.protocolMessage.key?.id
  let deletedChat=msg.message.protocolMessage.key?.remoteJid || remoteJid
  if(!deletedId) return false
  let adFile=`./database/antidelete_${botIdNum}.json`
  let adList=[]
  try{ if(fs.existsSync(adFile)) adList=JSON.parse(fs.readFileSync(adFile)) }catch{}
  if(!adList.includes(deletedChat)) return false
  let cached=msgCache.get(deletedId)
  if(!cached) return false
  let delUser=cached.sender?.split('@')[0]||"unknown"
  let caption=`ᴀɴᴛɪᴅᴇʟᴇᴛᴇ ♻️\n\nғʀᴏᴍ: @${delUser}\nᴛʏᴘᴇ: ${cached.type}\n\n> ᴅᴇʟᴇᴛᴇᴅ ᴍsɢ ʀᴇsᴛᴏʀᴇᴅ`
  try{
    if(cached.type==="text" && cached.text){
      await sock.sendMessage(deletedChat, {text:`${caption}\n\nᴍsɢ: ${cached.text}`, mentions:[cached.sender]})
    }else if(cached.type==="image" && cached.buffer){
      await sock.sendMessage(deletedChat, {image:cached.buffer, caption:caption, mentions:[cached.sender]})
    }else if(cached.type==="video" && cached.buffer){
      await sock.sendMessage(deletedChat, {video:cached.buffer, caption:caption, mentions:[cached.sender]})
    }else if(cached.type==="sticker" && cached.buffer){
      await sock.sendMessage(deletedChat, {sticker:cached.buffer})
      await sock.sendMessage(deletedChat, {text:caption, mentions:[cached.sender]})
    }else if(cached.text){
      await sock.sendMessage(deletedChat, {text:`${caption}\n\n${cached.text}`, mentions:[cached.sender]})
    }
  }catch(e){}
  return true
 }catch{ return false }
}
