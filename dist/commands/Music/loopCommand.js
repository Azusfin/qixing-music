"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const lavacoffee_1 = require("lavacoffee");
const config_1 = require("../../config");
const Util_1 = require("../../Util");
let LoopCommand = class LoopCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const player = this.container.client.lava.get(interaction.guildId);
        const loop = interaction.options.getString("mode", true);
        player.setLoop(loop === "none"
            ? lavacoffee_1.Utils.LoopMode.None
            : loop === "queue"
                ? lavacoffee_1.Utils.LoopMode.Queue
                : lavacoffee_1.Utils.LoopMode.Track);
        await interaction.reply({
            embeds: [
                new discord_js_1.MessageEmbed()
                    .setDescription(`Set loop mode to **${loop[0].toUpperCase()}${loop.slice(1)}**`)
                    .setColor(config_1.config.embedColor)
            ]
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.registerCommands)(registry, {
            name: this.name,
            description: this.description,
            options: [{
                    type: "STRING",
                    name: "mode",
                    required: true,
                    description: "The loop mode to set",
                    choices: [{
                            name: "None",
                            value: "none"
                        }, {
                            name: "Queue",
                            value: "queue"
                        }, {
                            name: "Track",
                            value: "track"
                        }]
                }]
        });
    }
};
LoopCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "loop",
        description: "Change the player loop mode, if any",
        preconditions: ["allowMaintenance", "GuildOnly", "needPlayer", "manageChannels"]
    })
], LoopCommand);
exports.LoopCommand = LoopCommand;
