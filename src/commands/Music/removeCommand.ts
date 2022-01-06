import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "remove",
    description: "Remove specific tracks in the queue, if any",
    preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
})
export class RemoveCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const { queue, queue: { length } } = this.container.client.lava.get(interaction.guildId!)!

        if (!length) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("Queue is currently empty")]
            })
            return
        }

        const start = interaction.options.getNumber("start", true)
        const end = interaction.options.getNumber("end") ?? start

        if (start < 1) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("`start` option must be more than or equal to 1")]
            })
            return
        }

        if (start > length) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("`start` option must be less than or equal to queue length")]
            })
            return
        }

        if (end < start) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("`end` option must be more than or equal to `start` option")]
            })
            return
        }

        if (end > length) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("`end` option must be less than or equal to queue length")]
            })
            return
        }

        queue.remove(start - 1, end)

        await interaction.reply({
            ephemeral: true,
            embeds: [this.makeEmbed(`Successfully removed tracks from ${start} to ${end}`)]
        })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registerCommands(registry, {
            name: this.name,
            description: this.description,
            options: [{
                type: "NUMBER",
                name: "start",
                required: true,
                description: "The position where to start remove the tracks"
            }, {
                type: "NUMBER",
                name: "end",
                required: false,
                description: "The position where to end the removal"
            }]
        })
    }

    private makeEmbed(content: string): MessageEmbed {
        return new MessageEmbed()
            .setDescription(content)
            .setColor(config.embedColor)
    }
}
