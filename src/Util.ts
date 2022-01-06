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

const barSize = 11
const barText = "▬"
const barSlider = "🔘"

export function progressBar(
    total: number,
    current: number,
    url: string
): [string, number] {
    const percentage = current > total ? 1 : current / total
    const progress = Math.round(barSize * percentage)
    const emptyProgress = barSize - progress

    const emptyProgressText = barText.repeat(emptyProgress)
    const progressText = progress >= 1
        ? `[${barText.repeat(progress)}](${url})${barSlider}`
        : barSlider

    const bar = `${progressText}${emptyProgressText}`
    const calculated = percentage * 100

    return [bar, calculated]
}
