import { Job, DB } from './osu_score_to_discord_webhook_cronjob/index.js';

export default {
    async scheduled(event, env, ctx) {
        const db = new DB(env.OSU_KV);

        const config = {
            osu_client_id: env.OSU_CLIENT_ID,
            osu_client_secret: env.OSU_CLIENT_SECRET,
            discord_webhook_id: env.DISCORD_WEBHOOK_ID,
            discord_webhook_token: env.DISCORD_WEBHOOK_TOKEN,
            discord_thread_id: env.DISCORD_THREAD_ID,
            user_list: ['18163974', '16454008'],
        };

        const job = new Job(config, db);

        await job.execute();
    },
};
