"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const node_fs_1 = require("node:fs");
const yaml_1 = require("yaml");
const QixingError_1 = require("./structures/QixingError");
try {
    const rawConfigFile = (0, node_fs_1.readFileSync)("config.yaml", "utf-8");
    try {
        const rawConfig = (0, yaml_1.parseDocument)(rawConfigFile);
        const rawToken = rawConfig.get("token");
        let token;
        if (validateString(rawToken, "token")) {
            token = resolveString(rawToken);
        }
        const rawNodes = rawConfig.get("nodes");
        if (!(0, yaml_1.isSeq)(rawNodes))
            throw new QixingError_1.QixingError("CONFIG", "Pair must be a sequence at 'nodes'");
        const nodes = [];
        for (let i = 0; i < rawNodes.items.length; i++) {
            const rawNode = rawNodes.get(i);
            if (!(0, yaml_1.isMap)(rawNode))
                throw new QixingError_1.QixingError("CONFIG", `Pair must be a map at 'nodes.${i}'`);
            const rawName = rawNode.get("name");
            let name;
            if (validateString(rawName, `nodes.${i}.name`)) {
                name = resolveString(rawName);
            }
            const rawUrl = rawNode.get("url");
            let url;
            if (validateString(rawUrl, `nodes.${i}.url`)) {
                url = resolveString(rawUrl);
            }
            const rawPassword = rawNode.get("password");
            let password = "youshallnotpass";
            if (rawPassword !== undefined && validateString(rawPassword, `nodes.${i}.password`)) {
                password = resolveString(rawPassword);
            }
            const rawIsSecure = rawNode.get("is-secure");
            let secure = false;
            if (rawIsSecure !== undefined && validateBoolean(rawIsSecure, `nodes.${i}.is-secure`)) {
                secure = rawIsSecure;
            }
            const node = {
                name,
                url,
                password,
                secure
            };
            nodes.push(node);
        }
        if (!nodes.length)
            throw new QixingError_1.QixingError("CONFIG", "Need atleast one node configured");
        const rawEmbedColor = rawConfig.get("embed-color");
        let embedColor = "#7E57C2";
        if (rawEmbedColor !== undefined && validateString(rawEmbedColor, "embed-color")) {
            embedColor = resolveString(rawEmbedColor);
        }
        const rawMaintenance = rawConfig.get("maintenance");
        let maintenance = false;
        if (rawMaintenance !== undefined && validateBoolean(rawMaintenance, "maintenance")) {
            maintenance = rawMaintenance;
        }
        const rawMongo = rawConfig.get("mongo");
        let mongo;
        if (rawMongo !== undefined) {
            if (!(0, yaml_1.isMap)(rawMongo))
                throw new QixingError_1.QixingError("CONFIG", "Pair must be a map at 'mongo'");
            const rawUrl = rawMongo.get("url");
            let url;
            if (validateString(rawUrl, "mongo.url")) {
                url = rawUrl;
            }
            const rawDatabase = rawMongo.get("database");
            let database = "qixing-music";
            if (rawDatabase !== undefined && validateString(rawDatabase, "mongo.database")) {
                database = rawDatabase;
            }
            const rawCollection = rawMongo.get("collection");
            let collection = "queue";
            if (rawCollection !== undefined && validateString(rawCollection, "mongo.collection")) {
                collection = rawCollection;
            }
            mongo = {
                url,
                database,
                collection
            };
        }
        exports.config = {
            token,
            nodes,
            embedColor,
            maintenance,
            mongo
        };
    }
    catch (err) {
        throw new QixingError_1.QixingError("CONFIG", err.message);
    }
}
catch (err) {
    throw new QixingError_1.QixingError("CONFIG", err.message);
}
const envRegex = /{{(.+)}}/g;
function resolveString(str) {
    return str.replace(envRegex, (_, rawEnvname) => {
        const envName = rawEnvname.trim();
        const env = process.env[envName];
        if (env === undefined)
            throw new QixingError_1.QixingError("CONFIG", `Env '${envName}' not found`);
        return env;
    });
}
function validateString(val, path) {
    if (typeof val !== "string")
        throw new QixingError_1.QixingError("CONFIG", `Pair must be a string at '${path}'`);
    return true;
}
function validateBoolean(val, path) {
    if (typeof val !== "boolean")
        throw new QixingError_1.QixingError("CONFIG", `Pair must be a boolean at '${path}'`);
    return true;
}
