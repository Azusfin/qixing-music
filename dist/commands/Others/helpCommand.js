"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const config_1 = require("../../config");
const Util_1 = require("../../Util");
let HelpCommand = class HelpCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const embed = new discord_js_1.MessageEmbed()
            .setAuthor({
            name: `Hello ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({ format: "jpg" })
        })
            .setDescription(`You can start using the bot by typing \`/<command>\` in the channel\n` +
            `You may also find the commands in the slash menu`)
            .setColor(config_1.config.embedColor);
        await interaction.reply({
            ephemeral: true,
            embeds: [embed]
        });
    }
    registerApplicationCommands(registry) {
        (0, Util_1.registerCommands)(registry, {
            name: this.name,
            description: this.description
        });
    }
};
HelpCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "help",
        description: "Send a \"helpful\" message to show how to use the bot"
    })
], HelpCommand);
exports.HelpCommand = HelpCommand;
