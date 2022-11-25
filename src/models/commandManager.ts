import { ApplicationCommandData, ChatInputCommandInteraction, Client, CommandInteraction, GuildMember } from "discord.js";
import { inject, injectable, multiInject } from "inversify";
import { isModerator } from "../utils/discord";

export const Command = Symbol("Command");

export interface ICommand {
    getCommandData: () => Promise<ApplicationCommandData>;
    handler: (interaction: CommandInteraction, client: Client) => Promise<void>;
    moderatorOnly?: () => boolean,
}

@injectable()
export class CommandManager {
    _client: Client
    _guildId?: string
    _commands: ICommand[]
    _commandMap: Map<string, ICommand> = new Map<string, ICommand>()

    constructor(@multiInject(Command) commands: ICommand[], client: Client, @inject("guildId") guildId?: string) {
        this._client = client;
        this._guildId = guildId;
        this._commands = commands;
    }

    registerCommands = async (): Promise<void> => {
        const addCommand = (command: ApplicationCommandData) => {
            (async () => {
                // Justin's server
                const guild = await this._client.guilds.fetch('382635966495588354');
                guild.commands.create(command);
            })();

            if (this._guildId) {
                return this._client.guilds.cache.get(this._guildId)?.commands.create(command);
            }

            return this._client.application?.commands.create(command);
        };

        console.log(`Registering ${this._commands.length} commands.`);
        await Promise.all(this._commands.map(async command => {
            const commandData = await command.getCommandData()
            await addCommand(commandData);
            this._commandMap.set(commandData.name, command);
        }));
    }

    handleCommand = async (commandInteraction: CommandInteraction, commandName: string): Promise<void> => {
        console.log(commandInteraction, commandName)
        const command = this._commandMap.get(commandName);
        if (command) {
            if (command.moderatorOnly && command.moderatorOnly() && !isModerator(commandInteraction.member as GuildMember)) {
                await commandInteraction.reply('You must be a moderator to use that command.');
                return;
            }
            return command.handler(commandInteraction, this._client);
        }
    }
}
