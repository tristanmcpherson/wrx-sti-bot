import { ApplicationCommandData, CommandInteraction, Client, TextChannel, User } from "discord.js";
import { provide } from "inversify-binding-decorators";
import { Command, ICommand } from "../models/commandManager";
import quoteManager, { Author, Quote } from "../utils/quoteManager";


const constructAuthorMap = (authors: Author[]): { [id: string]: Author } => {
    return authors.reduce((authorMap, author) => {
        if (author.id in authorMap) {
            return authorMap;
        }
        return {
            ...authorMap,
            [author.id]: author,
        };
    }, {})
}

const quoteToString = (quote: Quote): string => {
    const year = (new Date(quote.createdAt)).getFullYear();
    const authors = quote.authors.map(({ username }) => username).join(', ');
    let quoteContent;

    if (quote.authors.length > 1) {
        const authorMap = constructAuthorMap(quote.authors);
        quoteContent = quote.messages.reduce((content, message) => {
            return content + `${authorMap[message.authorId].username}: "${message.content}"\n`
        }, '') + '\n';
    } else {
        quoteContent = `"${quote.messages.map(message => message.content).join('\n')}" `;
    }

    return `Degen Quote #${quote.id}\n\n` + quoteContent + `- ${authors} (${year})`;
}

@provide(Command)
class AddDegenQuoteCommand implements ICommand {
    async getCommandData(): Promise<ApplicationCommandData> {
        return {
            name: 'add_degen_quote',
            description: 'Adds a new degen quote',
            options: [{
                name: "message_ids",
                description: "Comma-separated IDs of the messages to quote",
                type: "STRING",
                required: true,
            }, {
                name: "channel_id",
                description: "ID of the channel, if different from current channel",
                type: "STRING",
                required: false,
            }],
        };
    }

    async handler(interaction: CommandInteraction, client: Client) {
        const messageIds = (interaction.options[0].value as string).split(',');
        let channel;
        if (interaction.options.length > 1 && interaction.options[1].value) {
            const channelId = interaction.options[1].value as string;
            try {
                channel = await client.channels.fetch(channelId) as TextChannel;
            } catch (e) {
                await interaction.reply(`Couldn't find a channel with ID ${channelId}.`)
                return;
            }
        } else {
            channel = await client.channels.fetch(interaction.channel!.id) as TextChannel;
        }
        const messages = [];
        for (let i = 0; i < messageIds.length; i++) {
            const messageId = messageIds[i];
            try {
                const message = await channel.messages.fetch(messageId);
                messages.push(message);
            } catch (e) {
                await interaction.reply(`Couldn't find a message with ID ${messageId} (#${i + 1} in your list).`)
                return;
            }
        }
        const firstMessage = messages[0];
        const content = messages.reduce((prevContent, message) => {
            return prevContent += `${prevContent.length > 0 ? '\n' : ''}${message.content}`;
        }, '')
        const authorMap = constructAuthorMap(messages.map(message => message.author));
        const quote = await quoteManager.save({
            guildId: firstMessage.guild!.id,
            channelId: firstMessage.channel.id,
            messages: messages.map(({ author: { id: authorId }, content, id }) => ({
                id,
                content,
                authorId,
            })),
            authors: Object.entries(authorMap).map(([authorId, author]) => ({
                id: author.id,
                username: author.username,
                discriminator: author.discriminator,
            })),
            createdAt: firstMessage.createdAt.getTime(),
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
