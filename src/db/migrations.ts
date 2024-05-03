import { Database } from "bun:sqlite";

export interface Party {
    readonly id: number;
    name: string;
}

type Migration<In, Out> = (migrator: Migrator<In>) => Out;

export class Migrator<S> {
    private constructor(public state: S) {    }

    public static new(db: Database): Migrator<{db: Database}> {
        return new Migrator({db})
    }

    public run<O>(migration: Migration<S, O>): Migrator<O> {
        return new Migrator(migration(this))
    }

    public finish(): S {
        return this.state
    }

    public sql<T extends S & {db: Database}>(this: Migrator<T>, key: string, stmt: string): Migrator<T> {
        if (this.isStmtNeeded(key)) {
            console.log("Runnig migration", stmt);
            this.state.db.run(stmt);
            this.recordStmtExecution(key);
        }

        return this;
    }

    private isStmtNeeded<T extends S & {db: Database}>(this: Migrator<T>, key: string): boolean {
        const {count} = this.state.db.query<{count: number}, any>("SELECT COUNT(*) as count FROM migrations WHERE key == $key").get({$key: key})!;
        return count == 0
    }

    private recordStmtExecution<T extends S & {db: Database}>(this: Migrator<T>, key: string) {
        this.state.db.run("INSERT INTO migrations (key, applied_at) VALUES ($key, $applied_at)", {
            $key: key,
            $applied_at: new Date().toISOString(),
        } as any)
    }
}

export const initial = (migrator: Migrator<{db: Database}>) => {
    const db = migrator.state.db;
    db.run("CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY, key TEXT NOT NULL UNIQUE, applied_at TEXT NOT NULL)")

    migrator.sql("create_parties_table", "CREATE TABLE parties (id INTEGER PRIMARY KEY, name TEXT NOT NULL)");


    const createPartyStmt = db.query<Party, any>("INSERT INTO parties (name) VALUES ($name) RETURNING id, name");
    function createParty(name: string): Party {
        return createPartyStmt.get({$name: name})!
    }

    const listPartiesStmt = db.query<Party, any>("SELECT * FROM parties")
    function listParties(): Party[] {
        return listPartiesStmt.all()
    }

    createParty("CDU");
    createParty("FDP");

    return {
        "db": db,
        "createParty": createParty,
        "listParties": listParties,
    }
}