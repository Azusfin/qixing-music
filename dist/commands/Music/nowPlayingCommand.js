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
exports.NowPlayingCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const humanize_duration_1 = __importDefault(require("humanize-duration"));
const lavacoffee_1 = require("lavacoffee");
const config_1 = require("../../config");
const Util_1 = require("../../Util");
let NowPlayingCommand = class NowPlayingCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const player = this.container.client.lava.get(interaction.guildId);
        const msg = await interaction.reply({
            ephemeral: true,
            fetchReply: true,
            embeds: [this.buildEmbed(player)],
            components: [{
                    type: "ACTION_ROW",
                    components: [
                        new discord_js_1.MessageButton()
                            .setCustomId("nowplaying-refresh")
                            .setEmoji("🔄")
                            .setStyle("PRIMARY")
                    ]
                }]
        });
        const collector = msg.createMessageComponentCollector({
            componentType: "BUTTON",
            time: 120 * 1000,
            filter(buttonInteraction) {
                return buttonInteraction.user.id === interaction.user.id;
            }
        });
        collector.on("collect", buttonInteraction => {
            void buttonInteraction.update({ embeds: [this.buildEmbed(player)] });
        });
        collector.once("end", () => {
            void interaction.editReply({
                embeds: [this.buildEmbed(player)],
                components: [{
                        type: "ACTION_ROW",
                        components: [
                            new discord_js_1.MessageButton()
                                .setCustomId("nowplaying-refresh")
                                .setEmoji("🔄")
                                .setStyle("PRIMARY")
                                .setDisabled(true)
                        ]
                    }]
            });
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.registerCommands)(registry, {
            name: this.name,
            description: this.description
        });
    }
    buildEmbed(player) {
        const embed = new discord_js_1.MessageEmbed()
            .setTitle("Now Playing")
            .setColor(config_1.config.embedColor);
        if (player.queue.current) {
            const track = player.queue.current;
            const [bar, percentage] = (0, Util_1.progressBar)(track.isStream ? 1 : track.duration, track.isStream ? 1 : player.absolutePosition, track.url);
            embed
                .setDescription(`[${track.title}](${track.url})`)
                .addFields({
                name: "Author",
                value: track.author,
                inline: true
            }, {
                name: "Requested By",
                value: track.requester.tag,
                inline: true
            }, {
                name: "Duration",
                value: track.isStream
                    ? "N/A"
                    : (0, humanize_duration_1.default)(track.duration, { maxDecimalPoints: 0 }),
                inline: true
            }, {
                name: "Loop",
                value: player.loop === lavacoffee_1.Utils.LoopMode.None
                    ? "None"
                    : player.loop === lavacoffee_1.Utils.LoopMode.Queue
                        ? "Queue"
                        : "Track",
                inline: true
            }, {
                name: "Volume",
                value: `${player.options.volume}%`,
                inline: true
            }, {
                name: "Progress",
                value: `${bar}\n` +
                    `${track.isStream
                        ? "N/A"
                        : `${(0, humanize_duration_1.default)(player.absolutePosition, { maxDecimalPoints: 0 })} (${percentage.toFixed(2)}%)`}`
            });
            const thumbnail = track.displayThumbnail();
            if (thumbnail)
                embed.setThumbnail(thumbnail);
        }
        else {
            embed.setDescription("No track is currently playing");
        }
        return embed;
    }
};
NowPlayingCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "nowplaying",
        description: "Get the currently playing track, if any",
        preconditions: ["allowMaintenance", "GuildOnly", "needPlayer"]
    })
], NowPlayingCommand);
exports.NowPlayingCommand = NowPlayingCommand;
