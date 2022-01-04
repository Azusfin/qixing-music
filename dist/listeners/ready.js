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
exports.ReadyEvent = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const humanize_duration_1 = __importDefault(require("humanize-duration"));
const lavacoffee_1 = require("lavacoffee");
const config_1 = require("../config");
let ReadyEvent = class ReadyEvent extends framework_1.Listener {
    async run() {
        this.container.logger.info("Configurations Loaded");
        const developerID = await this.container.client.application.fetch();
        if (developerID.owner instanceof discord_js_1.Team) {
            for (const ownerID of developerID.owner.members.keys()) {
                if (!config_1.config.owners.includes(ownerID))
                    config_1.config.owners.push(ownerID);
            }
        }
        else if (!config_1.config.owners.includes(developerID.owner.id)) {
            config_1.config.owners.push(developerID.owner.id);
        }
        await Promise.all(config_1.config.owners.map(ownerID => this.container.client.users.fetch(ownerID, { cache: true }).catch(() => null)));
        this.container.logger.info("Application Info Fetched");
        this.container.client.user.setActivity({
            name: "💜 /help",
            type: "WATCHING"
        });
        this.container.logger.info("Activity Has Been Set");
        const lava = new lavacoffee_1.CoffeeLava({
            balanceLoad: "lavalink",
            clientName: "qixing-music-lavacoffee",
            send: (guildID, payload) => {
                const guild = this.container.client.guilds.cache.get(guildID);
                guild?.shard.send(payload);
            }
        });
        this.container.client.on("raw", payload => {
            lava.updateVoiceData(payload);
        });
        lava.init(this.container.client.user.id);
        lava.on("nodeCreate", node => this.container.logger.info("LavalinkNode Created:", node.options.name));
        lava.on("nodeConnect", node => this.container.logger.info("LavalinkNode Connected:", node.options.name));
        lava.on("nodeReconnect", node => this.container.logger.warn("LavalinkNode Reconnecting:", node.options.name));
        lava.on("nodeDisconnect", (node, reason) => {
            this.container.logger.warn("LavalinkNode Disconnected:", node.options.name, "- Code:", reason.code, "- Reason:", reason.reason ?? "(none)");
        });
        lava.on("nodeError", (node, error) => {
            this.container.logger.error("LavalinkNode Error:", node.options.name, "-", error);
        });
        lava.on("playerCreate", player => this.container.logger.info("LavalinkPlayer Created:", player.options.guildID));
        lava.on("playerDestroy", player => this.container.logger.info("LavalinkPlayer Destroyed:", player.options.guildID));
        lava.on("playerReplay", async (player) => {
            const embed = new discord_js_1.MessageEmbed()
                .setTitle("Player Replayed")
                .setDescription("Player replayed after disconnected from node")
                .setColor(config_1.config.embedColor);
            this.container.logger.info("PlayerReplay:", player.options.guildID);
            try {
                const text = player.get("text");
                await text.send({ embeds: [embed] });
            }
            catch (err) {
                this.container.logger.error("PlayerReplay Error:", player.options.guildID, "-", err);
            }
        });
        lava.on("replayError", async (player, error) => {
            const embed = new discord_js_1.MessageEmbed()
                .setTitle("Replay Error")
                .setDescription("Failed to replay player after disconnected from node")
                .setColor(config_1.config.embedColor);
            this.container.logger.error("ReplayError:", player.options.guildID, "-", error);
            try {
                const text = player.get("text");
                await text.send({ embeds: [embed] });
            }
            catch (err) {
                this.container.logger.error("ReplayError Error:", player.options.guildID, "-", err);
            }
        });
        lava.on("trackStart", async (player, track) => {
            const embed = new discord_js_1.MessageEmbed()
                .setTitle("Track Starting")
                .setDescription(`[${track.title}](${track.url})`)
                .addFields({
                name: "Requested By",
                value: track.requester.tag,
                inline: true
            }, {
                name: "Duration",
                value: track.isStream
                    ? "(STREAM)"
                    : (0, humanize_duration_1.default)(track.duration, { maxDecimalPoints: 0 }),
                inline: true
            })
                .setColor(config_1.config.embedColor);
            this.container.logger.info("TrackStart:", player.options.guildID, "- Title:", track.title, "- Url:", track.url, "- Requester", track.requester.id);
            try {
                const text = player.get("text");
                const msg = await text.send({ embeds: [embed] });
                player.set("msg", msg);
            }
            catch (err) {
                this.container.logger.error("TrackStart Error:", player.options.guildID, "-", err);
            }
        });
        lava.on("trackEnd", async (player, track) => {
            const msg = player.get("msg");
            await msg?.delete();
            this.container.logger.info("TrackEnd:", player.options.guildID, "- Title:", track.title, "- Url:", track.url, "- Requester", track.requester.id);
        });
        lava.on("trackStuck", async (player, track, payload) => {
            const msg = player.get("msg");
            await msg?.delete();
            const embed = new discord_js_1.MessageEmbed()
                .setTitle("Track Stuck")
                .setDescription(`[${track.title}](${track.url})`)
                .addFields({ name: "Threshold", value: `${payload.thresholdMs}ms` })
                .setColor(config_1.config.embedColor);
            this.container.logger.info("TrackStuck:", player.options.guildID, "- Title:", track.title, "- Url:", track.url, "- Requester", track.requester.id, "- ThresholdMS:", payload.thresholdMs);
            try {
                const text = player.get("text");
                await text.send({ embeds: [embed] });
            }
            catch (err) {
                this.container.logger.error("TrackStuck Error:", player.options.guildID, "-", err);
            }
        });
        lava.on("trackError", async (player, track, payload) => {
            const msg = player.get("msg");
            await msg?.delete();
            const embed = new discord_js_1.MessageEmbed()
                .setTitle("Track Error")
                .setDescription(`[${track.title}](${track.url})`)
                .addFields({ name: "Cause", value: payload.exception.cause })
                .addFields({ name: "Severity", value: payload.exception.severity })
                .addFields({ name: "Error", value: `\`\`\`\n${payload.exception.message}\`\`\`` })
                .setColor(config_1.config.embedColor);
            this.container.logger.info("TrackError:", player.options.guildID, "- Title:", track.title, "- Url:", track.url, "- Requester", track.requester.id, "- Cause:", payload.exception.cause, "- Severity:", payload.exception.severity, "-", payload.exception.message);
            try {
                const text = player.get("text");
                await text.send({ embeds: [embed] });
            }
            catch (err) {
                this.container.logger.error("TrackError Error:", player.options.guildID, "-", err);
            }
        });
        for (const node of config_1.config.nodes) {
            lava.add({
                ...node,
                maxConnections: 25,
                retryAmount: Infinity,
                retryDelay: 60e3
            });
        }
        this.container.client.lava = lava;
        this.container.logger.info(`Logged In Client ${this.container.client.user.tag}`);
    }
};
ReadyEvent = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "ready",
        once: true
    })
], ReadyEvent);
exports.ReadyEvent = ReadyEvent;
