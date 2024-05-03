import { Elysia } from "elysia";
import { Database } from "bun:sqlite";
import { Migrator, createPartiesTable, seedParties } from "./migrations";

function initDb(sqlite: Database) {
    return Migrator.new(sqlite)
        .migrate(createPartiesTable)
        .migrate(seedParties)
        .finish();
}

export type PlakatDb = ReturnType<typeof initDb>;

export function dbPlugin(dbPath: string) {
    console.log(`Connecting to database ${dbPath}`)
    const sqlite = new Database(dbPath, {
        create: true,
    });
    sqlite.run("PRAGMA journal_mode = WAL;");

    return new Elysia()
        .decorate("db", initDb(sqlite))
} 