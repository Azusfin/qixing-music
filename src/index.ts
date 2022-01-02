import "@sapphire/plugin-logger/register"
import { config } from "./config"
import { QixingClient } from "./structures/QixingClient"

const client = new QixingClient()
void client.login(config.token)
