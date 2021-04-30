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

const colors = [
    "Ice Silver Metallic",
    "World Rally Blue",
    "Crystal White Pearl",
    "Pure Red",
    "Lapis Blue Pearl",
    "Dark Grey Metallic",
    "Crystal Black Silica",
    "Platinum Silver Metallic"
];

const lookupRoles = async () => {
    const roleCache = client.guilds.cache.get(guildId)?.roles.cache;
    return colors
        .map(color => roleCache?.find(role => role.name === color))
        .filter(role => role !== undefined)
        .map(role => {
            return { name: role?.name, value: role?.name }
        });
};

client.on('ready', async () => {
    console.log('Ready');

    const roles = await lookupRoles();
    console.log(roles);

    await getApp(guildId).commands.post({
        data: {
            name: 'add_role',
            description: 'Adds a role for the color of your car',
            options: [{
                name: "color",
                description: "The color of your vehicle",
                type: 3,
                required: true,
                choices: roles
            }]
        }
    });

    await getApp(guildId).commands.post({
        data: {
            name: 'remove_role',
            description: 'Removes a role for the color of your car',
            options: [{
                name: "color",
                description: "The color of your vehicle",
                type: 3,
                required: true,
                choices: roles
            }]
        }
    });

    client.ws.on('INTERACTION_CREATE' as DiscordJS.WSEventType, async (interaction) => {
        const command = interaction.data.name.toLowerCase();
        const user = await client.users.fetch(interaction.member.user.id);
        const guild = client.guilds.cache.get(guildId);
        const members = await guild?.members.fetch();
        const member = members?.get(user.id);

        if (command === "add_role") {
            const role = guild?.roles.cache.find(role => role.name === interaction.data.options[0].value)!;

            await member?.roles.add(role);

            (<any>client['api']).interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: `Added role ${role.name}!`
                    }
                }
            });
        }
        else if (command === "remove_role") {
            const role = guild?.roles.cache.find(role => role.name === interaction.data.options[0].value)!;

            await member?.roles.remove(role);

            (<any>client['api']).interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: `Removed role ${role.name}!`
                    }
                }
            });
        }
    });
});


client.login(process.env.TOKEN);
