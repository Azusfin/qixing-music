"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisconnectCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const Util_1 = require("../../Util");
let DisconnectCommand = class DisconnectCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const player = this.container.client.lava.get(interaction.guildId);
        const msg = player.get("msg");
        await msg?.delete();
        player.destroy();
        const embed = new discord_js_1.MessageEmbed()
            .setTitle("Disconnected")
            .setDescription("Disconnected from voice channel")
            .setColor(config_1.config.embedColor);
        await interaction.reply({ embeds: [embed] });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.registerCommands)(registry, {
            name: this.name,
            description: this.description
        });
    }
};
DisconnectCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "disconnect",
        description: "Make the bot disconnect from a voice channel",
        preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
    })
], DisconnectCommand);
exports.DisconnectCommand = DisconnectCommand;
