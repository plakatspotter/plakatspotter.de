import { Database } from "bun:sqlite";
import type { Migrator } from ".";

export interface Party {
    readonly id: number;
    name: string;
    shortName: string,
    website: string | null,
}

export const createPartiesTable = <S extends { db: Database }>(migrator: Migrator<S>) => {
    const db = migrator.state.db;
    migrator.sql("createPartiesTable", "CREATE TABLE parties (id INTEGER PRIMARY KEY, name TEXT NOT NULL, shortName TEXT NOT NULL, website TEXT)");

    const createPartyStmt = db.prepare<Party, { $name: string, $shortName: string, $website: string | null }>("INSERT INTO parties (name, shortName, website) VALUES ($name, $shortName, $website) RETURNING *");
    function createParty(name: string, shortName: string, website: string | null) {
        return createPartyStmt.get({ $name: name, $shortName: shortName, $website: website })!
    }

    const listPartiesStmt = db.prepare<Party, any>("SELECT * FROM parties");
    function listParties() {
        return listPartiesStmt.all()
    }

    const getPartyByNameStmt = db.prepare<Party, { $name: string }>("SELECT * FROM parties WHERE name == $name");
    function getPartyByName(name: string) {
        return getPartyByNameStmt.get({ $name: name })
    }

    const getPartyByShortNameStmt = db.prepare<Party, { $shortName: string }>("SELECT * FROM parties WHERE shortName == $shortName");
    function getPartyByShortName(shortName: string) {
        return getPartyByShortNameStmt.get({ $shortName: shortName })
    }

    return {
        createParty,
        listParties,
        getPartyByName,
        getPartyByShortName,
        ...migrator.state
    }
}

export const seedParties = <S extends ReturnType<typeof createPartiesTable>>(migrator: Migrator<S>) => {
    const { createParty, getPartyByShortName } = migrator.state;

    if (getPartyByShortName("CDU") == null) {
        console.debug("Seeding database with CDU");
        createParty("Christlich Demokratische Union", "CDU", "http://www.cdu.de/");
    }

    if (getPartyByShortName("GRÜNE") == null) {
        console.debug("Seeding database with GRÜNE");
        createParty("BÜNDNIS 90/DIE GRÜNEN", "GRÜNE", "http://www.gruene.de/");
    }

    if (getPartyByShortName("SPD") == null) {
        console.debug("Seeding database with SPD");
        createParty("Sozialdemokratische Partei Deutschlands", "SPD", "https://www.spd.de/");
    }

    if (getPartyByShortName("AfD") == null) {
        console.debug("Seeding database with AfD");
        createParty("Alternative für Deutschland", "AfD", "https://www.afd.de/");
    }

    if (getPartyByShortName("CSU") == null) {
        console.debug("Seeding database with CSU");
        createParty("Christlich Soziale Union in Bayern", "CSU", "http://www.csu.de/");
    }

    if (getPartyByShortName("DIE LINKE") == null) {
        console.debug("Seeding database with DIE LINKE");
        createParty("DIE LINKE.", "DIE LINKE", "http://www.die-linke.de/")
    }

    if (getPartyByShortName("FDP") == null) {
        console.debug("Seeding database with FDP");
        createParty("Freie Demokratische Partei/Demokratische Volkspartei  Deutschland", "FDP", "http://www.fdp.de/");
    }

    if (getPartyByShortName("FREIE WÄHLER") == null) {
        console.debug("Seeding database with FREIE WÄHLER");
        createParty("Bundesvereinigung FREIE WÄHLER", "FREIE WÄHLER", "http://www.freiewaehler.eu/");
    }

    if (getPartyByShortName("Die PARTEI") == null) {
        console.debug("Seeding database with Die PARTEI");
        createParty("Partei für Arbeit, Rechtsstaat, Tierschutz, Elitenförderung und basisdemokratische Initiative", "Die PARTEI", "http://www.die-partei.de/");
    }

    if (getPartyByShortName("PIRATEN") == null) {
        console.debug("Seeding database with PIRATEN");
        createParty("Piratenpartei Deutschland", "PIRATEN", "http://www.piratenpartei.de/");
    }

    if (getPartyByShortName("Tierschutzpartei") == null) {
        console.debug("Seeding database with Tierschutzpartei");
        createParty("PARTEI MENSCH UMWELT TIERSCHUTZ", "Tierschutzpartei", "http://www.tierschutzpartei.de/");
    }

    return migrator.state
}
