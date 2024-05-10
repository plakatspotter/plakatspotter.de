import type { Serve, ServeOptions, UnixServeOptions } from "bun";
import path from "path";
import { Command } from "commander";

const REPO_PATH = path.resolve(path.join(__dirname, "..", ".."));

export type GlobalOpts = {
    db: string,
    media: string,
}

export type StartServerOpts = GlobalOpts & {
    listen: Partial<Serve>,
    dev: boolean,
}

export type ListPartiesOpts = GlobalOpts;

export function handleCli(handlers: {
    startServer: (opts: StartServerOpts) => void, 
    listParties: (opts: ListPartiesOpts) => void,
}): void {
    const program = new Command("plakatspotter")
        .description("A web based tool for gathering and analyzing data about election posters")
        .option("--db <path>", "Path to the sqlite database", path.join(REPO_PATH, "db.sqlite3"))
        .option("--media <path>", "Path to the applications media directory", path.join(REPO_PATH, "media"))
        .option("--dev", "Enable development mode (extra logging, no caching, etc…)", false);

    program.command("server")
        .description("Run the webserver")
        .option<Partial<Serve>>("--listen <url>", "The URL on which to listen", (value) => {
            const url = new URL(value);
            switch (url.protocol) {
                case "http:":
                    return {
                        hostname: url.hostname,
                        port: parseInt(url.port),
                    } satisfies Partial<ServeOptions>

                case "unix:":
                    return {
                        unix: url.pathname,
                    } satisfies Partial<UnixServeOptions>

                default:
                    throw `Unsupported listener protocol ${url.protocol} (only http and unix are supported)`
            }
        }, {
            hostname: "localhost",
            port: 3000
        })
        .action((_, program) => handlers.startServer(program.optsWithGlobals()));

    const partyCmd = program.command("party")
        .description("party management");
    partyCmd.command("list")
        .description("list known parties")
        .action((_, program) => handlers.listParties(program.optsWithGlobals()))

    program.parse();
}

