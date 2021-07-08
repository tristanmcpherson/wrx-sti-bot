import { Client, Message, TextChannel } from "discord.js";

export class HydrationManager {
    _client: Client
    _channelId: string
    _roleId: string

    constructor(client: Client, channelId: string, roleId: string) {
        this._client = client;
        this._channelId = channelId;
        this._roleId = roleId;

        const now = new Date();
        const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000;
        setTimeout(() => {
            this.hydrate();

            const hourInMs = 60 * 60 * 1000;
            setInterval(this.hydrate.bind(this), hourInMs);
        }, msUntilNextHour);
    }

    async hydrate() {
        const hour = new Date().getHours();
        if (hour >= 16 || hour < 4) {
            const channel = await this._client.channels.fetch(this._channelId) as TextChannel;
            await channel.send(`<@&${this._roleId}> drink water u retards`)
        }
    }
}
