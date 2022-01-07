import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Utils } from "lavacoffee";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "resume",
    description: "Resume the player when paused, if any",
    preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
})
export class ResumeCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const player = this.container.client.lava.get(interaction.guildId!)!

        if (!player.queue.current) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("No track is currently playing")]
            })
            return
        }

        player.pause(false)

        await interaction.reply({
            ephemeral: player.state !== Utils.PlayerStates.Playing,
            embeds: [this.makeEmbed(
                player.state === Utils.PlayerStates.Playing
                    ? "Resumed the player"
                    : "Failed when trying to resume the player"
            )]
        })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registerCommands(registry, {
            name: this.name,
            description: this.description
        })
    }

    private makeEmbed(content: string): MessageEmbed {
        return new MessageEmbed()
            .setDescription(content)
            .setColor(config.embedColor)
    }
}
