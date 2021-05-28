import { CommandInteraction, GuildMember, GuildMemberRoleManager, Role, ApplicationCommandData } from 'discord.js';
import { provide } from 'inversify-binding-decorators';
import { lookupRoles } from "..";
import { ICommand, Command } from '../models/commandManager';
import { alterRole } from '../utils/roleCommandBase';
                
const locations = [
    "SoCal",
    "NorCal",
    "Michigan",
    "Vermont",
    "Florida",
    "Virginia",
    "Washington",
    "Arizona",
    "Ontario, Canada",
];

@provide(Command)
export class AddLocationCommand implements ICommand {
    name = 'add_location';
    async getCommandData(): Promise<ApplicationCommandData> {
        const locationRoles = await lookupRoles(locations);

        return {
            name: this.name,
            description: 'Adds a role for your location',
            options: [{
                name: "location",
                description: "Your location",
                type: "STRING",
                required: true,
                choices: locationRoles
            }]
        };
    }

    async handler(interaction: CommandInteraction) {
        await alterRole(interaction, interaction.options[0].value as string, "add");
    }
}

@provide(Command)
export class RemoveLocationCommand implements ICommand {
    name = 'remove_location';
    async getCommandData(): Promise<ApplicationCommandData> {
        const locationRoles = await lookupRoles(locations);
        console.log(locationRoles);

        return {
            name: this.name,
            description: 'Removes a role for your location',
            options: [{
                name: "location",
                description: "Your location",
                type: "STRING",
                required: true,
                choices: locationRoles
            }]
        };
    }

    async handler(interaction: CommandInteraction) {
        await alterRole(interaction, interaction.options[0].value as string, "remove");
    }
}