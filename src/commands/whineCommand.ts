import { ApplicationCommandData, CommandInteraction } from "discord.js";
import { provide } from "inversify-binding-decorators";
import { Command, ICommand } from "../models/commandManager";

@provide(Command)
class WhineCommand implements ICommand {
    async getCommandData(): Promise<ApplicationCommandData> { 
        return Promise.resolve({
            name: 'whine',
            description: 'Whine'
        });
    }

    async handler(interaction: CommandInteraction) {
        await interaction.reply("https://cdn.discordapp.com/attachments/808488532511424542/847955398346014740/video0.mp4");
    }
}