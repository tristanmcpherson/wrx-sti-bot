import { GuildMember, CommandInteraction, Role, GuildMemberRoleManager } from "discord.js";

type RoleAlteration = "add" | "remove";

interface RoleAlterationMetadata {
    message: string,
    action: () => Promise<GuildMember>
}

export const alterRole = async (
    interaction: CommandInteraction,
    roleName: string,
    interactionType: RoleAlteration
): Promise<void> => {

    const role = interaction.guild?.roles.cache.find((role: Role) => role.name === roleName);

    if (!role) { return; }

    if (!interaction.member) { return; }

    const roleManager = interaction.member.roles as GuildMemberRoleManager;

    const roleActionLookup: [RoleAlteration, RoleAlterationMetadata][] = [
        ["add", { message: `Added role ${role.name}!`, action: () => roleManager.add(role) }],
        ["remove", { message: `Removed role ${role.name}!`, action: () => roleManager.remove(role) }]
    ];

    const roleActionMetadata = roleActionLookup.find(rl => rl[0] === interactionType)![1];

    await roleActionMetadata!.action();
    await interaction.reply(roleActionMetadata!.message);
}
