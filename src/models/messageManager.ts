import { Client, Message } from "discord.js";
import { inject, injectable, multiInject } from "inversify";

export const MessageHandler = Symbol("MessageHandler");

export interface IMessageHandler {
    shouldHandle: (message: Message, client: Client) => Promise<boolean>;
    handler: (message: Message, client: Client) => Promise<void>;
}

@injectable()
export class MessageManager {
    _client: Client
    _guildId?: string
    _messageHandlers: IMessageHandler[]

    constructor(@multiInject(MessageHandler) messageHandlers: IMessageHandler[], client: Client, @inject("guildId") guildId?: string) {
        this._client = client;
        this._guildId = guildId;
        this._messageHandlers = messageHandlers;
    }

    handleMessage = async (message: Message): Promise<void> => {
        this._messageHandlers.forEach(async messageHandler => {
            if (await messageHandler.shouldHandle(message, this._client)) {
                messageHandler.handler(message, this._client);
            }
        });
    }
}
