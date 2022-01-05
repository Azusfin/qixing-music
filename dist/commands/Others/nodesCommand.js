"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodesCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const Util_1 = require("../../Util");
const config_1 = require("../../config");
const humanize_duration_1 = __importDefault(require("humanize-duration"));
const pageItems = 2;
let NodesCommand = class NodesCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const nodes = [...this.container.client.lava.nodes.values()];
        let page = 0;
        const msg = await interaction.reply({
            ephemeral: true,
            fetchReply: true,
            embeds: [this.buildEmbed(nodes, page)],
            components: this.buildActionRow(nodes, page, false)
        });
        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 120 * 1000,
            filter(buttonInteraction) {
                return buttonInteraction.user.id === interaction.user.id;
            }
        });
        collector.on("collect", buttonInteraction => {
            if (buttonInteraction.customId === "nodes-previous")
                page--;
            else if (buttonInteraction.customId === "nodes-next")
                page++;
            void buttonInteraction.update({
                embeds: [this.buildEmbed(nodes, page)],
                components: this.buildActionRow(nodes, page, false)
            });
        });
        collector.once("end", () => {
            void interaction.editReply({
                embeds: [this.buildEmbed(nodes, page)],
                components: this.buildActionRow(nodes, page, true)
            });
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.registerCommands)(registry, {
            name: this.name,
            description: this.description
        });
    }
    buildEmbed(allNodes, page) {
        const totalNodes = allNodes.length.toLocaleString("en-us");
        const connectedNodes = allNodes.filter(node => node.connected).length.toLocaleString("en-us");
        const nodes = allNodes.slice(page * pageItems, (page * pageItems) + pageItems);
        const nodesField = nodes.map(node => ({
            name: node.options.name,
            value: `\`\`\`\n${node.connected
                ? `Players: ${node.stats.players.toLocaleString("en-us")}\n` +
                    `Playing Players: ${node.stats.playingPlayers.toLocaleString("en-us")}\n` +
                    `Uptime: ${(0, humanize_duration_1.default)(node.stats.uptime, { maxDecimalPoints: 0 })}\n` +
                    `Memory: ${Number((node.stats.memory.used / 1024 / 1024).toFixed(2)).toLocaleString("en-us")}MiB\n` +
                    `CPU: ${((node.stats.cpu.lavalinkLoad / node.stats.cpu.cores) * 100).toFixed(2)}%\n` +
                    `Last Updated: ${(0, humanize_duration_1.default)(Date.now() - node.stats.lastUpdated, { maxDecimalPoints: 0 })} ago`
                : "Not Connected (N/A)"}\n\`\`\``
        }));
        return new discord_js_1.MessageEmbed()
            .setTitle("Nodes Statistics")
            .setDescription(`\`\`\`\nTotal: ${totalNodes}\nConnected: ${connectedNodes}\`\`\``)
            .addFields(nodesField)
            .setFooter({ text: `Page ${page + 1} of ${Math.ceil(allNodes.length / pageItems)}` })
            .setColor(config_1.config.embedColor);
    }
    buildActionRow(allNodes, page, end) {
        const previous = new discord_js_1.MessageButton()
            .setCustomId("nodes-previous")
            .setEmoji("⬅️")
            .setStyle("PRIMARY")
            .setDisabled(end || !page);
        const next = new discord_js_1.MessageButton()
            .setCustomId("nodes-next")
            .setEmoji("➡️")
            .setStyle("PRIMARY")
            .setDisabled(end || (page * pageItems) + pageItems >= allNodes.length);
        return [
            new discord_js_1.MessageActionRow()
                .addComponents(previous, next)
        ];
    }
};
NodesCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "nodes",
        description: "Show the lavalink nodes statistics"
    })
], NodesCommand);
exports.NodesCommand = NodesCommand;
