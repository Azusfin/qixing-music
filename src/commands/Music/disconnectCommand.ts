import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "disconnect",
    description: "Make the bot disconnect from a voice channel",
    preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
})
export class DisconnectCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const player = this.container.client.lava.get(interaction.guildId!)!
        const msg = player.get<Message>("msg")

        await msg?.delete()
        player.destroy()

        const embed = new MessageEmbed()
            .setTitle("Disconnected")
            .setDescription("Disconnected from voice channel")
            .setColor(config.embedColor)

        await interaction.reply({ embeds: [embed] })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registerCommands(registry, {
            name: this.name,
            description: this.description
        })
    }
}
