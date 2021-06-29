import { Client, Message } from "discord.js";
import { provide } from "inversify-binding-decorators";
import { IMessageHandler, MessageHandler } from "../models/messageManager";

@provide(MessageHandler)
class FiveTenHandler implements IMessageHandler {
    async shouldHandle(message: Message, client: Client): Promise<boolean> {
        return message.author.id !== client.user!.id && message.content.includes('just left the server');
    }

    async handler(message: Message) {
        await message.reply(`https://cdn.discordapp.com/attachments/808035465437511683/859519878859849768/video0.mov`);
    }
}