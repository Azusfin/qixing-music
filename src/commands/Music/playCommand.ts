import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, GuildMember, Message, MessageEmbed, MessageSelectMenu } from "discord.js";
import { CoffeeTrack, Utils } from "lavacoffee";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "play",
    description: "Load and play or add a track into queue",
    preconditions: ["allowMaintenance", "GuildOnly", "inVoiceChannel"]
})
export class PlayCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const { client: { lava } } = this.container

        await interaction.deferReply()

        const result = await lava.search({ query: interaction.options.getString("track", true) }, interaction.user)

        if (result.loadType === Utils.LoadTypes.NoMatches) {
            await interaction.editReply({
                embeds: [this.errorEmbed("No result found from query")]
            })
            return
        }

        if (result.loadType === Utils.LoadTypes.LoadFailed) {
            await interaction.editReply({
                embeds: [this.errorEmbed(
                    `Load failed, Reason: \`\`\`\n` +
                    `${result.error!.severity}: ${result.error!.message}\`\`\``
                )]
            })
            return
        }

        if (result.loadType === Utils.LoadTypes.SearchResult && result.tracks.length > 1) {
            const length = Math.min(25, result.tracks.length)
            const selectMenu = new MessageSelectMenu()
                .setMinValues(1)
                .setMaxValues(length)
                .setCustomId("play-search")
                .setPlaceholder("Choose atleast one track")

            for (let i = 0; i < length; i++) {
                const track = result.tracks[i]

                selectMenu.addOptions({
                    label: track.url,
                    value: i.toString(),
                    description: track.title.length > 100
                        ? `${track.title.substring(0, 97)}...`
                        : track.title
                })
            }

            const embed = new MessageEmbed()
                .setTitle("Search Results")
                .setDescription("Multiple tracks found, please select atleast one within 30 seconds")
                .setColor(config.embedColor)

            const msg = await interaction.editReply({
                embeds: [embed],
                components: [{
                    type: "ACTION_ROW",
                    components: [selectMenu]
                }]
            }) as Message

            let success = false

            try {
                const selectMenuInteraction = await msg.awaitMessageComponent({
                    time: 30e3,
                    componentType: "SELECT_MENU",
                    filter: selectMenuInteraction => selectMenuInteraction.user.id === interaction.user.id
                })

                const tracks: CoffeeTrack[] = []

                for (const indexString of selectMenuInteraction.values) {
                    const index = Number(indexString)
                    tracks.push(result.tracks[index])
                }

                result.tracks = tracks
                success = true
            } catch {
                embed.setDescription("The prompt has been timed out")
                await interaction.editReply({ embeds: [embed], components: [] })
            }

            if (!success) return
        }

        const player = this.container.client.lava.create({
            guildID: interaction.guildId!,
            metadata: {
                text: interaction.channel
            }
        })

        player.queue.add(result.tracks)

        const embed = new MessageEmbed()
            .setTitle("Loaded Tracks")
            .setColor(config.embedColor)

        if (result.loadType === Utils.LoadTypes.PlaylistLoaded) {
            embed.setDescription(`Loaded playlist **${result.playlist!.name}**`)
        } else if (result.tracks.length === 1) {
            embed.setDescription(`Added [${result.tracks[0].title}](${result.tracks[0].url})`)
        } else {
            embed.setDescription(`Added:\n${
                result.tracks
                    .map((track, pos) => `${pos + 1}. [${track.title}](${track.url})`)
                    .join("\n")
            }`)
        }

        await interaction.editReply({ embeds: [embed], components: [] })

        if (player.voiceState !== Utils.PlayerVoiceStates.Connected) {
            player.options.voiceID = (interaction.member as GuildMember).voice.channelId!
            player.connect()
        }

        if (!player.queue.current) await player.play({})
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registerCommands(registry, {
            name: this.name,
            description: this.description,
            options: [{
                type: "STRING",
                required: true,
                name: "track",
                description: "The track to load and play or add into queue"
            }]
        })
    }

    private errorEmbed(msg: string): MessageEmbed {
        return new MessageEmbed()
            .setTitle("Load Track Error")
            .setDescription(msg)
            .setColor(config.embedColor)
    }
}
