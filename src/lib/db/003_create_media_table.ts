import { Database } from "bun:sqlite";
import type { Migrator } from ".";

export interface Media {
    readonly id: number;
    storagePath: string,
    name: string,
}

export const createMediaTable = <S extends {db: Database}>(migrator: Migrator<S>) => {
    const db = migrator.state.db;

    migrator.sql("createMediaTable", "CREATE TABLE media (id INTEGER PRIMARY KEY, storagePath TEXT NOT NULL UNIQUE, name TEXT NOT NULL)");

    const createMediaStmt = db.prepare<Media, { $storagePath: string, $name: string }>("INSERT INTO media (storagePath, name) VALUES ($storagePath, $name) RETURNING *");
    function createMedia(storagePath: string, name: string) {
        return createMediaStmt.get({$storagePath: storagePath, $name: name});
    }

    return {
        createMedia,
        ...migrator.state
    }
}
