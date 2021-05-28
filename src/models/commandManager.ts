import { ApplicationCommandData, Client, CommandInteraction } from "discord.js";
import { inject, injectable, multiInject } from "inversify";

export const Command = Symbol("Command");

export interface ICommand {
    name: string;
    getCommandData: () => Promise<ApplicationCommandData>;
    handler: (interaction: CommandInteraction) => Promise<void>;
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

    registerCommands = async () => {
        const addCommand = (command: ApplicationCommandData) => {
            if (this._guildId) {
                return this._client.guilds.cache.get(this._guildId)?.commands.create(command);
            }

            return this._client.application?.commands.create(command);
        };

        console.log(`Registering ${this._commands.length} commands.`);
        const commandData = await Promise.all(this._commands.map(c => c.getCommandData()));
        await Promise.all(commandData.map(addCommand));
    }

    handleCommand = async (commandInteraction: CommandInteraction, commandName: string) => {
        const command = this._commands.find(command => command.name === commandName)
        if (command) {
            return command.handler(commandInteraction);
        }
    }
}
