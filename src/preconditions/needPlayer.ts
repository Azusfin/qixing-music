import { ApplyOptions } from "@sapphire/decorators";
import { Precondition, PreconditionOptions, PreconditionResult } from "@sapphire/framework";
import { CommandInteraction } from "discord.js";

@ApplyOptions<PreconditionOptions>({
    name: "needPlayer"
})
export class NeedPlayer extends Precondition {
    public override chatInputRun(interaction: CommandInteraction): PreconditionResult {
        const { players } = this.container.client.lava
        const guildID = interaction.guildId!

        return players.has(guildID)
            ? this.ok()
            : this.error({ message: "No music player is found in the current guild" })
    }
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        needPlayer: never
    }
}
