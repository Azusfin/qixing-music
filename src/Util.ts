import { ApplicationCommandRegistry } from "@sapphire/framework";
import { ChatInputApplicationCommandData } from "discord.js";
import { config } from "./config";

export function registerCommands(
    registry: ApplicationCommandRegistry,
    data: ChatInputApplicationCommandData
): void {
    registry.registerChatInputCommand(data, { guildIds: undefined })

    if (config.servers.length) {
        registry.registerChatInputCommand(data, { guildIds: config.servers })
    }
}
