import { CommandInteraction } from "discord.js";
import { Command } from ".";

export async function MuhrumbleCommand(interaction: CommandInteraction, command: Command<{}>) {
    await interaction.reply("https://cdn.discordapp.com/attachments/808043989084930069/836067805497393172/rumble.png");
}