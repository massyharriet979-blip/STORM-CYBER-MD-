import fs from 'fs';

export default {
  name: "public",
  alias: ["publicmode", "accessgranted", "allusers"],
  execute: async (sock, m) => {
    const toSC = (s) => { const mp = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'}; return s.toLowerCase().split('').map(c=>mp[c]||c).join('') };
    try {
      let botNum = (m.botNumber || sock.user?.id?.split(":")[0]?.split("@")[0] || "").replace(/[^0-9]/g, '');
      let senderNum = (m.senderNum || m.sender?.split("@")[0] || "").replace(/[^0-9]/g, '');

      // OWNER ONLY - no sudo/admin
      if (senderNum !== botNum) {
        await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return await sock.sendMessage(m.chat, { text: `**${toSC("owner only command")}**\n\n> ${toSC("powered by storm")} 𝐗` }, { quoted: m });
      }

      // FIX: per-bot file, not shared mode.json
      // index.js reads ./database/mode_<botNum>.json
      const modePath = `./database/mode_${botNum}.json`;
      fs.mkdirSync('./database', { recursive: true });
      fs.writeFileSync(modePath, JSON.stringify({ mode: "public" }, null, 2));

      await sock.sendMessage(m.chat, { react: { text: "🌍", key: m.key } });
      return await sock.sendMessage(m.chat, { text: `**╭─❍ ${toSC("mode changed")} ❍─**\n**│**\n**│ 🌍 ${toSC("access granted for all users")}**\n**│ ✅ ${toSC("public mode activated")}**\n**│ 👥 ${toSC("everyone can now use bot")}**\n**│**\n**╰────────────────**\n\n> ${toSC("powered by storm")} 𝐗` }, { quoted: m });

    } catch (e) {
      await sock.sendMessage(m.chat, { text: `Error: ${e.message}` }, { quoted: m }).catch(()=>{});
    }
  }
};
