/* eslint-disable @typescript-eslint/no-misused-promises */
import "reflect-metadata";
import { Client, Interaction, Message, GatewayIntentBits, ApplicationCommandOptionChoiceData } from "discord.js";
import * as dotenv from "dotenv";
import { CommandManager } from './models/commandManager.js';
import { MessageManager } from "./models/messageManager.js";
import { HydrationManager } from "./models/hydrationManager.js";
import container from "./inversify.config.js";

dotenv.config();

const guildId = '808035465437511680';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
container.bind(Client).toConstantValue(client);
container.bind("guildId").toConstantValue(guildId);

const globalCommandManager = container.resolve(CommandManager);
const globalMessageManager = container.resolve(MessageManager);

export const lookupRoles = (whitelist: string[]): ApplicationCommandOptionChoiceData<string>[] => {
    const roleCache = client.guilds.cache.get(guildId)?.roles.cache;
    return whitelist
        .map(whitelistedRoleName => roleCache?.find(role => role.name === whitelistedRoleName))
        .filter(role => role !== undefined)
        .map(role => {
            return { name: role!.name, value: role!.name }
        });
};

client.on('ready', async () => {
    console.log('Ready')

    await globalCommandManager.registerCommands();
    console.log("Registered all commands.");

    // const hydrationManager = new HydrationManager(client, '808488532511424542', '859899174485229570');
});

client.on('message', async (message: Message) => {
    await globalMessageManager.handleMessage(message);
});

client.on('interaction', async (interaction: Interaction) => {
    if (!interaction.isCommand()) { return; }

    await globalCommandManager.handleCommand(interaction, interaction.commandName);
});

void client.login(process.env.TOKEN);
