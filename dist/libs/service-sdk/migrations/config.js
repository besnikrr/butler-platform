"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
const config = {
    entities: [],
    discovery: {
        warnWhenNoEntities: false
    },
    dbName: process.env.DB,
    type: "postgresql",
    port: 5432,
    user: process.env.POSTGRES_USER || "platform",
    password: process.env.POSTGRES_PASSWORD || "platform",
    migrations: {
        tableName: "mikroorm_migrations",
        path: "./db/migrations",
        pattern: /^[\w-]+\d+\.js$/,
        emit: "js"
    }
};
exports.default = config;
//# sourceMappingURL=config.js.map