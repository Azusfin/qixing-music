import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Command, CommandOptions } from "@sapphire/framework";
import { CommandInteraction, EmbedFieldData, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { CoffeeNode } from "lavacoffee";
import { registerCommands } from "../../Util";
import { config } from "../../config";
import humanize from "humanize-duration"

const pageItems = 2

@ApplyOptions<CommandOptions>({
    name: "nodes",
    description: "Show the lavalink nodes statistics"
})
export class NodesCommand extends Command {
    public override async chatInputRun(interaction: CommandInteraction): Promise<void> {
        const nodes = [...this.container.client.lava.nodes.values()]

        let page = 0

        const msg = await interaction.reply({
            ephemeral: true,
            fetchReply: true,
            embeds: [this.buildEmbed(nodes, page)],
            components: this.buildActionRow(nodes, page, false)
        }) as Message

        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 120 * 1000,
            filter(buttonInteraction) {
                return buttonInteraction.user.id === interaction.user.id
            }
        })

        collector.on("collect", buttonInteraction => {
            if (buttonInteraction.customId === "nodes-previous") page--
            else if (buttonInteraction.customId === "nodes-next") page++

            void buttonInteraction.update({
                embeds: [this.buildEmbed(nodes, page)],
                components: this.buildActionRow(nodes, page, false)
            })
        })

        collector.once("end", () => {
            void interaction.editReply({
                embeds: [this.buildEmbed(nodes, page)],
                components: this.buildActionRow(nodes, page, true)
            })
        })
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry): void {
        registerCommands(registry, {
            name: this.name,
            description: this.description
        })
    }

    private buildEmbed(allNodes: CoffeeNode[], page: number): MessageEmbed {
        const totalNodes = allNodes.length.toLocaleString("en-us")
        const connectedNodes = allNodes.filter(node => node.connected).length.toLocaleString("en-us")
        const nodes = allNodes.slice(page * pageItems, (page * pageItems) + pageItems)
        const nodesField: EmbedFieldData[] = nodes.map(node => ({
            name: node.options.name,
            value: `\`\`\`\n${
                node.connected
                    ? `Players: ${node.stats.players.toLocaleString("en-us")}\n` +
                        `Playing Players: ${node.stats.playingPlayers.toLocaleString("en-us")}\n` +
                        `Uptime: ${humanize(node.stats.uptime, { maxDecimalPoints: 0 })}\n` +
                        `Memory: ${Number((node.stats.memory.used / 1024 / 1024).toFixed(2)).toLocaleString("en-us")}MiB\n` +
                        `CPU: ${((node.stats.cpu.lavalinkLoad / node.stats.cpu.cores) * 100).toFixed(2)}%\n` +
                        `Last Updated: ${humanize(Date.now() - node.stats.lastUpdated, { maxDecimalPoints: 0 })} ago`
                    : "Not Connected (N/A)"
            }\n\`\`\``
        }))

        return new MessageEmbed()
            .setTitle("Nodes Statistics")
            .setDescription(`\`\`\`\nTotal: ${totalNodes}\nConnected: ${connectedNodes}\`\`\``)
            .addFields(nodesField)
            .setFooter({ text: `Page ${page + 1} of ${Math.ceil(allNodes.length / pageItems)}` })
            .setColor(config.embedColor)
    }

    private buildActionRow(allNodes: CoffeeNode[], page: number, end: boolean): MessageActionRow[] {
        const previous = new MessageButton()
            .setCustomId("nodes-previous")
            .setLabel("Previous")
            .setStyle("PRIMARY")
            .setDisabled(end || !page)

        const refresh = new MessageButton()
            .setCustomId("nodes-refresh")
            .setLabel("Refresh")
            .setStyle("SECONDARY")
            .setDisabled(end)

        const next = new MessageButton()
            .setCustomId("nodes-next")
            .setLabel("Next")
            .setStyle("PRIMARY")
            .setDisabled(end || (page * pageItems) + pageItems >= allNodes.length)

        return [
            new MessageActionRow()
                .addComponents(previous, refresh, next)
        ]
    }
}
