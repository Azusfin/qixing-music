import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { CoffeeTrack } from "lavacoffee";
import { OpCodes, PlayerStates } from "lavacoffee/dist/utils";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "replay",
    description: "Force replay the player, if any",
    preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
})
export class ReplayCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const player = this.container.client.lava.get(interaction.guildId!)!
        const track = player.queue.current as CoffeeTrack | undefined

        if (!track) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("No track is currently playing")]
            })
            return
        }

        try {
            await player.node.send({
                op: OpCodes.Play,
                guildId: interaction.guildId!,
                track: track.base64,
                startTime: player.position,
                pause: player.state === PlayerStates.Paused
            })
        } catch {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("Failed to replay the player")]
            })
            return
        }

        player.replaying = true

        await interaction.reply({
            embeds: [this.makeEmbed(`Replayed [${track.title}](${track.url})`)]
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
