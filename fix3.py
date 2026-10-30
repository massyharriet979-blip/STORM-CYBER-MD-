import pathlib, shutil
p = pathlib.Path("index.js")
t = p.read_text()
shutil.copyfile(p, "index.js.bak3")
print("backup made: index.js.bak3")

# 1 - FIX THE SESSION DELETE BUG - this is why it never links
old1 = "try{ let _c='./sessions/'+number+'/creds.json'; let _reg=false; try{ if(fs.existsSync(_c)) _reg=JSON.parse(fs.readFileSync(_c)).registered }catch{}; if(!_reg) fs.rmSync('./sessions/'+number,{recursive:true,force:true}) }catch{}"
if old1 in t:
    t = t.replace(old1, "// FIX3: removed rmSync delete - it was wiping session before pairing", 1)
    print("FOUND: rmSync delete block DONE")
else:
    print("NOT FOUND: rmSync delete block")

# 2 - FIX THE 3.5s TOO FAST PAIRING - wait 12s + wait for socket
old2 = "await delay(3500)\n      const code=await sock.requestPairingCode(number)"
new2 = """await new Promise((resolve)=>{
        let done=false
        sock.ev.on('connection.update', (u)=>{
          if(u.connection==='open' || u.connection==='connecting'){ if(!done){done=true; resolve()} }
        })
        setTimeout(()=>{ if(!done){done=true; resolve()} }, 15000)
      })
      await delay(2000)
      const code=await sock.requestPairingCode(number)"""
if old2 in t:
    t = t.replace(old2, new2, 1)
    print("FOUND: 3.5s wait -> 15s wait DONE")
else:
    print("NOT FOUND: 3.5s wait block")

# 3 - KEEP THE DASH - WhatsApp needs RVAJ-GJFY not RVAJGJFY
old3 = "const clean=code.replace(/-/g,'').toUpperCase()"
if old3 in t:
    t = t.replace(old3, "const clean=code.toUpperCase()", 1)
    print("FOUND: keep dash DONE")
else:
    print("NOT FOUND: strip dash")

# 4 - Prevent pairingInProgress stuck forever
old4 = "global.pairingInProgress.add(number)"
if old4 in t:
    t = t.replace(old4, "global.pairingInProgress.add(number); setTimeout(()=>global.pairingInProgress.delete(number), 90000)", 1)
    print("FOUND: pairing timeout DONE")
else:
    print("NOT FOUND: pairingInProgress")

p.write_text(t)
print("DONE FIX3 - backup is index.js.bak3")
