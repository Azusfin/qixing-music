"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const Util_1 = require("../../Util");
let VolumeCommand = class VolumeCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const player = this.container.client.lava.get(interaction.guildId);
        const volume = interaction.options.getNumber("volume", true);
        player.setVolume(volume);
        await interaction.reply({
            embeds: [
                new discord_js_1.MessageEmbed()
                    .setDescription(`Set the volume to **${volume}%**`)
                    .setColor(config_1.config.embedColor)
            ]
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.registerCommands)(registry, {
            name: this.name,
            description: this.description,
            options: [{
                    type: "NUMBER",
                    required: true,
                    minValue: 0,
                    maxValue: 1000,
                    name: "volume",
                    description: "The volume to set"
                }]
        });
    }
};
VolumeCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "volume",
        description: "Set the volume player, if any",
        preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
    })
], VolumeCommand);
exports.VolumeCommand = VolumeCommand;
