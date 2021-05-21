import { CommandInteraction, GuildMember, GuildMemberRoleManager, Role } from 'discord.js';
import { Command } from ".";

interface RoleCommandData {
    roleAlteration: RoleAlteration
}

export async function RoleCommand(interaction: CommandInteraction, command: Command<RoleCommandData>) {
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