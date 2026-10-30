import os
print("🔍 CONFIRMING FIX...\n")

# Check 1: index.js
with open("index.js", 'r', encoding='utf-8', errors='ignore') as f:
    idx = f.read()
print("--- index.js ---")
print("Has startPairServer import:", "startPairServer" in idx)
print("Has startPairServer() call:", idx.count("startPairServer()"))
if "startTelegram()\nstartWhatsApp()\nstartPairServer()" in idx:
    print("✅ index.js order is CORRECT")
else:
    print("❌ index.js order WRONG")
print()

# Check 2: pairServer.js content
path = "src/web/pairServer.js"
if not os.path.exists(path):
    print("❌ pairServer.js NOT FOUND")
    exit()
with open(path, 'r') as f:
    code = f.read()

print("--- src/web/pairServer.js ---")
checks = [
    "YOUR ${id} IS PAIRED BUT YOUR NUMBER IS NOT CONNECTED",
    "IS RUNNING SMOOTHLY IN WHATSAPP",
    "IS NOT PAIRED YET",
    "/api/status",
    "statusOf"
]
for c in checks:
    print(f"{'✅' if c in code else '❌'} Contains: {c}")

print("\n--- Actual lines in file ---")
for line in code.split("\n"):
    if "IS PAIRED BUT" in line or "RUNNING SMOOTHLY" in line or "NOT PAIRED YET" in line:
        print(line.strip())

print("\n--- Testing node syntax ---")
os.system("node --check src/web/pairServer.js && echo '✅ NO SYNTAX ERROR' || echo '❌ SYNTAX ERROR'")
