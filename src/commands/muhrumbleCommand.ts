import { ApplicationCommandData, CommandInteraction } from "discord.js";
import { provide } from "inversify-binding-decorators";
import { Command, ICommand } from "../models/commandManager";

@provide(Command)
class MuhrumbleCommand implements ICommand {
    async getCommandData(): Promise<ApplicationCommandData> { 
        return Promise.resolve({
            name: 'muhrumble',
            description: 'Muh rumble'
        });
    }

    async handler(interaction: CommandInteraction) {
        await interaction.reply("https://cdn.discordapp.com/attachments/808043989084930069/836067805497393172/rumble.png");
    }
}