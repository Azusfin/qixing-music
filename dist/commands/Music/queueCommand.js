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
exports.QueueCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const humanize_duration_1 = __importDefault(require("humanize-duration"));
const config_1 = require("../../config");
const Util_1 = require("../../Util");
const queueItems = 3;
let QueueCommand = class QueueCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const { lava } = this.container.client;
        let page = 0;
        const [embed, actionRow] = this.build(lava, interaction.guildId, page, false);
        const msg = await interaction.reply({
            ephemeral: true,
            fetchReply: true,
            embeds: [embed],
            components: [actionRow]
        });
        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 120 * 1000,
            filter(buttonInteraction) {
                return buttonInteraction.user.id === interaction.user.id;
            }
        });
        collector.on("collect", buttonInteraction => {
            if (buttonInteraction.customId === "queue-previous")
                page--;
            if (buttonInteraction.customId === "queue-next")
                page++;
            const [embed, actionRow, currentPage] = this.build(lava, interaction.guildId, page, false);
            page = currentPage;
            void buttonInteraction.update({
                embeds: [embed],
                components: [actionRow]
            });
        });
        collector.once("end", () => {
            const [embed, actionRow] = this.build(lava, interaction.guildId, page, true);
            void interaction.editReply({
                embeds: [embed],
                components: [actionRow]
            });
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.registerCommands)(registry, {
            name: this.name,
            description: this.description
        });
    }
    build(lava, guildID, page, end) {
        const player = lava.get(guildID);
        const embed = new discord_js_1.MessageEmbed()
            .setTitle("Queue")
            .setColor(config_1.config.embedColor);
        const previous = new discord_js_1.MessageButton()
            .setCustomId("queue-previous")
            .setEmoji("⬅️")
            .setStyle("PRIMARY")
            .setDisabled(true);
        const refresh = new discord_js_1.MessageButton()
            .setCustomId("queue-refresh")
            .setEmoji("🔄")
            .setStyle("PRIMARY")
            .setDisabled(end);
        const next = new discord_js_1.MessageButton()
            .setCustomId("queue-next")
            .setEmoji("➡️")
            .setStyle("PRIMARY")
            .setDisabled(true);
        if (!player) {
            embed.setDescription("No music player found");
        }
        else {
            const length = player.queue.length;
            let duration = 0;
            for (const track of player.queue) {
                if (track.isStream) {
                    duration = -1;
                    break;
                }
                duration += track.duration;
            }
            embed.setDescription(`\`\`\`\nLength: ${length.toLocaleString("en-us")}\n` +
                `Duration: ${duration === -1
                    ? "N/A"
                    : (0, humanize_duration_1.default)(duration, { maxDecimalPoints: 0 })}\`\`\``);
            if (!length) {
                embed.addFields({
                    name: "Tracks",
                    value: "Queue is empty"
                });
            }
            else {
                const maxPage = Math.ceil(length / queueItems) - 1;
                const currentPage = Math.min(page, maxPage);
                const start = currentPage * queueItems;
                const tracks = player.queue.slice(start, start + queueItems);
                const tracksText = tracks
                    .map((queueTrack, index) => {
                    const track = queueTrack;
                    return `${index + 1 + start}. [${track.title}](${track.url})\`\`\`\n` +
                        `Author: ${track.author}\n` +
                        `Requested By: ${track.requester.tag}\n` +
                        `Duration: ${track.isStream ? "N/A" : (0, humanize_duration_1.default)(track.duration, { maxDecimalPoints: 0 })}` +
                        `\`\`\``;
                })
                    .join("\n");
                embed
                    .addFields({
                    name: "Tracks",
                    value: tracksText
                })
                    .setFooter({
                    text: `Page ${currentPage + 1} of ${maxPage + 1}`
                });
                previous.setDisabled(end || !currentPage);
                next.setDisabled(end || currentPage === maxPage);
                return [
                    embed,
                    new discord_js_1.MessageActionRow()
                        .addComponents(previous, refresh, next),
                    currentPage
                ];
            }
        }
        return [
            embed,
            new discord_js_1.MessageActionRow()
                .addComponents(previous, refresh, next),
            0
        ];
    }
};
QueueCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "queue",
        description: "Show tracks in the queue, if any",
        preconditions: ["allowMaintenance", "GuildOnly", "needPlayer"]
    })
], QueueCommand);
exports.QueueCommand = QueueCommand;
