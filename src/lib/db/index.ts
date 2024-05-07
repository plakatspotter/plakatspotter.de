import { Elysia } from "elysia";
import { Database } from "bun:sqlite";
import { createPartiesTable, seedParties } from "./001_create_parties_table";
import { createSpottingsTable, seedSpottingsForDev } from "./002_create_spotting_table";
import type { Configuration } from "../config";
import { createMediaTable } from "./003_create_media_table";

type Migration<In, Out> = (migrator: Migrator<In>) => Out;

export class Migrator<S> {
    private constructor(public state: S) { }

    public static new(db: Database): Migrator<{ db: Database }> {
        // ensure the migration table exists in the database
        db.run("CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY, key TEXT NOT NULL UNIQUE, applied_at TEXT NOT NULL)")

        return new Migrator({ db })
    }

    public migrate<O>(migration: Migration<S, O>): Migrator<O> {
        return new Migrator(migration(this))
    }

    public finish(): S {
        return this.state
    }

    public sql<T extends S & { db: Database }>(this: Migrator<T>, key: string, stmt: string): Migrator<T> {
        if (this.isStmtNeeded(key)) {
            console.log(`Runnig migration ${key}`);
            this.state.db.run(stmt)
            this.recordStmtExecution(key);
        }

        return this;
    }

    private isStmtNeeded<T extends S & { db: Database }>(this: Migrator<T>, key: string): boolean {
        const { count } = this.state.db.query<{ count: number }, any>("SELECT COUNT(*) as count FROM migrations WHERE key == $key").get({ $key: key })!;
        return count == 0
    }

    private recordStmtExecution<T extends S & { db: Database }>(this: Migrator<T>, key: string) {
        this.state.db.run("INSERT INTO migrations (key, applied_at) VALUES ($key, $applied_at)", {
            $key: key,
            $applied_at: new Date().toISOString(),
        } as any)
    }
}

/**
 * A migration which does nothing
 */
function noop<S>(migrator: Migrator<S>): S {
    return migrator.state;
}

export interface DbOptions {
    path: string,
    seedDb: boolean,
}

export type PlakatDb = ReturnType<typeof makeDb>;

export function makeDb(opts: DbOptions) {
    console.log(`Connecting to database ${opts.path}`)
    const sqlite = new Database(opts.path, {
        create: true,
    });
    sqlite.run("PRAGMA journal_mode = WAL;");

    return Migrator.new(sqlite)
        .migrate(createPartiesTable)
        .migrate(seedParties)
        .migrate(createSpottingsTable)
        .migrate(opts.seedDb ? seedSpottingsForDev(10) : noop)
        .migrate(createMediaTable)
        .finish();
}

export function dbPlugin(opts: DbOptions) {
    return new Elysia()
        .decorate("db", makeDb(opts))
} 