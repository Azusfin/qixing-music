"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const lavacoffee_1 = require("lavacoffee");
const config_1 = require("../../config");
const Util_1 = require("../../Util");
let PlayCommand = class PlayCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const { client: { lava } } = this.container;
        await interaction.deferReply();
        const result = await lava.search({ query: interaction.options.getString("track", true) }, interaction.user);
        if (result.loadType === lavacoffee_1.Utils.LoadTypes.NoMatches) {
            await interaction.editReply({
                embeds: [this.errorEmbed("No result found from query")]
            });
            return;
        }
        if (result.loadType === lavacoffee_1.Utils.LoadTypes.LoadFailed) {
            await interaction.editReply({
                embeds: [this.errorEmbed(`Load failed, Reason: \`\`\`\n` +
                        `${result.error.severity}: ${result.error.message}\`\`\``)]
            });
            return;
        }
        if (result.loadType === lavacoffee_1.Utils.LoadTypes.SearchResult && result.tracks.length > 1) {
            const length = Math.min(25, result.tracks.length);
            const selectMenu = new discord_js_1.MessageSelectMenu()
                .setMinValues(1)
                .setMaxValues(length)
                .setCustomId("play-search")
                .setPlaceholder("Choose atleast one track");
            for (let i = 0; i < length; i++) {
                const track = result.tracks[i];
                selectMenu.addOptions({
                    label: track.url,
                    value: i.toString(),
                    description: track.title.length > 100
                        ? `${track.title.substring(0, 97)}...`
                        : track.title
                });
            }
            const embed = new discord_js_1.MessageEmbed()
                .setTitle("Search Results")
                .setDescription("Multiple tracks found, please select atleast one within 30 seconds")
                .setColor(config_1.config.embedColor);
            const msg = await interaction.editReply({
                embeds: [embed],
                components: [{
                        type: "ACTION_ROW",
                        components: [selectMenu]
                    }]
            });
            let success = false;
            try {
                const selectMenuInteraction = await msg.awaitMessageComponent({
                    time: 30e3,
                    componentType: "SELECT_MENU",
                    filter: selectMenuInteraction => selectMenuInteraction.user.id === interaction.user.id
                });
                const tracks = [];
                for (const indexString of selectMenuInteraction.values) {
                    const index = Number(indexString);
                    tracks.push(result.tracks[index]);
                }
                result.tracks = tracks;
                success = true;
            }
            catch {
                embed.setDescription("The prompt has been timed out");
                await interaction.editReply({ embeds: [embed], components: [] });
            }
            if (!success)
                return;
        }
        const player = this.container.client.lava.create({
            guildID: interaction.guildId,
            metadata: {
                text: interaction.channel
            }
        });
        player.queue.add(result.tracks);
        const embed = new discord_js_1.MessageEmbed()
            .setTitle("Loaded Tracks")
            .setColor(config_1.config.embedColor);
        if (result.loadType === lavacoffee_1.Utils.LoadTypes.PlaylistLoaded) {
            embed.setDescription(`Loaded playlist **${result.playlist.name}**`);
        }
        else if (result.tracks.length === 1) {
            embed.setDescription(`Added [${result.tracks[0].title}](${result.tracks[0].url})`);
        }
        else {
            embed.setDescription(`Added:\n${result.tracks
                .map((track, pos) => `${pos + 1}. [${track.title}](${track.url})`)
                .join("\n")}`);
        }
        await interaction.editReply({ embeds: [embed], components: [] });
        if (player.voiceState !== lavacoffee_1.Utils.PlayerVoiceStates.Connected) {
            player.options.voiceID = interaction.member.voice.channelId;
            player.connect();
        }
        if (!player.queue.current)
            await player.play({});
    }
    registerApplicationCommands(registry) {
        (0, Util_1.registerCommands)(registry, {
            name: this.name,
            description: this.description,
            options: [{
                    type: "STRING",
                    required: true,
                    name: "track",
                    description: "The track to load and play or add into queue"
                }]
        });
    }
    errorEmbed(msg) {
        return new discord_js_1.MessageEmbed()
            .setTitle("LOad Track Error")
            .setDescription(msg)
            .setColor(config_1.config.embedColor);
    }
};
PlayCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "play",
        description: "Load and play or add a track into queue",
        preconditions: ["allowMaintenance", "GuildOnly", "inVoiceChannel"]
    })
], PlayCommand);
exports.PlayCommand = PlayCommand;
