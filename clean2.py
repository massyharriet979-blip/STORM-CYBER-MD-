import re, pathlib
p=pathlib.Path("index.js")
t=p.read_text()
orig=t
print(f"Before: {len(t)} chars")

# Backup
pathlib.Path("index.js.bak-clean2").write_text(t)
print("Backup: index.js.bak-clean2")

def remove_func(code, pattern):
    m=re.search(pattern, code)
    if not m:
        return code, False
    start=m.start()
    brace_start=code.find('{', m.end()-1)
    if brace_start==-1:
        return code, False
    depth=0
    i=brace_start
    while i < len(code):
        if code[i]=='{': depth+=1
        elif code[i]=='}':
            depth-=1
            if depth==0:
                end=i+1
                # also remove trailing newline
                if end < len(code) and code[end]=='\n':
                    end+=1
                return code[:start]+code[end:], True
        i+=1
    return code, False

# Remove telegram constants (they live in bot.js now)
for const in ["GROUP_LINK","CHANNEL_LINK","OWNER_LINK","CREATOR_LINK","GROUP_ID","CHANNEL_ID"]:
    t=re.sub(rf"const {const}.*\n", "", t)

# Remove BOT_TOKEN if exists (bot.js loads .env now)
t=re.sub(r"const BOT_TOKEN.*\n", "", t)

# Remove Telegraf import if still in index.js (should only be in bot.js)
t=re.sub(r"import \{ Telegraf.*\n", "", t)
t=re.sub(r"import \{ trackAdmin.*\n", "import { trackAdmin } from './src/database/admintracker.js';\n", t) # keep trackAdmin

# Remove telegram helpers - they are now in bot.js
for pat in [r"async function isJoined\(ctx\)", r"async function getBotPhoto\(ctx\)", r"function doReply\(ctx\)", r"async function sendMainMenu\(ctx\)", r"async function sendJoinLock\(ctx\)"]:
    new_t, removed = remove_func(t, pat)
    if removed:
        print(f"Removed {pat}")
        t=new_t
    else:
        print(f"Not found {pat} - maybe already removed")

# Remove duplicate helper blocks if still there
t=re.sub(r"\n{3,}", "\n\n", t)

pathlib.Path("index.js").write_text(t)
print(f"After: {len(t)} chars - Removed {len(orig)-len(t)} chars")
