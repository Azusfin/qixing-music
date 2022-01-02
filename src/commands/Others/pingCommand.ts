import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "ping",
    description: "Ping the bot and show the bot latency"
})
export class PingCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const embed = new MessageEmbed()
            .setTitle("Pong! 🏓")
            .addFields({ name: "WS", value: `${this.container.client.ws.ping}ms`, inline: true })
            .setColor(config.embedColor)

        const before = Date.now()
        await interaction.reply({
            ephemeral: true,
            embeds: [embed]
        })

        embed.addFields({ name: "REST", value: `${Date.now() - before}ms`, inline: true })

        await interaction.editReply({
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
