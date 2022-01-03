"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageChannels = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
let ManageChannels = class ManageChannels extends framework_1.Precondition {
    chatInputRun(interaction) {
        const voice = interaction.guild.me.voice;
        const isNotInVC = !voice.channelId;
        const isNoOneInVC = !voice.channel?.members.filter(m => !m.user.bot).size;
        const isLonely = voice.channel?.members.filter(m => !m.user.bot).size === 1 &&
            voice.channel.members.has(interaction.user.id);
        const isHasPermission = interaction.memberPermissions?.has("MANAGE_CHANNELS", true);
        return isNotInVC || isNoOneInVC || isLonely || isHasPermission
            ? this.ok()
            : this.error({ message: "You need to have \"MANAGE_CHANNELS\" permission" });
    }
};
ManageChannels = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "manageChannels"
    })
], ManageChannels);
exports.ManageChannels = ManageChannels;
