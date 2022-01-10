import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "volume",
    description: "Set the player volume, if any",
    preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
})
export class VolumeCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const player = this.container.client.lava.get(interaction.guildId!)!
        const volume = interaction.options.getNumber("volume", true)

        player.setVolume(volume)

        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`Set the volume to **${volume}%**`)
                    .setColor(config.embedColor)
            ]
        })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registerCommands(registry, {
            name: this.name,
            description: this.description,
            options: [{
                type: "NUMBER",
                required: true,
                minValue: 0,
                maxValue: 1000,
                name: "volume",
                description: "The volume to set"
            }]
        })
    }
}
