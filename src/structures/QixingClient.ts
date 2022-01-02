import { SapphireClient } from "@sapphire/framework"
import { CoffeeLava } from "lavacoffee"

export class QixingClient extends SapphireClient {
    public constructor() {
        super({
            intents: ["GUILDS", "GUILD_VOICE_STATES"]
        })
    }

    public lava!: CoffeeLava
}

declare module "@sapphire/framework" {
    export interface SapphireClient {
        lava: CoffeeLava
    }
}
