import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { CoffeeTrack } from "lavacoffee";
import { config } from "../../config";
import { msParser, registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "seek",
    description: "Seek the player into specific position of current track, if any",
    preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
})
export class SeekCommand extends Command {
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

        const posStr = interaction.options.getString("position", true)

        let pos: number

        try {
            pos = msParser.parseToMS(posStr)
        } catch {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed(
                    "Failed to parse position, make sure it's in valid format\n" +
                    "Example:\n" +
                    "`42s`\n" +
                    "`1m7s`\n" +
                    "`1h2m14s`\n"
                )]
            })
            return
        }

        if (pos < 0) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("Position must be atleast 0 millisecond")]
            })
            return
        }

        if (pos > track.duration) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("Position must be less than current track duration")]
            })
            return
        }

        player.seek(pos)

        await interaction.reply({
            embeds: [this.makeEmbed(`Seek player to position **${msParser.parseToString(pos)}**`)]
        })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registerCommands(registry, {
            name: this.name,
            description: this.description,
            options: [{
                type: "STRING",
                required: true,
                name: "position",
                description: "The position to seek to, ex. 45s"
            }]
        })
    }

    private makeEmbed(content: string): MessageEmbed {
        return new MessageEmbed()
            .setDescription(content)
            .setColor(config.embedColor)
    }
}
