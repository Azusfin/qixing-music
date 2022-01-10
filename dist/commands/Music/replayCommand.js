"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const utils_1 = require("lavacoffee/dist/utils");
const config_1 = require("../../config");
const Util_1 = require("../../Util");
let ReplayCommand = class ReplayCommand extends framework_1.Command {
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
        try {
            await player.node.send({
                op: utils_1.OpCodes.Play,
                guildId: interaction.guildId,
                track: track.base64,
                startTime: player.position,
                pause: player.state === utils_1.PlayerStates.Paused
            });
        }
        catch {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("Failed to replay the player")]
            });
            return;
        }
        player.replaying = true;
        await interaction.reply({
            embeds: [this.makeEmbed(`Replayed [${track.title}](${track.url})`)]
        });
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
ReplayCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "replay",
        description: "Force replay the player, if any",
        preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
    })
], ReplayCommand);
exports.ReplayCommand = ReplayCommand;
