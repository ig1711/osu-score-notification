import { Job, DB } from './osu_score_to_discord_webhook_cronjob/index.js';
import { env } from 'node:process';

const store = {
    _data: new Map(),

    get(key) {
        return this._data.get(key);
    },

    put(key, val) {
        return this._data.set(key, val);
    },
};

const db = new DB(store);

const config = {
    osu_client_id: env.OSU_CLIENT_ID,
    osu_client_secret: env.OSU_CLIENT_SECRET,
    discord_webhook_id: env.DISCORD_WEBHOOK_ID,
    discord_webhook_token: env.DISCORD_WEBHOOK_TOKEN,
    discord_thread_id: env.DISCORD_THREAD_ID,
    user_list: ['18163974', '16454008'],
};

const job = new Job(config, db);

setInterval(async () => {
    await job.execute();
}, 60_000);
