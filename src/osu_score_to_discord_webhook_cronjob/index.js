import { OsuAPI } from './osu_api.js';
import { DiscordAPI } from './discord_api.js';
import { DB } from './db.js';

const ranks = {
    F: ['F', 'CC3333'],
    D: ['D', 'FF5A5A'],
    C: ['C', 'FF8E5D'],
    B: ['B', 'EBBD48'],
    A: ['A', '88DA20'],
    S: ['S', '02B5C3'],
    X: ['SS', '02B5C3'],
    SH: ['Silver S', 'AADFF0'],
    XH: ['Silver SS', 'FFFFFF'],
};

/**
 * @typedef {{
 *   osu_client_id: string,
 *   osu_client_secret: string,
 *   discord_webhook_id: string,
 *   discord_webhook_token: string,
 *   discord_webhook_username?: string,
 *   discord_webhook_avatar_url?: string,
 *   discord_thread_id?: string,
 *   user_list: string[],
 * }} Config
 */

export class Job {
    /**
     * @param {Config} config
     * @param {DB} db
     */
    constructor(config, db) {
        this.config = config;
        this.db = db;

        this.osuAPI = new OsuAPI(
            {
                client_id: config.osu_client_id,
                client_secret: config.osu_client_secret,
            },
            db,
        );

        this.discordAPI = new DiscordAPI({
            id: config.discord_webhook_id,
            token: config.discord_webhook_token,
            username: config.discord_webhook_username,
            avatar_url: config.discord_webhook_avatar_url,
            thread_id: config.discord_thread_id,
        });
    }

    async execute() {
        const embeds = [];

        for (let userId of this.config.user_list) {
            const scores = await this.osuAPI.getScores(userId);

            const scoreUpdateTime = await this.db.getUserUpdateTime(userId);
            const lastDate = new Date(scoreUpdateTime || 0);

            for (let score of scores) {
                const scoreDate = new Date(score.ended_at);

                if (lastDate >= scoreDate) continue;

                const star = score.beatmap.difficulty_rating.toFixed(2);
                const accuracy = (score.accuracy * 100).toFixed(2);
                const pp = score.pp ? score.pp.toFixed() : 0;

                const embed = {
                    title: `[${star} ⭐] | ${score.user.username} | ${accuracy}% ${ranks[score.rank][0]} | ${pp} PP`,
                    description: `[${score.beatmapset.title} [${score.beatmap.version}]](<${score.beatmap.url}>)`,
                    timestamp: score.ended_at,
                    color: parseInt(ranks[score.rank][1], 16),
                    thumbnail: {
                        url: score.user.avatar_url,
                    },
                    author: {
                        name: score.user.username,
                        url: `https://osu.ppy.sh/users/${score.user.id}`,
                        icon_url: score.user.avatar_url,
                    },
                };

                embeds.push(embed);
            }

            if (scores[0])
                this.db.setUserUpdateTime(userId, scores[0].ended_at);
        }

        await this.discordAPI.send(embeds);
    }
}

export { DB };
