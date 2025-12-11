export class DB {
    constructor(store) {
        this.store = store;
    }

    async getAccessToken() {
        return await this.store.get('access_token');
    }

    async setAccessToken(token) {
        await this.store.put('access_token', token);
    }

    async getUserUpdateTime(userId) {
        return await this.store.get(`user_time:${userId}`);
    }

    async setUserUpdateTime(userId, time) {
        await this.store.put(`user_time:${userId}`, time);
    }
}
