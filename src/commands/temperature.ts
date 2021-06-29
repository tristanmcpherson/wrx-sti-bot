import { Client, Message } from "discord.js";
import { provide } from "inversify-binding-decorators";
import { IMessageHandler, MessageHandler } from "../models/messageManager";

const temperatureRegex = /(\d+) ?(f|c)([^a-zA-Z0-9]|$)/i;

@provide(MessageHandler)
class TemperatureHandler implements IMessageHandler {
    async shouldHandle(message: Message, client: Client): Promise<boolean> {
        return message.author.id !== client.user!.id && temperatureRegex.test(message.content);
    }

    async handler(message: Message) {
        const regexResult = temperatureRegex.exec(message.content);
        if (regexResult === null) {
            return;
        }

        const value = parseFloat(regexResult[1]);
        const unit = regexResult[2].toUpperCase();

        let newValue, newUnit;
        if (unit === 'F') {
            newValue = (value - 32) * 5/9;
            newUnit = 'C';
        } else {
            newValue = value * 9/5 + 32;
            newUnit = 'F';
        }

        await message.reply(`${value.toFixed(2)}°${unit} ~ ${newValue?.toFixed(2)}°${newUnit}`);
    }
}
