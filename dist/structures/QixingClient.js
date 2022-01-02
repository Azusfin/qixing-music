"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QixingClient = void 0;
const framework_1 = require("@sapphire/framework");
class QixingClient extends framework_1.SapphireClient {
    constructor() {
        super({
            intents: ["GUILDS", "GUILD_VOICE_STATES"]
        });
    }
}
exports.QixingClient = QixingClient;
