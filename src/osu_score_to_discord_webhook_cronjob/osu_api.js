const AUTH_TOKEN_URL = 'https://osu.ppy.sh/oauth/token';
const API_ENDPOINT = 'https://osu.ppy.sh/api/v2';

export class OsuAPI {
    constructor({ client_id, client_secret }, db) {
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.access_token = null;
        this.db = db;
    }

    async getAccessToken(updateCache) {
        const token = await this.db.getAccessToken();
        if (token && !updateCache) {
            this.access_token = token;
            return;
        }
        const response = await fetch(AUTH_TOKEN_URL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.client_id,
                client_secret: this.client_secret,
                grant_type: 'client_credentials',
                scope: 'public',
            }),
        });

        const data = await response.json().catch((error) => {
            console.error(error);
            return null;
        });

        this.access_token = data.access_token;

        this.db.setAccessToken(data.access_token);
    }

    async getScores(userId) {
        if (!this.access_token) await this.getAccessToken();

        let response = await fetch(
            `${API_ENDPOINT}/users/${userId}/scores/recent?limit=5&include_fails=1`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.access_token}`,
                    'x-api-version': '20240529',
                },
            },
        );

        if (response.status === 401) {
            await this.getAccessToken(true);

            response = await fetch(
                `${API_ENDPOINT}/users/${userId}/scores/recent?limit=5&include_fails=1`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.access_token}`,
                        'x-api-version': '20240529',
                    },
                },
            );
        }

        const data = await response.json().catch((error) => {
            console.error(error);
            return [];
        });

        if (!Array.isArray(data)) {
            console.error('Score API call did not return an array', data);
            return [];
        }

        return data;
    }
}
