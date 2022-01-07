import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, Message, MessageButton, MessageEmbed, User } from "discord.js";
import humanizeDuration from "humanize-duration";
import { CoffeeLava, CoffeeTrack, Utils } from "lavacoffee";
import { config } from "../../config";
import { progressBar, registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "nowplaying",
    description: "Get the currently playing track, if any",
    preconditions: ["allowMaintenance", "GuildOnly", "needPlayer"]
})
export class NowPlayingCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const { lava } = this.container.client

        const msg = await interaction.reply({
            ephemeral: true,
            fetchReply: true,
            embeds: [this.buildEmbed(lava, interaction.guildId!)],
            components: [{
                type: "ACTION_ROW",
                components: [
                    new MessageButton()
                        .setCustomId("nowplaying-refresh")
                        .setEmoji("🔄")
                        .setStyle("PRIMARY")
                ]
            }]
        }) as Message

        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 120 * 1000,
            filter(buttonInteraction) {
                return buttonInteraction.user.id === interaction.user.id
            }
        })

        collector.on("collect", buttonInteraction => {
            void buttonInteraction.update({ embeds: [this.buildEmbed(lava, interaction.guildId!)] })
        })

        collector.once("end", () => {
            void interaction.editReply({
                embeds: [this.buildEmbed(lava, interaction.guildId!)],
                components: [{
                    type: "ACTION_ROW",
                    components: [
                        new MessageButton()
                            .setCustomId("nowplaying-refresh")
                            .setEmoji("🔄")
                            .setStyle("PRIMARY")
                            .setDisabled(true)
                    ]
                }]
            })
        })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registerCommands(registry, {
            name: this.name,
            description: this.description
        })
    }

    private buildEmbed(lava: CoffeeLava, guildID: string): MessageEmbed {
        const player = lava.get(guildID)
        const embed = new MessageEmbed()
            .setTitle("Now Playing")
            .setColor(config.embedColor)

        if (!player) {
            embed.setDescription("No music player found")
        } else if (player.queue.current) {
            const track = player.queue.current as CoffeeTrack
            const [bar, percentage] = progressBar(
                track.isStream ? 1 : track.duration,
                track.isStream ? 1 : player.absolutePosition,
                track.url
            )

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
                }, {
                    name: "Loop",
                    value: player.loop === Utils.LoopMode.None
                        ? "None"
                        : player.loop === Utils.LoopMode.Queue
                            ? "Queue"
                            : "Track",
                    inline: true
                }, {
                    name: "Volume",
                    value: `${player.options.volume}%`,
                    inline: true
                }, {
                    name: "Paused",
                    value: player.state === Utils.PlayerStates.Paused ? "Yes" : "No",
                    inline: true
                }, {
                    name: "Progress",
                    value: `${bar}\n` +
                        `${track.isStream
                            ? "N/A"
                            : `${humanizeDuration(
                                player.absolutePosition, { maxDecimalPoints: 0 }
                            )} (${percentage.toFixed(2)}%)`}`
                })

            const thumbnail = track.displayThumbnail()

            if (thumbnail) embed.setThumbnail(thumbnail)
        } else {
            embed.setDescription("No track is currently playing")
        }

        return embed
    }
}
