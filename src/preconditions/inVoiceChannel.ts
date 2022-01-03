import { ApplyOptions } from "@sapphire/decorators";
import { Precondition, PreconditionOptions, PreconditionResult } from "@sapphire/framework";
import { CommandInteraction, GuildMember } from "discord.js";

@ApplyOptions<PreconditionOptions>({
    name: "inVoiceChannel"
})
export class InVoiceChannel extends Precondition {
    public override chatInputRun(interaction: CommandInteraction): PreconditionResult {
        const memberVoice = (interaction.member! as GuildMember).voice
        const botVoice = interaction.guild!.me!.voice

        const isMemberInVoice = memberVoice.channelId !== null
        const isBotInVoice = botVoice.channelId !== null
        const isNoOneInVC = !botVoice.channel?.members.filter(m => !m.user.bot).size
        const isHasPermission = interaction.memberPermissions?.has("MANAGE_CHANNELS", true)

        return isMemberInVoice && (isBotInVoice ? (isNoOneInVC || isHasPermission) : true)
            ? this.ok()
            : this.error({ message: "You need to be in a voice channel" })
    }
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        inVoiceChannel: never
    }
}
