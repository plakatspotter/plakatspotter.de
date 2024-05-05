import { Elysia } from "elysia";
import { Database } from "bun:sqlite";
import { createPartiesTable, seedParties } from "./001_create_parties_table";
import { createSpottingsTable, seedSpottingsForDev } from "./002_create_spotting_table";

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

function initDb(sqlite: Database) {
    return Migrator.new(sqlite)
        .migrate(createPartiesTable)
        .migrate(seedParties)
        .migrate(createSpottingsTable)
        .migrate(seedSpottingsForDev(10))
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