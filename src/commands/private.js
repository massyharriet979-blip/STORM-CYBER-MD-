import fs from 'fs';

function toSmallCaps(text) {
  const map = {a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'};
  return text.toLowerCase().split('').map(c => map[c] || c).join('');
}

export default {
  name: "private",
  alias: ["privatemode", "lockedmode", "sudoonly"],
  execute: async (sock, m) => {
    try {
      const botNum = (m.botNumber || sock.user?.id?.split(":")[0]?.split("@")[0] || "").replace(/[^0-9]/g, '');
      const senderNum = (m.senderNum || m.sender?.split("@")[0] || "").replace(/[^0-9]/g, '');

      // OWNER ONLY - per-bot owner check, not global
      // For subbot, only the subbot's own number can change its own mode
      // For main bot, only main bot number can change it
      if (senderNum !== botNum) {
        await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        return await sock.sendMessage(m.chat, { text: `**${toSmallCaps("owner only command")}**\n\n> ${toSmallCaps("powered by storm")} 𝐗` }, { quoted: m }).catch(() => {});
      }

      // PER-BOT MODE FILE - independent for each bot
      // Main bot: ./database/mode_256766233041.json
      // Subbot A: ./database/mode_2567xxxxxxx.json
      // Subbot B: ./database/mode_2567yyyyyyy.json
      const modeFile = `./database/mode_${botNum}.json`;
      fs.mkdirSync('./database', { recursive: true });
      fs.writeFileSync(modeFile, JSON.stringify({ mode: "private" }, null, 2));

      await sock.sendMessage(m.chat, { react: { text: "🔒", key: m.key } }).catch(() => {});
      return await sock.sendMessage(m.chat, { text: `**╭─❍ ${toSmallCaps("mode changed")} ❍─**\n**│**\n**│ 🔒 ${toSmallCaps("locked. only sudo can also access the bot")}**\n**│ 🛡️ ${toSmallCaps("private mode activated")}**\n**│ 👑 ${toSmallCaps("only owner & sudo can use bot")}**\n**│**\n**╰────────────────**\n\n> ${toSmallCaps("powered by storm")} 𝐗` }, { quoted: m }).catch(() => {});
    } catch (e) {
      await sock.sendMessage(m.chat, { text: `Error: ${e.message}` }, { quoted: m }).catch(() => {});
    }
  }
};
