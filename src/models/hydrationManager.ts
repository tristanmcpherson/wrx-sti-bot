import { Client, Message, TextChannel } from "discord.js";

export class HydrationManager {
    _client: Client
    _channelId: string
    _roleId: string

    constructor(client: Client, channelId: string, roleId: string) {
        this._client = client;
        this._channelId = channelId;
        this._roleId = roleId;

        setInterval(async () => {
            const hour = new Date().getHours();
            if (hour >= 16 || hour < 4) {
                const channel = await this._client.channels.fetch(this._channelId) as TextChannel;
                await channel.send(`@<&${this._roleId}> drink water u retards`)
            }
        }, 60 * 60 * 1000);
    }
}
