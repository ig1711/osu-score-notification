const DISCORD_API = 'https://discord.com/api/v10';
const OSU_LOGO_URL =
    'https://upload.wikimedia.org/wikipedia/commons/2/29/Osu%21_logo_2024.png';

export class DiscordAPI {
    constructor({ id, token, username, avatar_url, thread_id }) {
        this.id = id;
        this.token = token;
        this.username = username;
        this.avatar_url = avatar_url;
        this.thread_id = thread_id;
    }

    async send(embeds) {
        for (let i = 0; i < embeds.length; i += 10) {
            await this.send_one_message(embeds.slice(i, i + 10));
        }
    }

    async send_one_message(embeds) {
        const threadParam = this.thread_id
            ? `?thread_id=${this.thread_id}`
            : '';
        await fetch(
            `${DISCORD_API}/webhooks/${this.id}/${this.token}${threadParam}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.username || 'osu!',
                    avatar_url: this.avatar_url || OSU_LOGO_URL,
                    embeds: embeds,
                    content: embeds.some(e => e.title.includes('started')) ? '<@713715040288636928>' : '',
                }),
            },
        );
    }
}
