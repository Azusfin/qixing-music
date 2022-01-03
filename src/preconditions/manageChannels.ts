import { ApplyOptions } from "@sapphire/decorators";
import { Precondition, PreconditionOptions, PreconditionResult } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";

@ApplyOptions<PreconditionOptions>({
    name: "manageChannels"
})
export class ManageChannels extends Precondition {
    public override chatInputRun(interaction: CommandInteraction): PreconditionResult {
        const voice = interaction.guild!.me!.voice

        const isNotInVC = !voice.channelId
        const isNoOneInVC = !voice.channel?.members.filter(m => !m.user.bot).size
        const isLonely = voice.channel?.members.filter(m => !m.user.bot).size === 1 &&
            voice.channel.members.has(interaction.user.id)
        const isHasPermission = interaction.memberPermissions?.has("MANAGE_CHANNELS", true)

        return isNotInVC || isNoOneInVC || isLonely || isHasPermission
            ? this.ok()
            : this.error({ message: "You need to have \"MANAGE_CHANNELS\" permission" })
    }
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        manageChannels: never
    }
}
