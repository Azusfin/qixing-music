import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { CoffeeTrack } from "lavacoffee";
import { config } from "../../config";
import { calcRequiredUsers, registerCommands, skipVotes } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "voteskip",
    description: "Vote to skip current track in the player, if any",
    preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "inVoiceChannel"]
})
export class VoteSkipCommand extends Command {
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

        const voice = interaction.guild!.me!.voice

        if (!voice.channel) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("The bot need to be in a voice channel")]
            })
            return
        }

        const requiredUsers = calcRequiredUsers(voice.channel.members.filter(m => !m.user.bot).size)
        const votes = skipVotes.get(interaction.guildId!) ?? new Set()

        if (votes.size >= requiredUsers) {
            player.stop()
            await interaction.reply({
                embeds: [this.makeEmbed(`Skipped [${track.title}](${track.url})`)]
            })
            return
        }

        if (votes.has(interaction.user.id)) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("You already voted to skip current track")]
            })
            return
        }

        votes.add(interaction.user.id)
        skipVotes.set(interaction.guildId!, votes)

        await interaction.reply({
            embeds: [this.makeEmbed(`There are ${votes.size} people voted to skip current track (need ${requiredUsers})`)]
        })

        if (votes.size >= requiredUsers) {
            player.stop()
            await interaction.editReply({
                embeds: [this.makeEmbed(`Skipped [${track.title}](${track.url})`)]
            })
        }
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
