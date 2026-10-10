const fs = require('fs');
module.exports = {
name: "setvar",
execute: async (sock, m, args) => {
if (!args[0]) return m.reply("Usage:.setvar KEY VALUE\n\n> POWERED BY STORM X");
let key = args[0];
let val = args.slice(1).join(" ");
process.env[key] = val;
m.reply(`*${key}* set to *${val}*\n\n> POWERED BY STORM X`);
}}
