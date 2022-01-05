"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressBar = exports.registerCommands = void 0;
const config_1 = require("./config");
function registerCommands(registry, data) {
    registry.registerChatInputCommand(data, { guildIds: undefined, behaviorWhenNotIdentical: "OVERWRITE" /* Overwrite */ });
    if (config_1.config.servers.length) {
        registry.registerChatInputCommand(data, { guildIds: config_1.config.servers, behaviorWhenNotIdentical: "OVERWRITE" /* Overwrite */ });
    }
}
exports.registerCommands = registerCommands;
function progressBar(total, current, url) {
    const percentage = current > total ? 1 : current / total;
    const progress = Math.round(11 * percentage);
    const emptyProgress = 11 - progress;
    const emptyProgressText = "▬".repeat(emptyProgress);
    const progressText = progress >= 1
        ? `[▬](${url})`.repeat(progress).replace(/.$/, ")🔘")
        : "🔘";
    const bar = `${progressText}${emptyProgressText}`;
    const calculated = percentage * 100;
    return [bar, calculated];
}
exports.progressBar = progressBar;
