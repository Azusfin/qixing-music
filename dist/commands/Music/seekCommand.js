"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeekCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const Util_1 = require("../../Util");
let SeekCommand = class SeekCommand extends framework_1.Command {
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
        const posStr = interaction.options.getString("position", true);
        let pos;
        try {
            pos = Util_1.msParser.parseToMS(posStr);
        }
        catch {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("Failed to parse position, make sure it's in valid format\n" +
                        "Example:\n" +
                        "`42s`\n" +
                        "`1m7s`\n" +
                        "`1h2m14s`\n")]
            });
            return;
        }
        if (pos < 0) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("Position must be atleast 0 millisecond")]
            });
            return;
        }
        if (pos > track.duration) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("Position must be less than current track duration")]
            });
            return;
        }
        player.seek(pos);
        await interaction.reply({
            embeds: [this.makeEmbed(`Seek player to position **${Util_1.msParser.parseToString(pos)}**`)]
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.registerCommands)(registry, {
            name: this.name,
            description: this.description,
            options: [{
                    type: "STRING",
                    required: true,
                    name: "position",
                    description: "The position to seek to, ex. 45s"
                }]
        });
    }
    makeEmbed(content) {
        return new discord_js_1.MessageEmbed()
            .setDescription(content)
            .setColor(config_1.config.embedColor);
    }
};
SeekCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "seek",
        description: "Seek the player into specific position of current track, if any",
        preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
    })
], SeekCommand);
exports.SeekCommand = SeekCommand;
