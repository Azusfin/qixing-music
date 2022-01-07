"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteSkipCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const Util_1 = require("../../Util");
let VoteSkipCommand = class VoteSkipCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const player = this.container.client.lava.get(interaction.guildId);
        const track = player.queue.current;
        if (!track) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("No track is currently playing")]
            });
            return;
        }
        const voice = interaction.guild.me.voice;
        if (!voice.channel) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("The bot need to be in a voice channel")]
            });
            return;
        }
        const requiredUsers = (0, Util_1.calcRequiredUsers)(voice.channel.members.filter(m => !m.user.bot).size);
        const votes = Util_1.skipVotes.get(interaction.guildId) ?? new Set();
        if (votes.size >= requiredUsers) {
            player.stop();
            await interaction.reply({
                embeds: [this.makeEmbed(`Skipped [${track.title}](${track.url})`)]
            });
            return;
        }
        if (votes.has(interaction.user.id)) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("You already voted to skip current track")]
            });
            return;
        }
        votes.add(interaction.user.id);
        Util_1.skipVotes.set(interaction.guildId, votes);
        await interaction.reply({
            embeds: [this.makeEmbed(`There are ${votes.size} people voted to skip current track (need ${requiredUsers})`)]
        });
        if (votes.size >= requiredUsers) {
            player.stop();
            await interaction.editReply({
                embeds: [this.makeEmbed(`Skipped [${track.title}](${track.url})`)]
            });
        }
    }
    registerApplicationCommands(registry) {
        (0, Util_1.registerCommands)(registry, {
            name: this.name,
            description: this.description
        });
    }
    makeEmbed(content) {
        return new discord_js_1.MessageEmbed()
            .setDescription(content)
            .setColor(config_1.config.embedColor);
    }
};
VoteSkipCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "voteskip",
        description: "Vote to skip current track in the player, if any",
        preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "inVoiceChannel"]
    })
], VoteSkipCommand);
exports.VoteSkipCommand = VoteSkipCommand;
