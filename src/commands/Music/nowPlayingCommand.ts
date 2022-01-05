import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed, User } from "discord.js";
import humanizeDuration from "humanize-duration";
import { CoffeeTrack } from "lavacoffee";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "nowplaying",
    description: "Get the currently playing track, if any",
    preconditions: ["allowMaintenance", "GuildOnly", "needPlayer"]
})
export class NowPlayingCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const player = this.container.client.lava.get(interaction.guildId!)!
        const embed = new MessageEmbed()
            .setTitle("Now Playing")
            .setColor(config.embedColor)

        if (player.queue.current) {
            const track = player.queue.current as CoffeeTrack

            embed
                .setDescription(`[${track.title}](${track.url})`)
                .addFields({
                    name: "Author",
                    value: track.author,
                    inline: true
                }, {
                    name: "Requested By",
                    value: (track.requester as User).tag,
                    inline: true
                }, {
                    name: "Duration",
                    value: track.isStream
                        ? "N/A"
                        : humanizeDuration(track.duration, { maxDecimalPoints: 0 }),
                    inline: true
                })

            const thumbnail = track.displayThumbnail()

            if (thumbnail) embed.setThumbnail(thumbnail)
        } else {
            embed.setDescription("No track is currently playing")
        }

        await interaction.reply({
            ephemeral: true,
            embeds: [embed]
        })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registerCommands(registry, {
            name: this.name,
            description: this.description
        })
    }
}
