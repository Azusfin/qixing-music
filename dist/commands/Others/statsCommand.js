"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsCommand = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const Util_1 = require("../../Util");
const config_1 = require("../../config");
const humanize_duration_1 = __importDefault(require("humanize-duration"));
let statsCommand = class statsCommand extends framework_1.Command {
    async chatInputRun(interaction) {
        const botName = this.container.client.user.username;
        const botAvatar = this.container.client.user.displayAvatarURL({ format: "jpg" });
        const musicPlayers = this.container.client.lava.players.size.toLocaleString("en-us");
        const servers = this.container.client.guilds.cache.size.toLocaleString("en-us");
        const users = this.container.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const uptime = (0, humanize_duration_1.default)(Date.now() - this.container.client.readyTimestamp, { maxDecimalPoints: 0 });
        const library = "Discord.js";
        const owners = config_1.config.owners.map(ownerID => this.container.client.users.cache.get(ownerID)?.tag ?? `${ownerID} (N/A)`).join("\n");
        const memory = process.memoryUsage();
        const memoryOs = (memory.rss / 1024 / 1024).toFixed(2);
        const memoryJsTotal = (memory.heapTotal / 1024 / 1024).toFixed(2);
        const memoryJsUsed = (memory.heapUsed / 1024 / 1024).toFixed(2);
        const memoryCpp = (memory.external / 1024 / 1024).toFixed(2);
        const memoryBuffers = (memory.arrayBuffers / 1024 / 1024).toFixed(2);
        const embed = new discord_js_1.MessageEmbed()
            .setAuthor({
            name: botName,
            iconURL: botAvatar
        })
            .setThumbnail(botAvatar)
            .addFields({
            name: "Music Players",
            value: musicPlayers,
            inline: true
        }, {
            name: "Servers",
            value: servers,
            inline: true
        }, {
            name: "Users",
            value: users.toLocaleString("en-us"),
            inline: true
        }, {
            name: "Uptime",
            value: uptime,
            inline: true
        }, {
            name: "Library",
            value: library,
            inline: true
        }, {
            name: "Owners",
            value: `\`\`\`\n${owners}\`\`\``
        }, {
            name: "Memory",
            value: `\`\`\`\nOS: ${memoryOs}MiB\n` +
                `JsTotal: ${memoryJsTotal}MiB\n` +
                `JsUsed: ${memoryJsUsed}MiB\n` +
                `C++: ${memoryCpp}MiB\n` +
                `Buffers: ${memoryBuffers}MiB\`\`\``
        })
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
statsCommand = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "stats",
        description: "Show the bot statistics"
    })
], statsCommand);
exports.statsCommand = statsCommand;
