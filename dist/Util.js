"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = void 0;
const config_1 = require("./config");
function registerCommands(registry, data) {
    registry.registerChatInputCommand(data, { guildIds: undefined, behaviorWhenNotIdentical: "OVERWRITE" /* Overwrite */ });
    if (config_1.config.servers.length) {
        registry.registerChatInputCommand(data, { guildIds: config_1.config.servers, behaviorWhenNotIdentical: "OVERWRITE" /* Overwrite */ });
    }
}
exports.registerCommands = registerCommands;
