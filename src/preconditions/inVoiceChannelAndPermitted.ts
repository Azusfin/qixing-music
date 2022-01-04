import { ApplyOptions } from "@sapphire/decorators";
import { Precondition, PreconditionOptions, PreconditionResult } from "@sapphire/framework";
import { CommandInteraction, GuildMember } from "discord.js";

@ApplyOptions<PreconditionOptions>({
    name: "inVoiceChannelAndPermitted"
})
export class InVoiceChannelAndPermitted extends Precondition {
    public override chatInputRun(interaction: CommandInteraction): PreconditionResult {
        const memberVoice = (interaction.member! as GuildMember).voice
        const botVoice = interaction.guild!.me!.voice

        const isMemberInVoice = memberVoice.channelId !== null
        const isBotInVoice = botVoice.channelId !== null
        const isNoOneInVC = !botVoice.channel?.members.filter(m => !m.user.bot).size
        const isHasPermission = interaction.memberPermissions?.has("MANAGE_CHANNELS", true)

        return !isMemberInVoice
            ? this.error({ message: "You need to be in a voice channel" })
            : (isBotInVoice ? (isNoOneInVC || isHasPermission) : true)
                ? this.ok()
                : this.error({ message: "You need to have **MANAGE_CHANNELS** permission" })
    }
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        inVoiceChannelAndPermitted: never
    }
}
