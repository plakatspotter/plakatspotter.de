import type { Configuration } from "./config";
import path from "node:path"
import { mkdirSync, statSync, existsSync } from "node:fs"

/**
 * Ensure that the media path exists and is writable
 */
export function prepareMediaDir(dir: string) {
    if (existsSync(dir)) {
        const stat = statSync(dir)
        if (!stat.isDirectory()) {
            throw `${dir} is not a directory`
        }
        if (stat.mode != 0o40755) {
            throw `${dir} does not have 755 permissions`
        }
    } else {
        console.log(`Creating media path at ${dir}`);
        mkdirSync(dir, {mode: "0755"});
    }
}
