import { GuildMember, Role } from "discord.js";

const MODERATOR_ROLES = [
    'Moderator',
    'Submoderator',
]

export const isModerator = (member: GuildMember): boolean => 
    member
        .roles
        .valueOf()
        .some((role: Role) => MODERATOR_ROLES.includes(role.name));
