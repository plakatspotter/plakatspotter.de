import { Database, type Statement } from "bun:sqlite";
import { dbPlugin } from ".";

export interface Party {
    readonly id: number;
    name: string;
    shortName: string,
    website: string | null,
}

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

export const createPartiesTable = (migrator: Migrator<{ db: Database }>) => {
    const db = migrator.state.db;
    migrator.sql("createPartiesTable", "CREATE TABLE parties (id INTEGER PRIMARY KEY, name TEXT NOT NULL, shortName TEXT NOT NULL, website TEXT)");

    const createPartyStmt = db.query<Party, {$name: string, $shortName: string, $website: string | null}>("INSERT INTO parties (name, shortName, website) VALUES ($name, $shortName, $website) RETURNING *");
    function createParty(name: string, shortName: string, website: string | null): Party {
        return createPartyStmt.get({ $name: name, $shortName: shortName, $website: website })!
    }

    const listPartiesStmt = db.query<Party, any>("SELECT * FROM parties");
    function listParties() {
        return listPartiesStmt.all()
    }

    const getPartyByNameStmt = db.query<Party, { $name: string }>("SELECT * FROM parties WHERE name == $name");
    function getPartyByName(name: string) {
        return getPartyByNameStmt.get({ $name: name })
    }

    const getPartyByShortNameStmt = db.query<Party, {$shortName: string}>("SELECT * FROM parties WHERE shortName == $shortName");
    function getPartyByShortName(shortName: string) {
        return getPartyByShortNameStmt.get({$shortName: shortName})
    }

    return {
        "db": db,
        "createParty": createParty,
        "listParties": listParties,
        "getPartyByName": getPartyByName,
        "getPartyByShortName": getPartyByShortName,
    }
}

export const seedParties = <S extends ReturnType<typeof createPartiesTable>>(migrator: Migrator<S>) => {
    const { createParty, getPartyByShortName } = migrator.state;

    if (getPartyByShortName("CDU") == null) {
        createParty("Christlich Demokratische Union", "CDU", "http://www.cdu.de/");
    }

    if (getPartyByShortName("GRÜNE") == null) {
        createParty("BÜNDNIS 90/DIE GRÜNEN", "GRÜNE", "http://www.gruene.de/");
    }

    if (getPartyByShortName("SPD") == null) {
        createParty("Sozialdemokratische Partei Deutschlands", "SPD", "https://www.spd.de/");
    }

    if (getPartyByShortName("AfD") == null) {
        createParty("Alternative für Deutschland", "AfD", "https://www.afd.de/");
    }

    if (getPartyByShortName("CSU") == null) {
        createParty("Christlich Soziale Union in Bayern", "CSU", "http://www.csu.de/");
    }

    if (getPartyByShortName("DIE LINKE") == null) {
        createParty("DIE LINKE.", "DIE LINKE", "http://www.die-linke.de/")
    }

    if (getPartyByShortName("FDP") == null) {
        createParty("Freie Demokratische Partei/Demokratische Volkspartei  Deutschland", "FDP", "http://www.fdp.de/");
    }

    if (getPartyByShortName("FREIE WÄHLER") == null) {
        createParty("Bundesvereinigung FREIE WÄHLER", "FREIE WÄHLER", "http://www.freiewaehler.eu/");
    }

    if (getPartyByShortName("Die PARTEI") == null) {
        createParty("Partei für Arbeit, Rechtsstaat, Tierschutz, Elitenförderung und basisdemokratische Initiative", "Die PARTEI", "http://www.die-partei.de/");
    }

    if (getPartyByShortName("PIRATEN") == null) {
        createParty("Piratenpartei Deutschland", "PIRATEN", "http://www.piratenpartei.de/");
    }

    if (getPartyByShortName("Tierschutzpartei") == null) {
        createParty("PARTEI MENSCH UMWELT TIERSCHUTZ", "Tierschutzpartei", "http://www.tierschutzpartei.de/");
    }

    return migrator.state
}
