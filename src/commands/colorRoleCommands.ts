import { ApplicationCommandData, ApplicationCommandOptionType, CommandInteraction } from "discord.js";
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
    "Plasma Blue Pearl",
];

@provide(Command)
class AddColorRoleCommand implements ICommand {
    async getCommandData(): Promise<ApplicationCommandData> {
        const colorRoles = lookupRoles(colors);

        return Promise.resolve({
            name: 'add_role',
            description: 'Adds a role for the color of your car',
            options: [{
                name: "color",
                description: "The color of your vehicle",
                type: 3,
                required: true,
                choices: colorRoles
            }]
        });
    }

    async handler(interaction: CommandInteraction) {
        await alterRole(interaction, interaction.options.get('color')!.value as string, "add");
    }
}

@provide(Command)
class RemoveColorRoleCommand implements ICommand {
    async getCommandData(): Promise<ApplicationCommandData> {
        const colorRoles = lookupRoles(colors);
        console.log(colorRoles);

        return Promise.resolve({
            name: 'remove_role',
            description: 'Removes a role for your location',
            options: [{
                name: "location",
                description: "Your location",
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: colorRoles
            }]
        });
    }

    async handler(interaction: CommandInteraction) {
        await alterRole(interaction, interaction.options.get("location")!.value as string, "remove");
    }
}
