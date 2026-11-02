
function parseDuration(args) {
    const input = args.join(' ').toLowerCase();
    const regex = /(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)/g;

    let match;
    let total = 0;
    let found = false;
    let consumed = '';

    while ((match = regex.exec(input)) !== null) {
        found = true;

        const amount = Number(match[1]);
        const unit = match[2];

        if (unit.startsWith('h')) total += amount * 3600000;
        else if (unit.startsWith('m')) total += amount * 60000;
        else total += amount * 1000;

        consumed += match[0];
    }

    if (!found || input.replace(/\s/g, '') !== consumed.replace(/\s/g, '')) {
        return null;
    }

    return total;
}

export default {
    name: 'automute',
    aliases: ['amute'],
    execute: async (sock, m, args) => {
        if (!m.isGroup) {
            return sock.sendMessage(m.chat, {
                text: '❌ Group only command.'
            }, { quoted: m });
        }

        const meta = await sock.groupMetadata(m.chat);
        const sender = meta.participants.find(p => p.id === m.sender);

        if (!m.isOwner && !sender?.admin) {
            return sock.sendMessage(m.chat, {
                text: '❌ Only group admins can use this command.'
            }, { quoted: m });
        }

        const duration = parseDuration(args);

        if (!duration || duration <= 0 || duration > 30 * 86400000) {
            return sock.sendMessage(m.chat, {
                text: 'Usage: .automute 6 hour 5 sec\nMaximum: 30 days.'
            }, { quoted: m });
        }

        const bot = meta.participants.find(
            p => p.id.split(':')[0] === sock.user.id.split(':')[0]
        );

        if (!bot?.admin) {
            return sock.sendMessage(m.chat, {
                text: '❌ The bot must be a group admin.'
            }, { quoted: m });
        }

        const botId = sock.user.id.split(':')[0];

        try {
            const executeAt = global.saveAutoMuteSchedule(
                botId, m.chat, 'mute', duration
            );

            if (!global.scheduleAutoAction(
                sock, botId, m.chat, 'mute', executeAt
            )) {
                throw new Error('Could not start timer');
            }

            return sock.sendMessage(m.chat, {
                text: `🔇 AUTOMUTE SCHEDULED\n\nMute starts in: ${args.join(' ')}\n\n> Powered by STORM X`
            }, { quoted: m });

        } catch (error) {
            return sock.sendMessage(m.chat, {
                text: `❌ Schedule failed: ${error.message}`
            }, { quoted: m });
        }
    }
};

