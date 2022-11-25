import { APIInteractionGuildMember, GuildMember, Role } from "discord.js";

const MODERATOR_ROLES = [
    'Moderator',
    'Submoderator',
]

export const isModerator = (member: GuildMember): boolean => 
    member && member
        .roles
        .valueOf()
        .some((role: Role) => MODERATOR_ROLES.includes(role.name));
