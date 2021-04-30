import * as DiscordJS from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

const guildId = '808035465437511680';

const intents = new DiscordJS.Intents(DiscordJS.Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');

const client = new DiscordJS.Client({ ws: { intents: intents } });

const getApp = (guildId: string) => {
    return (<any>client['api']).applications(client.user?.id).guilds(guildId);
};

const addCommand = async (command: any) => {
    getApp(guildId).commands.post(command);
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
            return { name: role?.name, value: role?.name }
        });
};

const lookupColorRoles = () => lookupRoles(colors);

const lookupLocationRoles = () => lookupRoles(locations);

client.on('ready', async () => {
    console.log('Ready');

    const colorRoles = await lookupColorRoles();
    console.log(colorRoles);

    await addCommand({
        data: {
            name: 'add_role',
            description: 'Adds a role for the color of your car',
            options: [{
                name: "color",
                description: "The color of your vehicle",
                type: 3,
                required: true,
                choices: colorRoles
            }]
        }
    });

    await addCommand({
        data: {
            name: 'remove_role',
            description: 'Removes a role for the color of your car',
            options: [{
                name: "color",
                description: "The color of your vehicle",
                type: 3,
                required: true,
                choices: colorRoles
            }]
        }
    });

    const locationRoles = await lookupLocationRoles();
    console.log(locationRoles);

    await addCommand({
        data: {
            name: 'add_location',
            description: 'Adds a role for your location',
            options: [{
                name: "location",
                description: "Your location",
                type: 3,
                required: true,
                choices: locationRoles
            }]
        }
    });

    await addCommand({
        data: {
            name: 'remove_location',
            description: 'Removes your location role',
            options: [{
                name: "location",
                description: "Your location",
                type: 3,
                required: true,
                choices: locationRoles
            }]
        }
    });
});

client.ws.on('INTERACTION_CREATE' as DiscordJS.WSEventType, async (interaction) => {
    const command = interaction.data.name.toLowerCase();
    const user = await client.users.fetch(interaction.member.user.id);
    const guild = client.guilds.cache.get(guildId);
    const members = await guild?.members.fetch();
    const member = members?.get(user.id);

    const addRoleCommands = [
        "add_role",
        "add_location",
    ]

    const removeRoleCommands = [
        "remove_role",
        "remove_location",
    ]

    if (addRoleCommands.includes(command)) {
        alterRole(guild, member, interaction, interaction.data.options[0].value, true);
    }
    else if (removeRoleCommands.includes(command)) {
        alterRole(guild, member, interaction, interaction.data.options[0].value, false);
    }
});

const alterRole = async (
    guild: DiscordJS.Guild | undefined,
    member: DiscordJS.GuildMember | undefined,
    interaction: { id: any; token: any; },
    roleName: string,
    add: boolean,
) => {
    const role = guild?.roles.cache.find(role => role.name === roleName)!;

    let message;
    if (add) {
        message = `Added role ${role.name}!`;
        await member?.roles.add(role);
    } else {
        message = `Removed role ${role.name}!`;
        await member?.roles.remove(role);
    }

    (<any>client['api']).interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: message,
            }
        }
    });
}

client.login(process.env.TOKEN);
