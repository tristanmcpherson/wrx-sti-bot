import { Client, Message } from "discord.js";
import { provide } from "inversify-binding-decorators";
import { IMessageHandler, MessageHandler } from "../models/messageManager";

const izziRegex = /(canyon)|(touge)/i;

@provide(MessageHandler)
class IzziHandler implements IMessageHandler {
    async shouldHandle(message: Message, client: Client): Promise<boolean> {
        return message.author.id == '172885235535577088' && izziRegex.test(message.content);
    }

    async handler(message: Message) {
        await message.reply(`go to the track bitch`);
    }
}
