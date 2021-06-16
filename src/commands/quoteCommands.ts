import { ApplicationCommandData, CommandInteraction, Client, TextChannel } from "discord.js";
import { provide } from "inversify-binding-decorators";
import { Command, ICommand } from "../models/commandManager";
import quoteManager, { Quote } from "../utils/quoteManager";


const quoteToString = (quote: Quote): string =>
    `"${quote.content}" - ${quote.author.username}, ${(new Date(quote.createdAt)).getFullYear()} (#${quote.id})`;

@provide(Command)
class AddDegenQuoteCommand implements ICommand {
    async getCommandData(): Promise<ApplicationCommandData> {
        return {
            name: 'add_degen_quote',
            description: 'Adds a new degen quote',
            options: [{
                name: "message_id",
                description: "The ID of the message to quote",
                type: "STRING",
                required: true,
            }],
        };
    }

    async handler(interaction: CommandInteraction, client: Client) {
        const messageId = interaction.options[0].value as string;
        const channel = await client.channels.fetch(interaction.channel!.id) as TextChannel;
        let message;
        try {
            message = await channel.messages.fetch(messageId);
        } catch (e) {
            await interaction.reply(`Couldn't find a message with that ID.`)
            return;
        }
        const quote = await quoteManager.save({
            guildId: message.guild!.id,
            channelId: message.channel.id,
            author: {
                id: message.author.id,
                username: message.author.username,
                discriminator: message.author.discriminator,
            },
            content: message.content,
            createdAt: message.createdAt.getTime(),
        });
        await interaction.reply(quoteToString(quote));
    }
}


@provide(Command)
class RandomDegenQuoteCommand implements ICommand {
    async getCommandData(): Promise<ApplicationCommandData> {
        return {
            name: 'random_degen_quote',
            description: 'Gets a random degen quote',
            options: [],
        };
    }

    async handler(interaction: CommandInteraction, client: Client) {
        const quote = await quoteManager.getRandomQuote();
        if (!quote) {
            await interaction.reply(`There aren't any quotes yet!`);
            return;
        }
        await interaction.reply(quoteToString(quote));
    }
}


@provide(Command)
class GetQuoteCommand implements ICommand {
    async getCommandData(): Promise<ApplicationCommandData> {
        return {
            name: 'get_degen_quote',
            description: 'Gets a degen quote',
            options: [{
                name: "quote_id",
                description: "The ID of the quote",
                type: "STRING",
                required: true,
            }],
        };
    }

    async handler(interaction: CommandInteraction, client: Client) {
        let quoteId = null;
        try {
            quoteId = parseInt(interaction.options[0].value as string, 10);
        } catch (e) {
            await interaction.reply(`Invalid quote ID`);
            return;
        }

        const quote = await quoteManager.getQuote(quoteId);
        if (!quote) {
            await interaction.reply(`Quote ${quoteId} doesn't exist`);
            return;
        }

        await interaction.reply(quoteToString(quote));
    }
}
