import { ApplicationCommandRegistry, RegisterBehavior } from "@sapphire/framework";
import { ChatInputApplicationCommandData } from "discord.js";
import { config } from "./config";

export function registerCommands(
    registry: ApplicationCommandRegistry,
    data: ChatInputApplicationCommandData
): void {
    registry.registerChatInputCommand(data, { guildIds: undefined, behaviorWhenNotIdentical: RegisterBehavior.Overwrite })

    if (config.servers.length) {
        registry.registerChatInputCommand(data, { guildIds: config.servers, behaviorWhenNotIdentical: RegisterBehavior.Overwrite })
    }
}

export function progressBar(
    total: number,
    current: number,
    url: string
): [string, number] {
    const percentage = current > total ? 1 : current / total
    const progress = Math.round(11 * percentage)
    const emptyProgress = 11 - progress

    const emptyProgressText = "▬".repeat(emptyProgress)
    const progressText = progress >= 1
        ? `[▬](${url})`.repeat(progress).replace(/.$/, ")🔘")
        : "🔘"

    const bar = `${progressText}${emptyProgressText}`
    const calculated = percentage * 100

    return [bar, calculated]
}
