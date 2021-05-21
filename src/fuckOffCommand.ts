import { CommandInteraction } from "discord.js";
import { Command } from ".";

export async function FuckOffCommand(interaction: CommandInteraction, command: Command<{}>) {
    await interaction.reply("Fuck off.");
}