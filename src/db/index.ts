import { Elysia } from "elysia";
import { Database } from "bun:sqlite";
import { Migrator, initial } from "./migrations";

function x(sqlite: Database) {
    return Migrator.new(sqlite).run(initial).finish();
}

export type PlakatDb = ReturnType<typeof x>;

export function dbPlugin(dbPath: string) {
    console.log(`Connecting to database ${dbPath}`)
    const sqlite = new Database(dbPath, {
        create: true,
    });
    sqlite.run("PRAGMA journal_mode = WAL;");

    return new Elysia()
        .decorate("db", x(sqlite))
} 