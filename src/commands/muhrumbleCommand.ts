import { ApplicationCommandData, CommandInteraction } from "discord.js";
import { provide } from "inversify-binding-decorators";
import { Command, ICommand } from "../models/commandManager";

@provide(Command)
class MuhrumbleCommand implements ICommand {
    name = 'muhrumble';
    async getCommandData(): Promise<ApplicationCommandData> { 
        return {
            name: this.name,
            description: 'Muh rumble'
        };
    }

    async handler(interaction: CommandInteraction) {
        await interaction.reply("https://cdn.discordapp.com/attachments/808043989084930069/836067805497393172/rumble.png");
    }
}