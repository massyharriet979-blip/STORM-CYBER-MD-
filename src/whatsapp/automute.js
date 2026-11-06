import fs from 'fs';
import path from 'path';


const DB_DIR = './database';
const timers = new Map();

function getFile(botId) {
    return path.join(DB_DIR, `automute_${botId}.json`);
}

function loadSchedules(botId) {
    try {
        const file = getFile(botId);
        if (!fs.existsSync(file)) return {};
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (error) {
        console.error('[AUTOMUTE] Load error:', error.message);
        return {};
    }
}

function saveSchedules(botId, data) {
    try {
        fs.mkdirSync(DB_DIR, { recursive: true });
        fs.writeFileSync(getFile(botId), JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('[AUTOMUTE] Save error:', error.message);
        return false;
    }
}

function key(botId, groupId, action) {
    return `${botId}:${groupId}:${action}`;
}

export function scheduleAutoAction(sock, botId, groupId, action, executeAt) {
    if (!sock || !botId || !groupId) return false;
    if (!['mute', 'unmute'].includes(action)) return false;

    const timestamp = Number(executeAt);
    if (!Number.isFinite(timestamp)) return false;

    const timerKey = key(botId, groupId, action);

    if (timers.has(timerKey)) {
        clearTimeout(timers.get(timerKey));
    }

    const delay = Math.max(0, timestamp - Date.now());

    const timer = setTimeout(async () => {
        timers.delete(timerKey);

        try {
            const setting = action === 'mute'
                ? 'announcement'
                : 'not_announcement';

            await sock.groupSettingUpdate(groupId, setting);

            await sock.sendMessage(groupId, {
                text: action === 'mute'
                    ? '🔇 Group automatically muted.\n\n> Powered by STORM X'
                    : '🔊 Group automatically unmuted.\n\n> Powered by STORM X'
            });

            const db = loadSchedules(botId);
            if (db[groupId]) {
                delete db[groupId][action];

                if (!db[groupId].mute && !db[groupId].unmute) {
                    delete db[groupId];
                }

                saveSchedules(botId, db);
            }

            console.log(`[AUTOMUTE] ${action} completed: ${groupId}`);

        } catch (error) {
            console.error(`[AUTOMUTE] ${action} failed:`, error.message);
        }
    }, delay);

    timers.set(timerKey, timer);
    return true;
}

export function saveAutoMuteSchedule(botId, groupId, action, duration) {
    if (!botId || !groupId) throw new Error('Missing bot or group ID');
    if (!['mute', 'unmute'].includes(action)) {
        throw new Error('Invalid action');
    }

    const ms = Number(duration);

    if (!Number.isFinite(ms) || ms <= 0) {
        throw new Error('Invalid duration');
    }

    const executeAt = Date.now() + ms;
    const db = loadSchedules(botId);

    if (!db[groupId]) db[groupId] = {};

    db[groupId][action] = executeAt;

    if (!saveSchedules(botId, db)) {
        throw new Error('Could not save schedule');
    }

    return executeAt;
}

export function cancelAutoAction(botId, groupId, action) {
    const timerKey = key(botId, groupId, action);

    if (timers.has(timerKey)) {
        clearTimeout(timers.get(timerKey));
        timers.delete(timerKey);
    }

    const db = loadSchedules(botId);

    if (db[groupId]) {
        delete db[groupId][action];

        if (!db[groupId].mute && !db[groupId].unmute) {
            delete db[groupId];
        }

        saveSchedules(botId, db);
    }
}

export function restoreAutoActions(sock, botId) {
    const db = loadSchedules(botId);

    for (const groupId of Object.keys(db)) {
        for (const action of ['mute', 'unmute']) {
            const executeAt = db[groupId][action];

            if (executeAt) {
                scheduleAutoAction(
                    sock,
                    botId,
                    groupId,
                    action,
                    executeAt
                );
            }
        }
    }
}

