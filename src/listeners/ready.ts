import { ApplyOptions } from "@sapphire/decorators"
import { Listener, ListenerOptions } from "@sapphire/framework"
import { Message, MessageEmbed, Team, TextChannel, User } from "discord.js"
import humanizeDuration from "humanize-duration"
import { CoffeeLava, CoffeeTrack, Utils } from "lavacoffee"
import { config } from "../config"
import { skipVotes } from "../Util"

@ApplyOptions<ListenerOptions>({
    name: "ready",
    once: true
})
export class ReadyEvent extends Listener {
    public override async run(): Promise<void> {
        this.container.logger.info("Configurations Loaded")

        const developerID = await this.container.client.application!.fetch()

        if (developerID.owner instanceof Team) {
            for (const ownerID of developerID.owner.members.keys()) {
                if (!config.owners.includes(ownerID)) config.owners.push(ownerID)
            }
        } else if (!config.owners.includes(developerID.owner!.id)) {
            config.owners.push(developerID.owner!.id)
        }

        await Promise.all(
            config.owners.map(
                ownerID => this.container.client.users.fetch(ownerID, { cache: true }).catch(() => null)
            )
        )

        this.container.logger.info("Application Info Fetched")

        this.container.client.user!.setActivity({
            name: "💜 /help",
            type: "WATCHING"
        })

        this.container.logger.info("Activity Has Been Set")

        const lava = new CoffeeLava({
            balanceLoad: "lavalink",
            clientName: "qixing-music-lavacoffee",
            send: (guildID, payload) => {
                const guild = this.container.client.guilds.cache.get(guildID)
                guild?.shard.send(payload)
            }
        })

        this.container.client.on("raw", payload => {
            try {
                lava.updateVoiceData(payload as (Utils.VoiceServerUpdate | Utils.VoiceStateUpdate))
            // eslint-disable-next-line no-empty
            } catch {}
        })

        lava.init(this.container.client.user!.id)
        lava.on("nodeCreate", node => this.container.logger.info("LavalinkNode Created:", node.options.name))
        lava.on("nodeConnect", node => this.container.logger.info("LavalinkNode Connected:", node.options.name))
        lava.on("nodeReconnect", node => this.container.logger.warn("LavalinkNode Reconnecting:", node.options.name))
        lava.on("nodeDisconnect", (node, reason) => {
            this.container.logger.warn(
                "LavalinkNode Disconnected:", node.options.name,
                "- Code:", reason.code,
                "- Reason:", reason.reason ?? "(none)"
            )
        })
        lava.on("nodeError", (node, error) => {
            this.container.logger.error(
                "LavalinkNode Error:", node.options.name,
                "-", error
            )
        })
        lava.on("playerCreate", player => this.container.logger.info("LavalinkPlayer Created:", player.options.guildID))
        lava.on("playerDestroy", player => {
            this.container.logger.info("LavalinkPlayer Destroyed:", player.options.guildID)
            skipVotes.delete(player.options.guildID)
        })

        lava.on("playerReplay", async player => {
            const embed = new MessageEmbed()
                .setTitle("Player Replayed")
                .setDescription("Player replayed after disconnected from node")
                .setColor(config.embedColor)

            this.container.logger.info("PlayerReplay:", player.options.guildID)

            try {
                const text = player.get<TextChannel>("text")
                await text!.send({ embeds: [embed] })
            } catch (err) {
                this.container.logger.error(
                    "PlayerReplay Error:", player.options.guildID,
                    "-", err
                )
            }
        })

        lava.on("replayError", async player => {
            const embed = new MessageEmbed()
                .setTitle("Replay Error")
                .setDescription("Failed to replay player after disconnected from node")
                .setColor(config.embedColor)

            this.container.logger.info("ReplayError:", player.options.guildID)

            if (player.queue.current) {
                try {
                    const text = player.get<TextChannel>("text")
                    await text!.send({ embeds: [embed] })
                } catch (err) {
                    this.container.logger.error(
                        "ReplayError Error:", player.options.guildID,
                        "-", err
                    )
                }
            }
        })

        lava.on("trackStart", async (player, track) => {
            const embed = new MessageEmbed()
                .setTitle("Track Starting")
                .setDescription(`[${track.title}](${(track as CoffeeTrack).url})`)
                .addFields({
                    name: "Author",
                    value: (track as CoffeeTrack).author,
                    inline: true
                }, {
                    name: "Requested By",
                    value: (track.requester as User).tag,
                    inline: true
                }, {
                    name: "Duration",
                    value: (track as CoffeeTrack).isStream
                        ? "N/A"
                        : humanizeDuration(track.duration!, { maxDecimalPoints: 0 }),
                    inline: true
                })
                .setColor(config.embedColor)

            this.container.logger.info(
                "TrackStart:", player.options.guildID,
                "-", "Requester:", (track.requester as User).id,
                "-", "Title:", track.title,
                "-", "Url:", (track as CoffeeTrack).url
            )

            try {
                const text = player.get<TextChannel>("text")
                const msg = await text!.send({ embeds: [embed] })
                player.set("msg", msg)
            } catch (err) {
                this.container.logger.error(
                    "TrackStart Error:", player.options.guildID,
                    "-", err
                )
            }
        })

        lava.on("trackEnd", async (player, track, payload) => {
            if (payload.reason === "REPLACED") return

            this.container.logger.info(
                "TrackEnd:", player.options.guildID,
                "-", "Requester:", (track.requester as User).id,
                "-", "Title:", track.title,
                "-", "Url:", (track as CoffeeTrack).url
            )

            skipVotes.delete(player.options.guildID)

            const msg = player.get<Message>("msg")
            player.set("msg", undefined)
            await msg?.delete()
        })

        lava.on("trackStuck", async (player, track, payload) => {
            this.container.logger.info(
                "TrackStuck:", player.options.guildID,
                "-", "Requester:", (track.requester as User).id,
                "-", "Title:", track.title,
                "-", "Url:", (track as CoffeeTrack).url,
                "-", "ThresholdMS:", payload.thresholdMs
            )

            skipVotes.delete(player.options.guildID)

            const msg = player.get<Message>("msg")
            player.set("msg", undefined)
            await msg?.delete()

            const embed = new MessageEmbed()
                .setTitle("Track Stuck")
                .setDescription(`[${track.title}](${(track as CoffeeTrack).url})`)
                .addFields({ name: "Threshold", value: `${payload.thresholdMs}ms` })
                .setColor(config.embedColor)

            try {
                const text = player.get<TextChannel>("text")
                await text!.send({ embeds: [embed] })
            } catch (err) {
                this.container.logger.error(
                    "TrackStuck Error:", player.options.guildID,
                    "-", err
                )
            }
        })

        lava.on("trackError", async (player, track, payload) => {
            this.container.logger.info(
                "TrackError:", player.options.guildID,
                "-", "Requester:", (track.requester as User).id,
                "-", "Title:", track.title,
                "-", "Url:", (track as CoffeeTrack).url,
                "-", "Cause:", payload.exception.cause,
                "-", "Severity:", payload.exception.severity,
                "-", payload.exception.message
            )

            skipVotes.delete(player.options.guildID)

            const msg = player.get<Message>("msg")
            player.set("msg", undefined)
            await msg?.delete()

            const embed = new MessageEmbed()
                .setTitle("Track Error")
                .setDescription(`[${track.title}](${(track as CoffeeTrack).url})`)
                .addFields({ name: "Cause", value: payload.exception.cause })
                .addFields({ name: "Severity", value: payload.exception.severity })
                .addFields({ name: "Error", value: `\`\`\`\n${payload.exception.message}\`\`\`` })
                .setColor(config.embedColor)

            try {
                const text = player.get<TextChannel>("text")
                await text!.send({ embeds: [embed] })
            } catch (err) {
                this.container.logger.error(
                    "TrackError Error:", player.options.guildID,
                    "-", err
                )
            }
        })

        for (const node of config.nodes) {
            lava.add({
                ...node,
                maxConnections: 25,
                retryAmount: Infinity,
                retryDelay: 60e3
            })
        }

        this.container.client.lava = lava
        this.container.logger.info(`Logged In Client ${this.container.client.user!.tag}`)
    }
}
