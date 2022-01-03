import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "join",
    description: "Make the bot join a voice channel",
    preconditions: ["allowMaintenance", "GuildOnly", "inVoiceChannel", "manageChannels"]
})
export class JoinCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const { voice } = (interaction.member! as GuildMember)

        const player = this.container.client.lava.create({
            guildID: interaction.guildId!,
            metadata: {
                text: interaction.channel
            }
        })

        player.options.voiceID = voice.channelId!
        player.connect()

        const embed = new MessageEmbed()
            .setTitle("Joined Voice Channel")
            .setDescription(`Joined to **${voice.channel!.name}**`)
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
