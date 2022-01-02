import { ApplyOptions } from "@sapphire/decorators"
import { Precondition, PreconditionOptions } from "@sapphire/framework"
import { CommandInteraction } from "discord.js"
import { config } from "../config"

@ApplyOptions<PreconditionOptions>({
    name: "allowMaintenance"
})
export class Maintenance extends Precondition {
    public override chatInputRun(interaction: CommandInteraction) {
        return config.maintenance && !config.owners.includes(interaction.user.id)
            ? this.error({ message: "Bot is in maintenance state, only owners can use it currently" })
            : this.ok()
    }
}

declare module "@sapphire/framework" {
    export interface Preconditions {
        allowMaintenance: never
    }
}
