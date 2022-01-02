"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Maintenance = void 0;
const decorators_1 = require("@sapphire/decorators");
const framework_1 = require("@sapphire/framework");
const config_1 = require("../config");
let Maintenance = class Maintenance extends framework_1.Precondition {
    chatInputRun(interaction) {
        return config_1.config.maintenance && !config_1.config.owners.includes(interaction.user.id)
            ? this.error({ message: "Bot is in maintenance state, only owners can use it currently" })
            : this.ok();
    }
};
Maintenance = __decorate([
    (0, decorators_1.ApplyOptions)({
        name: "allowMaintenance"
    })
], Maintenance);
exports.Maintenance = Maintenance;
