"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcRequiredUsers = exports.skipVotes = exports.progressBar = exports.registerCommands = void 0;
const config_1 = require("./config");
function registerCommands(registry, data) {
    registry.registerChatInputCommand(data, { guildIds: undefined, behaviorWhenNotIdentical: "OVERWRITE" /* Overwrite */ });
    if (config_1.config.servers.length) {
        registry.registerChatInputCommand(data, { guildIds: config_1.config.servers, behaviorWhenNotIdentical: "OVERWRITE" /* Overwrite */ });
    }
}
exports.registerCommands = registerCommands;
const barSize = 11;
const barText = "▬";
const barSlider = "🔘";
function progressBar(total, current, url) {
    const percentage = current > total ? 1 : current / total;
    const progress = Math.round(barSize * percentage);
    const emptyProgress = barSize - progress;
    const emptyProgressText = barText.repeat(emptyProgress);
    const progressText = progress >= 1
        ? `[${barText.repeat(progress)}](${url})${barSlider}`
        : barSlider;
    const bar = `${progressText}${emptyProgressText}`;
    const calculated = percentage * 100;
    return [bar, calculated];
}
exports.progressBar = progressBar;
exports.skipVotes = new Map();
function calcRequiredUsers(users) {
    return Math.round(users * 0.75);
}
exports.calcRequiredUsers = calcRequiredUsers;
