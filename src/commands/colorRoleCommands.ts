import { ApplicationCommandData, CommandInteraction } from "discord.js";
import { provide } from "inversify-binding-decorators";
import { lookupRoles } from "..";
import { Command, ICommand } from "../models/commandManager";
import { alterRole } from "../utils/roleCommandBase";

const colors = [
    "Ice Silver Metallic",
    "World Rally Blue",
    "Crystal White Pearl",
    "Pure Red",
    "Lapis Blue Pearl",
    "Dark Grey Metallic",
    "Crystal Black Silica",
    "Platinum Silver Metallic",
    "Satin White Pearl",
    "Plasma Blue Pearl"
];

@provide(Command)
class AddColorRoleCommand implements ICommand {
    name = 'add_role';
    async getCommandData(): Promise<ApplicationCommandData> {
        const colorRoles = await lookupRoles(colors);

        return {
            name: this.name,
            description: 'Adds a role for the color of your car',
            options: [{
                name: "color",
                description: "The color of your vehicle",
                type: 3,
                required: true,
                choices: colorRoles
            }]
        };
    }

    async handler(interaction: CommandInteraction) {
        await alterRole(interaction, interaction.options[0].value as string, "add");
    }
}

@provide(Command)
class RemoveColorRoleCommand implements ICommand {
    name = 'remove_role';
    async getCommandData(): Promise<ApplicationCommandData> {
        const colorRoles = await lookupRoles(colors);
        console.log(colorRoles);

        return {
            name: this.name,
            description: 'Removes a role for your location',
            options: [{
                name: "location",
                description: "Your location",
                type: "STRING",
                required: true,
                choices: colorRoles
            }]
        };
    }

    async handler(interaction: CommandInteraction) {
        await alterRole(interaction, interaction.options[0].value as string, "remove");
    }
}
