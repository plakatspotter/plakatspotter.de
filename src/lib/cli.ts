import type { Serve, ServeOptions, UnixServeOptions } from "bun";
import { parseArgs as parseArgsRaw } from "util";
import path from "path";

const REPO_PATH = path.resolve(path.join(__dirname, "..", ".."));

type Subcommand<Tag extends string, Data> = Data extends {tag: string} ? never : { tag: Tag } & Data;

export interface StartServer {
    serve: Partial<Serve>,
    development: boolean,
    mediaDir: string,
    dbPath: string,
}

export interface PartyLookup {
    dbPath: string,
}

export interface PartyMgmt {
    cmd: Subcommand<"list", PartyLookup>,
}

export interface Help {}

export interface CliOpts {
    cmd: Subcommand<"server", StartServer> | Subcommand<"party", PartyMgmt>,
}

export function parseArgs(): CliOpts {
    const args = parseArgsRaw({
        allowPositionals: true,
        strict: false,
        options: {
            "help": {
                type: "boolean",
                short: "h",
            }
        }
    });

    if (args.positionals.includes("help") || args.values.help) {
        printHelp();
        process.exit(1);
    } else if (args.positionals.includes("server")) {
        return {
            cmd: {
                tag: "server",
                ...parseServer(Bun.argv.toSpliced(0, Bun.argv.indexOf("server") + 1)),
            }
        }
    } else if (args.positionals.includes("party")) {
        return {
            cmd: {
                tag: "party",
                ...parsePartyMgmt(Bun.argv.toSpliced(0, Bun.argv.indexOf("party") + 1)),
            }
        }
    }

    throw "Unsupported command";
}

function printHelp(): void {
    throw "Rendering Help is is not implemented";
}

function parseServer(argv: string[]): StartServer {
    const { values: args } = parseArgsRaw({
        args: argv,
        allowPositionals: false,
        strict: true,
        options: {
            listen: {
                type: "string",
                default: "http://localhost:3000"
            },
            dev: {
                type: "boolean",
                default: true,
            },
            db: {
                type: "string",
                default: path.join(REPO_PATH, "db.sqlite3"),
            },
            media: {
                type: "string",
                default: path.join(REPO_PATH, "media"),
            }
        }
    });

    let serve: Partial<Serve>;
    const serveUrl = new URL(args.listen!);
    if (serveUrl.protocol == "unix:") {
        serve = {
            development: args.dev!,
            unix: serveUrl.pathname,
        } satisfies Partial<UnixServeOptions>
    } else if (serveUrl.protocol == "http:") {
        serve = {
            development: args.dev!,
            hostname: serveUrl.hostname,
            port: serveUrl.port,
        } satisfies Partial<ServeOptions>
    } else {
        throw `Listener Protocol ${serveUrl.protocol} is not supported`
    }

    return {
        development: args.dev!,
        serve: serve!,
        dbPath: args.db!,
        mediaDir: args.media!,
    }
}

function parsePartyMgmt(argv: string[]): PartyMgmt {
    function parseList(argv: string[]): PartyLookup {
        const { values: args } = parseArgsRaw({
            args: argv,
            strict: true,
            allowPositionals: false,
            options: {
                db: {
                    type: "string",
                    default: path.join(REPO_PATH, "db.sqlite3"),
                },
            }
        });

        return {
            dbPath: args.db!,
            ...args
        }
    }

    switch (argv.shift()) {
        case "list":
            return {
                cmd: {
                    tag: "list",
                    ...parseList(argv),
                }
            }
            break;
        default:
            throw "Unsupported Party Management Action";
    }
}
