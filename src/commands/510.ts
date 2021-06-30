import { Client, Message } from "discord.js";
import { provide } from "inversify-binding-decorators";
import { IMessageHandler, MessageHandler } from "../models/messageManager";

const fiveTenRegex = /510([^\d]|$)/;

@provide(MessageHandler)
class FiveTenHandler implements IMessageHandler {
    async shouldHandle(message: Message, client: Client): Promise<boolean> {
        return message.author.id !== client.user!.id && fiveTenRegex.test(message.content);
    }

    async handler(message: Message) {
        await message.reply(`FK510s? no. don't. just don't.`);
    }
}
