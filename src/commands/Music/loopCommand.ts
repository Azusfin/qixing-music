import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Utils } from "lavacoffee";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "loop",
    description: "Change the player loop mode, if any",
    preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
})
export class LoopCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const player = this.container.client.lava.get(interaction.guildId!)!
        const loop = interaction.options.getString("mode", true) as "none" | "queue" | "track"

        player.setLoop(
            loop === "none"
                ? Utils.LoopMode.None
                : loop === "queue"
                    ? Utils.LoopMode.Queue
                    : Utils.LoopMode.Track
        )

        await interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setDescription(`Set loop mode to **${loop[0].toUpperCase()}${loop.slice(1)}**`)
                    .setColor(config.embedColor)
            ]
        })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registerCommands(registry, {
            name: this.name,
            description: this.description,
            options: [{
                type: "STRING",
                name: "mode",
                required: true,
                description: "The loop mode to set",
                choices: [{
                    name: "None",
                    value: "none"
                }, {
                    name: "Queue",
                    value: "queue"
                }, {
                    name: "Track",
                    value: "track"
                }]
            }]
        })
    }
}
