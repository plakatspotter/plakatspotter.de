import path from "node:path"

const REPO_PATH = path.resolve(path.join(__dirname, "..", ".."))

export interface Configuration {
    db: string,
    isDev: boolean,
}

export function getConfig(): Configuration {
    return {
        db: path.join(REPO_PATH, "db.sqlite3"),
        isDev: (process.env.NODE_ENV ?? "dev") == "dev",
    }
}
