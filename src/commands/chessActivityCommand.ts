import { ApplicationCommandData, CommandInteraction, Client, fetchRecommendedShardCount, ApplicationCommandOptionType, ChatInputCommandInteraction, ChatInputApplicationCommandData } from "discord.js";
import { provide } from "inversify-binding-decorators";
import fetch from "node-fetch";
import { Command, ICommand } from "../models/commandManager";

type RecentActivity = Array<{
    interval: {start: number, end: number},
    games?: {blitz?: {win: number, loss: number, draw: number, rp: {before: number, after: number}}},
}>

const fetchRecentActivity = async (username: string): Promise<RecentActivity> => {
    const activityResponse = await fetch(`https://lichess.org/api/user/${username}/activity`);
    const activityData = await activityResponse.json();
    console.log(activityData);
    return activityData;
}

const formatLastActivity = (recentActivity: RecentActivity): string => {
    const [mostRecent] = recentActivity;
    const blitz = mostRecent?.games?.blitz;
    if (!blitz) {
        return '';
    }
    return `blitz: ${blitz.win} dubs, ${blitz.loss} L's, from ${blitz.rp.before} to ${blitz.rp.after}`;
}

const formatRecentActivity = (recentActivity: RecentActivity): string => {
    const blitzGames = recentActivity.map(activity => activity.games?.blitz).filter(blitz => blitz).map(blitz => blitz!);
    const summary = blitzGames.reduce((acc, game) => {
        return {
            win: acc.win + game.win,
            loss: acc.loss + game.loss,
            rp: {
                before: game.rp.before,
                after: acc.rp.after === -1 ? game.rp.after : acc.rp.after,
            }
        };
    }, {win: 0, loss: 0, rp: {before: -1, after: -1}})
    return `blitz: ${summary.win} dubs, ${summary.loss} L's, from ${summary.rp.before} (shit) to ${summary.rp.after} (${summary.rp.after > summary.rp.before ? 'still shit' : 'even shittier'})`;
}

@provide(Command)
class ChessActivityCommand implements ICommand {
    async getCommandData(): Promise<ChatInputApplicationCommandData> {
        return {
            name: 'chess_activity',
            description: 'Gets recent lichess.org activity',
            options: [{
                name: "lusername",
                description: "lichess.org player username",
                type: ApplicationCommandOptionType.String,
                required: true,
            }],
        };
    }

    async handler(interaction: CommandInteraction, client: Client) {
        console.log(interaction);
        const username = interaction.options.get('lusername', true).value!.toString();
        const recentActivity = await fetchRecentActivity(username);
        await interaction.reply(`https://lichess.org/@/${username} recent activity:\n${formatRecentActivity(recentActivity)}`);
    }
}
