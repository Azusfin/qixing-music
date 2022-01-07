"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PauseCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const lavacoffee_1 = require("lavacoffee");
const config_1 = require("../../config");
const Util_1 = require("../../Util");
let PauseCommand = class PauseCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const player = this.container.client.lava.get(interaction.guildId);
        if (!player.queue.current) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("No track is currently playing")]
            });
            return;
        }
        player.pause(true);
        await interaction.reply({
            ephemeral: player.state !== lavacoffee_1.Utils.PlayerStates.Paused,
            embeds: [this.makeEmbed(player.state === lavacoffee_1.Utils.PlayerStates.Paused
                    ? "Paused the player"
                    : "Failed when trying to pause the player")]
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
PauseCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "pause",
        description: "Pause the player, if any",
        preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
    })
], PauseCommand);
exports.PauseCommand = PauseCommand;
