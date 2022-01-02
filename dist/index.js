"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@sapphire/plugin-logger/register");
const config_1 = require("./config");
const QixingClient_1 = require("./structures/QixingClient");
const client = new QixingClient_1.QixingClient();
void client.login(config_1.config.token);
