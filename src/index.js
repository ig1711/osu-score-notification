import { Job, DB } from './osu_score_to_discord_webhook_cronjob/index.js';

/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
    async fetch(req) {
        const url = new URL(req.url);
        url.pathname = '/__scheduled';
        url.searchParams.append('cron', '* * * * *');
        return new Response(
            `To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}".`,
        );
    },

    // The scheduled handler is invoked at the interval set in our wrangler.jsonc's
    // [[triggers]] configuration.
    async scheduled(event, env, ctx) {
        // A Cron Trigger can make requests to other endpoints on the Internet,
        // publish to a Queue, query a D1 Database, and much more.
        //
        // We'll keep it simple and make an API call to a Cloudflare API:
        // let resp = await fetch('https://api.cloudflare.com/client/v4/ips');
        // let wasSuccessful = resp.ok ? 'success' : 'fail';

        // You could store this result in KV, write to a D1 Database, or publish to a Queue.
        // In this template, we'll just log the result:
        // console.log(`trigger fired at ${event.cron}: ${wasSuccessful}`);

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
