import { readFileSync } from "node:fs"
import { parseDocument, isSeq, isMap } from "yaml"
import { QixingError } from "./structures/QixingError"

export let config!: Config

try {
    const rawConfigFile = readFileSync("config.yaml", "utf-8")

    try {
        const rawConfig = parseDocument(rawConfigFile)

        const rawToken = rawConfig.get("token")
        let token!: string

        if (validateString(rawToken, "token")) {
            token = resolveString(rawToken)
        }

        const rawNodes = rawConfig.get("nodes")

        if (!isSeq(rawNodes)) throw new QixingError("CONFIG", "Pair must be a sequence at 'nodes'")

        const nodes: Node[] = []

        for (let i = 0; i < rawNodes.items.length; i++) {
            const rawNode = rawNodes.get(i)

            if (!isMap(rawNode)) throw new QixingError("CONFIG", `Pair must be a map at 'nodes.${i}'`)

            const rawName = rawNode.get("name")
            let name!: string

            if (validateString(rawName, `nodes.${i}.name`)) {
                name = resolveString(rawName)
            }

            const rawUrl = rawNode.get("url")
            let url!: string

            if (validateString(rawUrl, `nodes.${i}.url`)) {
                url = resolveString(rawUrl)
            }

            const rawPassword = rawNode.get("password")
            let password = "youshallnotpass"

            if (rawPassword !== undefined && validateString(rawPassword, `nodes.${i}.password`)) {
                password = resolveString(rawPassword)
            }

            const rawIsSecure = rawNode.get("is-secure")
            let secure = false

            if (rawIsSecure !== undefined && validateBoolean(rawIsSecure, `nodes.${i}.is-secure`)) {
                secure = rawIsSecure
            }

            const node: Node = {
                name,
                url,
                password,
                secure
            }

            nodes.push(node)
        }

        if (!nodes.length) throw new QixingError("CONFIG", "Need atleast one node configured")

        const rawEmbedColor = rawConfig.get("embed-color")
        let embedColor = "#7E57C2"

        if (rawEmbedColor !== undefined && validateString(rawEmbedColor, "embed-color")) {
            embedColor = resolveString(rawEmbedColor)
        }

        const rawMaintenance = rawConfig.get("maintenance")
        let maintenance = false

        if (rawMaintenance !== undefined && validateBoolean(rawMaintenance, "maintenance")) {
            maintenance = rawMaintenance
        }

        const rawMongo = rawConfig.get("mongo")
        let mongo: Mongo | undefined

        if (rawMongo !== undefined) {
            if (!isMap(rawMongo)) throw new QixingError("CONFIG", "Pair must be a map at 'mongo'")

            const rawUrl = rawMongo.get("url")
            let url!: string

            if (validateString(rawUrl, "mongo.url")) {
                url = resolveString(rawUrl)
            }

            const rawDatabase = rawMongo.get("database")
            let database = "qixing-music"

            if (rawDatabase !== undefined && validateString(rawDatabase, "mongo.database")) {
                database = resolveString(rawDatabase)
            }

            const rawCollection = rawMongo.get("collection")
            let collection = "queue"

            if (rawCollection !== undefined && validateString(rawCollection, "mongo.collection")) {
                collection = resolveString(rawCollection)
            }

            mongo = {
                url,
                database,
                collection
            }
        }

        config = {
            token,
            nodes,
            embedColor,
            maintenance,
            mongo
        }
    } catch (err) {
        throw new QixingError("CONFIG", (err as Error).message)
    }
} catch (err) {
    throw new QixingError("CONFIG", (err as Error).message)
}

export interface Config {
    token: string
    nodes: Node[]
    embedColor: string
    maintenance: boolean
    mongo?: Mongo
}

export interface Node {
    name: string
    url: string
    password: string
    secure: boolean
}

export interface Mongo {
    url: string
    database: string
    collection: string
}

const envRegex = /{{(.+)}}/g

function resolveString(str: string): string {
    return str.replace(envRegex, (_, rawEnvname: string) => {
        const envName = rawEnvname.trim()
        const env = process.env[envName]

        if (env === undefined) throw new QixingError("CONFIG", `Env '${envName}' not found`)

        return env
    })
}

function validateString(val: unknown, path: string): val is string {
    if (typeof val !== "string") throw new QixingError("CONFIG", `Pair must be a string at '${path}'`)
    return true
}

function validateBoolean(val: unknown, path: string): val is boolean {
    if (typeof val !== "boolean") throw new QixingError("CONFIG", `Pair must be a boolean at '${path}'`)
    return true
}
