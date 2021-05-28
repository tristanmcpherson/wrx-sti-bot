import { ApplicationCommandData, CommandInteraction } from "discord.js";
import { provide } from "inversify-binding-decorators";
import { ICommand, Command } from '../models/commandManager';

@provide(Command)
class FuckOffCommand implements ICommand {
    name = 'fuckoff';
    async getCommandData(): Promise<ApplicationCommandData> { 
        return {
            name: this.name,
            description: 'Fuck off'
        };
    }

    async handler(interaction: CommandInteraction) {
        await interaction.reply("Fuck off.");
    }
}