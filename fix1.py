import pathlib, shutil
p = pathlib.Path("index.js")
t = p.read_text()
shutil.copyfile(p, "index.js.bak")
print("backup made: index.js.bak")

old = """      const photo=await getBotPhoto(ctx)
      const kb=Markup.inlineKeyboard([[Markup.button.callback(`📋 Copy ${cleanCode}`,`copy_${cleanCode}`)],[Markup.button.url('👥 Group',GROUP_LINK), Markup.button.url('📢 Channel',CHANNEL_LINK)],[Markup.button.url('👑 Owner',OWNER_LINK)]])
      if(photo) await ctx.replyWithPhoto(photo,{caption:pairMsg, parse_mode:'Markdown',...kb,...doReply(ctx)})
      else await ctx.reply(pairMsg,{parse_mode:'Markdown',...kb,...doReply(ctx)})"""

new = """      await ctx.reply(pairMsg,{parse_mode:'Markdown',...doReply(ctx)})"""

if old in t:
    print("FOUND: pair code image + buttons")
    t = t.replace(old, new, 1)
    p.write_text(t)
    print("DONE STEP 1 - removed image + Copy + Group + Channel + Owner")
else:
    print("NOT FOUND: pair code block - DID NOT CHANGE FILE")
    print("Send me screenshot of this message and I will fix the marker only")
