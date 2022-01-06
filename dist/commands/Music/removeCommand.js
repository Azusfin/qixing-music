"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const Util_1 = require("../../Util");
let RemoveCommand = class RemoveCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const { queue, queue: { length } } = this.container.client.lava.get(interaction.guildId);
        if (!length) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("Queue is currently empty")]
            });
            return;
        }
        const start = interaction.options.getNumber("start", true);
        const end = interaction.options.getNumber("end") ?? start;
        if (start < 1) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("`start` option must be more than or equal to 1")]
            });
            return;
        }
        if (start > length) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("`start` option must be less than or equal to queue length")]
            });
            return;
        }
        if (end < start) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("`end` option must be more than or equal to `start` option")]
            });
            return;
        }
        if (end > length) {
            await interaction.reply({
                ephemeral: true,
                embeds: [this.makeEmbed("`end` option must be less than or equal to queue length")]
            });
            return;
        }
        queue.remove(start - 1, end);
        await interaction.reply({
            ephemeral: true,
            embeds: [this.makeEmbed(`Successfully removed tracks from ${start} to ${end}`)]
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.registerCommands)(registry, {
            name: this.name,
            description: this.description,
            options: [{
                    type: "NUMBER",
                    name: "start",
                    required: true,
                    description: "The position where to start remove the tracks"
                }, {
                    type: "NUMBER",
                    name: "end",
                    required: false,
                    description: "The position where to end the removal"
                }]
        });
    }
    makeEmbed(content) {
        return new discord_js_1.MessageEmbed()
            .setDescription(content)
            .setColor(config_1.config.embedColor);
    }
};
RemoveCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "remove",
        description: "Remove specific tracks in the queue, if any",
        preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
    })
], RemoveCommand);
exports.RemoveCommand = RemoveCommand;
