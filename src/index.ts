import { Elysia, t } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { Index } from "./pages";
import path from "node:path"
import { dbPlugin, makeDb } from "./lib/db";
import { PartyView } from "./pages/party/[shortName]";
import { prepareMediaDir } from "./lib/media";
import { UploadView } from "./pages/party/[shortName]/upload";
import { handleCli, type ListPartiesOpts, type StartServerOpts } from "./lib/cli";

const HTMX_PATH = path.resolve(path.join(__dirname, "..", "node_modules", "htmx.org", "dist", "htmx.js"))

function startServer(opts: StartServerOpts) {
    prepareMediaDir(opts.media);

    const app = new Elysia()
        .use(html())
        .use(staticPlugin({
            noCache: opts.development,
        }))
        .use(dbPlugin({
            path: opts.db,
            seedDb: opts.development,
        }))
        .headers({
            "Content-Security-Policy": "default-src 'self';",
            "X-XSS-Protection": "1; mode=block",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Cross-Origin-Opener-Policy": "same-origin",
            "Strict-Transport-Security": opts.development ? "" : "max-age=63072000; includeSubDomains; preload",
            "X-Frame-Options": "DENY",
        })
        .get("/public/scripts/htmx.js", () => Bun.file(HTMX_PATH))
        .get("/", ({ db }) => Index({ db }))
        .get("/party/:partyShortName/", ({ db, params: { partyShortName } }) => PartyView({ db, partyShortName: decodeURI(partyShortName) }))
        .post("/party/:partyShortName/spotting/", ({ db, params: { partyShortName }, body }) => UploadView({ db, partyShortName: decodeURI(partyShortName) }))
        .listen(opts.listen);

    console.log(`Server is running on ${app.server?.url.href}`)

}

function listParties(opts: ListPartiesOpts) {
    const db = makeDb({
        path: opts.db,
        seedDb: false,
    });
    const parties = db.listParties()
    console.table(parties, ["name", "shortName", "website"]);
}

handleCli({
    startServer,
    listParties,
});
