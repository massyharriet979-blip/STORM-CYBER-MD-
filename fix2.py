import pathlib, shutil
p = pathlib.Path("index.js")
orig = p.read_text()
t = orig
shutil.copyfile(p, "index.js.bak")
print("backup made: index.js.bak")

def check(name, s):
    print(("FOUND: " if s in t else "NOT FOUND: ") + name)
    return s in t

ok = True
ok &= check("tracking", "global.pairingInProgress = new Set()")
ok &= check("subbot open", "console.log(G+`✅ SUBBOT ${id} CONNECTED`+R)")
ok &= check("subbot close", "console.log(Y+`⚠️ SUBBOT ${id} CLOSED, RESTARTING 5s`+R)")
ok &= check("pair online", "is already connected! no need to pair again.")
ok &= check("pair was paired", "already paired! reconnecting your subbot...")
ok &= check("pair rmSync", "try{ fs.rmSync('./sessions/'+number,{recursive:true,force:true}) }catch{}")
ok &= check("pair save session", "saveTgSession(String(ctx.from.id), number)\n\n      const cleanCode")
ok &= check("pair connected msg", "✅ ${number} Connected! Session saved on server.")
ok &= check("session block", "bot.command('session'")
if not ok:
    print("STOPPED - DID NOT CHANGE FILE - send me screenshot")
    raise SystemExit

# A - ADD tracking after pairingInProgress
t = t.replace("global.pairingInProgress = new Set()", "global.pairingInProgress = new Set()\nglobal.sessionMeta = new Map()\nfunction setMeta(n,d){let o=global.sessionMeta.get(n)||{};global.sessionMeta.set(n,{...o,...d})}\nfunction fmtTime(ts){if(!ts) return 'unknown';let d=new Date(ts);return d.toLocaleString('en-GB',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}", 1)
print("A DONE: tracking added")

# B1 - startSubBotSession open
t = t.replace("console.log(G+`✅ SUBBOT ${id} CONNECTED`+R)", "setMeta(id,{connectedAt:Date.now(),pairedAt:global.sessionMeta.get(id)?.pairedAt||Date.now(),disconnectedAt:null,isConnected:true})\n        console.log(G+`✅ SUBBOT ${id} CONNECTED`+R)", 1)
print("B1 DONE: open tracking")

# B2 - startSubBotSession close - add disconnected time + wait 10s on 515/408
t = t.replace("console.log(Y+`⚠️ SUBBOT ${id} CLOSED, RESTARTING 5s`+R)\n        setTimeout(()=>startSubBotSession(id),5000)", "setMeta(id,{disconnectedAt:Date.now(),isConnected:false})\n        console.log(Y+`⚠️ SUBBOT ${id} CLOSED`+R)\n        setTimeout(()=>startSubBotSession(id),5000)", 1)
print("B2 DONE: close tracking")

# C1 - /pair same number ONLINE message
t = t.replace("✅ ${number} is already connected! no need to pair again.", "✅ ${number} IS CONNECTED NO NEED TO PAIR AGAIN")
t = t.replace("✅ ${number} is already connected!", "✅ ${number} IS CONNECTED NO NEED TO PAIR AGAIN")
print("C1 DONE: online message")

# C2 - /pair disconnected: do NOT return, do NOT startSubBotSession, generate new code
old_pair = """        try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`✅ ${number} already paired! reconnecting your subbot...`)) }catch{}
        startSubBotSession(number)
        return"""
new_pair = """        try{ await ctx.telegram.editMessageText(ctx.chat.id,sMsg.message_id,null,toSmallCaps(`✅ ${number} was paired before, generating new code for your saved session...`)) }catch{}"""
if old_pair in t:
    t = t.replace(old_pair, new_pair, 1)
    print("C2 DONE: disconnected will generate new code")
else:
    print("C2 NOT FOUND - check manually")

# C3 - do NOT delete session if it exists, only if no creds
t = t.replace("try{ fs.rmSync('./sessions/'+number,{recursive:true,force:true}) }catch{}", "try{ let _c='./sessions/'+number+'/creds.json'; let _reg=false; try{ if(fs.existsSync(_c)) _reg=JSON.parse(fs.readFileSync(_c)).registered }catch{}; if(!_reg) fs.rmSync('./sessions/'+number,{recursive:true,force:true}) }catch{}", 1)
print("C3 DONE: session not deleted if disconnected")

# C4 - track pair time
t = t.replace("saveTgSession(String(ctx.from.id), number)\n\n      const cleanCode", "saveTgSession(String(ctx.from.id), number); setMeta(number,{pairedAt:Date.now(),isConnected:false})\n\n      const cleanCode", 1)
print("C4 DONE: pair time tracked")

# C5 - track pairing socket open/close
t = t.replace("ctx.reply(toSmallCaps(`✅ ${number} Connected! Session saved on server.`), doReply(ctx))", "setMeta(number,{connectedAt:Date.now(),pairedAt:global.sessionMeta.get(number)?.pairedAt||Date.now(),isConnected:true}); ctx.reply(toSmallCaps(`✅ ${number} Connected! Session saved on server.`), doReply(ctx))", 1)
print("C5 DONE: pairing socket tracking")

# D - /session block ONLY
old_session = """  bot.command('session', async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    let db=loadTgSessions()
    let myNums=db[String(ctx.from.id)]||[]
    let hasActive=false
    for(let n of myNums){
      if(global.subbots.has(n) || fs.existsSync('./sessions/'+n)) hasActive=true
    }
    if(hasActive){
      await ctx.reply(toSmallCaps(`YOU HAVE AN ACTIVE SESSION IN THE SERVER RIGHT NOW ✅\\nNUMBERS: ${myNums.join(', ')}`), doReply(ctx))
    }else{
      const kb=Markup.inlineKeyboard([[Markup.button.callback('🔗 Pair Now','pair_btn')],[Markup.button.url('👥 Group',GROUP_LINK), Markup.button.url('📢 Channel',CHANNEL_LINK)]])
      await ctx.reply(toSmallCaps(`YOU DONT HAVE ANY ACTIVE SESSION IN THE SERVER, USE THE PAIR BUTTON BELLOW TO GET CONNECTED ❌`), {...kb,...doReply(ctx)})
    }
  })"""
new_session = """  bot.command('session', async (ctx)=>{
    if(ctx.chat.type === 'private' &&!await isJoined(ctx)) return sendJoinLock(ctx)
    let db=loadTgSessions()
    let myNums=db[String(ctx.from.id)]||[]
    let photo=await getBotPhoto(ctx)
    if(myNums.length===0){
      let txt0=toSmallCaps(`you dont have any active session in the server, use the pair button bellow to get connected ❌`)
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt0,...doReply(ctx)}); else await ctx.reply(txt0, doReply(ctx)); return
    }
    let onlineNums=myNums.filter(n=>global.subbots.has(n))
    let pairedCount=myNums.length
    if(onlineNums.length>0){
      let meta=global.sessionMeta.get(onlineNums[0])||{}
      let txt=toSmallCaps(`you have an active session in the server right now ✅️\\n\\nrun time: ${fmtTime(meta.pairedAt||meta.connectedAt)}\\npaired: ${pairedCount}\\nstatus: online 🟢`)
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...doReply(ctx)}); else await ctx.reply(txt, doReply(ctx))
    } else {
      let meta=global.sessionMeta.get(myNums[0])||{}
      let txt=toSmallCaps(`you paired your number but its temporarily saved on the server\\n\\ndisconnected when: ${fmtTime(meta.disconnectedAt)}\\npaired: ${pairedCount}\\nstatus: stopped / offline 🔴`)
      if(photo) await ctx.replyWithPhoto(photo,{caption:txt,...doReply(ctx)}); else await ctx.reply(txt, doReply(ctx))
    }
  })"""
if old_session in t:
    t = t.replace(old_session, new_session, 1)
    print("D DONE: session fixed")
else:
    print("D NOT FOUND - session block different - DID NOT CHANGE SESSION")

p.write_text(t)
print("DONE STEP 2 - file written, backup is index.js.bak")
