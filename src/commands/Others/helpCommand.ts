import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "help",
    description: "Send a \"helpful\" message to show how to use the bot"
})
export class HelpCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const embed = new MessageEmbed()
            .setAuthor({
                name: `Hello ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ format: "jpg" })
            })
            .setDescription(
                `You can start using the bot by typing \`/<command>\` in the channel\n` +
                    `You may also find the commands in the slash menu`
            )
            .setColor(config.embedColor)

        await interaction.reply({
            ephemeral: true,
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
