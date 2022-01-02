import { ColorResolvable } from "discord.js"
import { readFileSync } from "node:fs"
import { parseDocument, isSeq, isMap } from "yaml"
import { QixingError } from "./structures/QixingError"

const envRegex = /{{(.+)}}/g

const rawConfigFile = readFileSync("config.yaml", "utf-8")
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
let embedColor: ColorResolvable = "#7E57C2"

if (rawEmbedColor !== undefined && validateString(rawEmbedColor, "embed-color")) {
    embedColor = resolveString(rawEmbedColor) as ColorResolvable
}

const rawMaintenance = rawConfig.get("maintenance")
let maintenance = false

if (rawMaintenance !== undefined && validateBoolean(rawMaintenance, "maintenance")) {
    maintenance = rawMaintenance
}

const rawOwners = rawConfig.get("owners")
const owners: string[] = []

if (rawOwners !== undefined) {
    if (!isSeq(rawOwners)) throw new QixingError("CONFIG", "Pair must be a sequence at 'owners'")

    for (let i = 0; i < rawOwners.items.length; i++) {
        const owner = rawOwners.get(i)

        if (validateString(owner, `owners.${i}`)) {
            owners.push(resolveString(owner))
        }
    }
}

export const config: Config = {
    token,
    nodes,
    embedColor,
    maintenance,
    owners
}

export interface Config {
    token: string
    nodes: Node[]
    embedColor: ColorResolvable
    maintenance: boolean
    owners: string[]
}

export interface Node {
    name: string
    url: string
    password: string
    secure: boolean
}

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
