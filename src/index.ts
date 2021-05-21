import { Intents, Client, ApplicationCommandData, ApplicationCommandOptionChoice, Guild, GuildMember, CommandInteraction, RoleManager, GuildMemberRoleManager, Role, Interaction } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

const guildId = '808035465437511680';

const intents = new Intents(Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');

const client = new Client({ intents });

const addCommand = (command: ApplicationCommandData) => {
    return client.guilds.cache.get(guildId)!.commands.create(command);
};

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

const lookupRoles = async (whitelist: string[]) => {
    const roleCache = client.guilds.cache.get(guildId)?.roles.cache;
    return whitelist
        .map(whitelistedRoleName => roleCache?.find(role => role.name === whitelistedRoleName))
        .filter(role => role !== undefined)
        .map(role => {
            return { name: role?.name, value: role?.name } as ApplicationCommandOptionChoice
        });
};

const lookupColorRoles = () => lookupRoles(colors);
const lookupLocationRoles = () => lookupRoles(locations);

client.on('ready', async () => {
    console.log('Ready');

    const colorRoles = await lookupColorRoles();
    console.log(colorRoles);

    await addCommand({
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

    await addCommand({
        name: 'remove_role',
        description: 'Removes a role for the color of your car',
        options: [{
            name: "color",
            description: "The color of your vehicle",
            type: 3,
            required: true,
            choices: colorRoles
        }]
    });

    const locationRoles = await lookupLocationRoles();
    console.log(locationRoles);

    await addCommand({
        name: 'add_location',
        description: 'Adds a role for your location',
        options: [{
            name: "location",
            description: "Your location",
            type: 3,
            required: true,
            choices: locationRoles
        }]
    });

    await addCommand({
        name: 'remove_location',
        description: 'Removes your location role',
        options: [{
            name: "location",
            description: "Your location",
            type: 3,
            required: true,
            choices: locationRoles
        }]
    });

    await addCommand({
        name: 'fuckoff',
        description: 'Fuck off'
    });
});

interface Command<T> {
    command: string,
    processor: (interaction: CommandInteraction, command: Command<T>) => Promise<void>
    data: T
}

interface RoleCommandData {
    roleAlteration: RoleAlteration
}

const CommandLookup: Command<any>[] = [
    { command: "add_role", processor: RoleCommand, data: { roleAlteration: "add" }},
    { command: "add_location", processor: RoleCommand, data: { roleAlteration: "add" }},
    { command: "remove_role", processor: RoleCommand, data: {roleAlteration: "remove" }},
    { command: "remove_location", processor: RoleCommand, data: {roleAlteration: "remove" }},
    { command: "fuckoff", processor: FuckOffCommand, data: {}}
];

client.on('interaction', async (interaction: Interaction) => {
    if (!interaction.isCommand()) { return; }

    const command = CommandLookup.find(lookup => lookup.command == interaction.commandName.toLowerCase());
    if (!command) {
        console.log(`Cannot find command of name: ${interaction.commandName.toLowerCase()}`)
        return;
    }

    await command.processor(interaction, command);
});

async function FuckOffCommand(interaction: CommandInteraction, command: Command<{}>) {
    await interaction.reply("Fuck off.");
}

async function RoleCommand(interaction: CommandInteraction, command: Command<RoleCommandData>) {
    await alterRole(interaction, interaction.options[0].value as string, command.data.roleAlteration);
}

type RoleAlteration = "add" | "remove";

interface RoleAlterationMetadata {
    message: string,
    action: () => Promise<GuildMember>
}

const alterRole = async (
    interaction: CommandInteraction,
    roleName: string,
    interactionType: RoleAlteration
) => {

    const role = interaction.guild?.roles.cache.find((role: Role) => role.name === roleName);

    if (!role) { return; }

    const roleManager = interaction.member!.roles as GuildMemberRoleManager;

    const roleActionLookup: [RoleAlteration, RoleAlterationMetadata][] = [
        ["add", { message: `Added role ${role.name}!`, action: () => roleManager.add(role) }], 
        ["remove", { message: `Removed role ${role.name}!`, action: () => roleManager.remove(role) }]
    ];

    const roleActionMetadata = roleActionLookup.find(rl => rl[0] === interactionType)![1];

    await roleActionMetadata!.action();
    await interaction.reply(roleActionMetadata!.message);
}

client.login(process.env.TOKEN);
