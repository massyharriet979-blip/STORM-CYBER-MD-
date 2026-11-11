// STORM CYBER MD - TELEGRAM SESSION LIST

function toSmallCaps(text) {
  const map = {
    a:'ᴀ', b:'ʙ', c:'ᴄ', d:'ᴅ', e:'ᴇ',
    f:'ғ', g:'ɢ', h:'ʜ', i:'ɪ', j:'ᴊ',
    k:'ᴋ', l:'ʟ', m:'ᴍ', n:'ɴ', o:'ᴏ',
    p:'ᴘ', q:'ǫ', r:'ʀ', s:'s', t:'ᴛ',
    u:'ᴜ', v:'ᴠ', w:'ᴡ', x:'x', y:'ʏ', z:'ᴢ'
  };

  return String(text).toLowerCase()
    .split('')
    .map(char => map[char] || char)
    .join('');
}

function getSocket(entry) {
  return entry?.sock || entry;
}

async function getSessionStats() {
  const subbots = global.subbots || new Map();

  let paired = 0;
  let connected = 0;
  let disconnected = 0;
  const names = [];

  for (const [number, entry] of subbots) {
    paired++;

    const sock = getSocket(entry);
    const isConnected =
      sock?.ws?.readyState === 1 &&
      !!sock?.user?.id;

    if (isConnected) {
      connected++;
      names.push(number);
    } else {
      disconnected++;
    }
  }

  return {
    paired,
    connected,
    disconnected,
    total: paired,
    shared: names.length ? names.join(', ') : '—'
  };
}

async function checkServers() {
  let reachable = 1;
  const totalServers = 3;

  try {
    const response = await fetch(
      'http://localhost:24922/health',
      { signal: AbortSignal.timeout(2000) }
    );

    if (response.ok) reachable++;
  } catch {}

  try {
    if (global.telegramBot) {
      await global.telegramBot.telegram.getMe();
      reachable++;
    }
  } catch {}

  return {
    reachable,
    totalServers,
    unreachable: totalServers - reachable
  };
}

export async function listCommand(ctx) {
  try {
    const stats = await getSessionStats();
    const servers = await checkServers();

    const footer = servers.unreachable === 0
      ? '✅ ALL SERVERS ARE ACTIVE'
      : `⚠️ ${servers.unreachable} SERVER(S) UNREACHABLE`;

    const message = `📊 ${toSmallCaps('session')}

${toSmallCaps('paired')}: ${stats.paired}
${toSmallCaps('connected')}: ${stats.connected}
${toSmallCaps('shared')}: ${stats.shared}
${toSmallCaps('disconnected')}: ${stats.disconnected}

${toSmallCaps('total')}: ${stats.total}

${toSmallCaps('servers')}: ${servers.reachable}/${servers.total}

${toSmallCaps(footer)}`;

    return ctx.reply(message);
  } catch (error) {
    console.log('LIST COMMAND ERROR:', error.message);
    return ctx.reply(toSmallCaps('❌ failed to load session information.'));
  }
}

export async function listActions(ctx) {
  try {
    await ctx.answerCbQuery();
  } catch {}

  return listCommand(ctx);
}

export default listCommand;
