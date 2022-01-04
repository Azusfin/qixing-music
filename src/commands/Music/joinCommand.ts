import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { config } from "../../config";
import { registerCommands } from "../../Util";

@ApplyOptions<CommandOptions>({
    name: "join",
    description: "Make the bot join a voice channel",
    preconditions: ["allowMaintenance", "GuildOnly", "inVoiceChannelAndPermitted", "manageChannels"]
})
export class JoinCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const { voice } = (interaction.member! as GuildMember)
        const perms = voice.channel!.permissionsFor(this.container.client.user!, true)!

        if (!perms.has(["CONNECT", "SPEAK"])) {
            await interaction.reply({
                ephemeral: true,
                embeds: [
                    new MessageEmbed()
                        .setTitle("Missing Permission")
                        .setDescription("The bot need **CONNECT** and **SPEAK** permission in the channel")
                        .setColor(config.embedColor)
                ]
            })
            return
        }

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
