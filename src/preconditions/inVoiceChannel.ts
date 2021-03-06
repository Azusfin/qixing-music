import { ApplyOptions } from "@sapphire/decorators";
import { Precondition, PreconditionOptions, PreconditionResult } from "@sapphire/framework";
import { CommandInteraction, GuildMember } from "discord.js";

@ApplyOptions<PreconditionOptions>({
    name: "inVoiceChannel"
})
export class InVoiceChannel extends Precondition {
    public override chatInputRun(interaction: CommandInteraction): PreconditionResult {
        const memberVoice = (interaction.member as GuildMember).voice
        const botVoice = interaction.guild!.me!.voice

        const isMemberInVoice = memberVoice.channelId !== null
        const isBotInVoice = botVoice.channelId !== null
        const isSameVoice = botVoice.channel?.members.has(interaction.user.id)

        return !isMemberInVoice
            ? this.error({ message: "You need to be in a voice channel" })
            : (isBotInVoice ? isSameVoice : true)
                ? this.ok()
                : this.error({ message: "You need to be in the same channel as the bot" })
    }
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        inVoiceChannel: never
    }
}
