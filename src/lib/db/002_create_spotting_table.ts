import { Database } from "bun:sqlite";
import type { Migrator } from ".";
import type { Party, createPartiesTable } from "./001_create_parties_table";

export interface Spotting {
    readonly id: number;
    party: Party["id"];
    location: string;
}

export const createSpottingsTable = <S extends { db: Database }>(migrator: Migrator<S>) => {
    const db = migrator.state.db;
    migrator.sql("createSpottingsTable", "CREATE TABLE spottings (id INTEGER PRIMARY KEY, party INTEGER NOT NULL, location TEXT NOT NULL)");

    const createSpottingStmt = db.prepare<Spotting, { $partyId: number, $location: string }>("INSERT INTO spottings (party, location) VALUES ($partyId, $location) RETURNING *");
    function createSpotting(partyId: Party["id"], location: string) {
        return createSpottingStmt.get({ $partyId: partyId, $location: location })!
    }

    const listSpottingsForPartyStmt = db.prepare<Spotting, { $partyId: number }>("SELECT * FROM spottings WHERE party == $partyId");
    function listSpottingsForParty(partyId: Party["id"]) {
        return listSpottingsForPartyStmt.all({ $partyId: partyId })
    }

    return {
        createSpotting,
        listSpottingsForParty,
        ...migrator.state
    }
}

export const seedSpottingsForDev = <S extends (ReturnType<typeof createSpottingsTable> & ReturnType<typeof createPartiesTable>)>(numSpottings: number) => (migrator: Migrator<S>) => {
    const { listParties, listSpottingsForParty, createSpotting } = migrator.state;

    for (const i_party of listParties()) {
        const existingSpottings = listSpottingsForParty(i_party.id);
        if (existingSpottings.length < numSpottings) {
            console.log(`Seeding spottings for ${i_party.shortName} with ${numSpottings - existingSpottings.length} spottings (will have ${numSpottings} in totals)`);
            for (let i = 0; i < numSpottings - existingSpottings.length; i++) {
                createSpotting(i_party.id, generateRandomCoordinate());
            }
        }
    }

    return migrator.state;
}

function generateRandomCoordinate(): string {
    function rand(low: number, high: number) {
        const num = Math.random() * (high - low) + low;
        return Math.round(num)
    }

    return `${rand(0, 360)}°${rand(0, 60)}'${rand(0,60)}''N${rand(0, 360)}°${rand(0,60)}'${rand(0,60)}''E`
}
