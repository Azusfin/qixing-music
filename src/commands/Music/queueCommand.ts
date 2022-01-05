import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, Message, MessageActionRow, MessageButton, MessageEmbed, User } from "discord.js";
import humanizeDuration from "humanize-duration";
import { CoffeeLava, CoffeeTrack } from "lavacoffee";
import { config } from "../../config";
import { registerCommands } from "../../Util";

const queueItems = 3

@ApplyOptions<CommandOptions>({
    name: "queue",
    description: "Show tracks in the queue, if any",
    preconditions: ["allowMaintenance", "GuildOnly", "needPlayer"]
})
export class QueueCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const { lava } = this.container.client

        let page = 0

        const [embed, actionRow] = this.build(lava, interaction.guildId!, page, false)

        const msg = await interaction.reply({
            ephemeral: true,
            fetchReply: true,
            embeds: [embed],
            components: [actionRow]
        }) as Message

        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 120 * 1000,
            filter(buttonInteraction) {
                return buttonInteraction.user.id === interaction.user.id
            }
        })

        collector.on("collect", buttonInteraction => {
            if (buttonInteraction.customId === "queue-previous") page--
            if (buttonInteraction.customId === "queue-next") page++

            const [embed, actionRow, currentPage] = this.build(lava, interaction.guildId!, page, false)
            page = currentPage

            void buttonInteraction.update({
                embeds: [embed],
                components: [actionRow]
            })
        })

        collector.once("end", () => {
            const [embed, actionRow] = this.build(lava, interaction.guildId!, page, true)

            void interaction.editReply({
                embeds: [embed],
                components: [actionRow]
            })
        })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registerCommands(registry, {
            name: this.name,
            description: this.description
        })
    }

    private build(
        lava: CoffeeLava,
        guildID: string,
        page: number,
        end: boolean
    ): [MessageEmbed, MessageActionRow, number] {
        const player = lava.get(guildID)

        const embed = new MessageEmbed()
            .setTitle("Queue")
            .setColor(config.embedColor)

        const previous = new MessageButton()
            .setCustomId("queue-previous")
            .setEmoji("⬅️")
            .setStyle("PRIMARY")
            .setDisabled(true)

        const refresh = new MessageButton()
            .setCustomId("queue-refresh")
            .setEmoji("🔄")
            .setStyle("PRIMARY")
            .setDisabled(end)

        const next = new MessageButton()
            .setCustomId("queue-next")
            .setEmoji("➡️")
            .setStyle("PRIMARY")
            .setDisabled(true)

        if (!player) {
            embed.setDescription("No music player found")
        } else {
            const length = player.queue.length

            let duration = 0

            for (const track of player.queue) {
                if ((track as CoffeeTrack).isStream) {
                    duration = -1
                    break
                }

                duration += track.duration!
            }

            embed.setDescription(
                `\`\`\`\nLength: ${length.toLocaleString("en-us")}\n` +
                `Duration: ${
                    duration === -1
                        ? "N/A"
                        : humanizeDuration(duration, { maxDecimalPoints: 0 })
                }\`\`\``
            )

            if (!length) {
                embed.addFields({
                    name: "Tracks",
                    value: "Queue is empty"
                })
            } else {
                const maxPage = Math.ceil(length / queueItems) - 1
                const currentPage = Math.min(page, maxPage)

                const start = currentPage * queueItems

                const tracks = player.queue.slice(start, start + queueItems)
                const tracksText = tracks
                    .map((queueTrack, index) => {
                        const track = queueTrack as CoffeeTrack
                        return `${index + 1 + start}. [${track.title}](${track.url})\`\`\`\n` +
                            `Author: ${track.author}\n` +
                            `Requested By: ${(track.requester as User).tag}\n` +
                            `Duration: ${track.isStream ? "N/A" : humanizeDuration(track.duration, { maxDecimalPoints: 0 })}` +
                            `\`\`\``
                    })
                    .join("\n")

                embed
                    .addFields({
                        name: "Tracks",
                        value: tracksText
                    })
                    .setFooter({
                        text: `Page ${currentPage + 1} of ${maxPage + 1}`
                    })

                previous.setDisabled(end || !currentPage)
                next.setDisabled(end || currentPage === maxPage)

                return [
                    embed,
                    new MessageActionRow()
                        .addComponents(previous, refresh, next),
                    currentPage
                ]
            }
        }

        return [
            embed,
            new MessageActionRow()
                .addComponents(previous, refresh, next),
            0
        ]
    }
}
