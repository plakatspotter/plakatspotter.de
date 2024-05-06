import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import { Index } from "./pages";
import path from "node:path"
import { dbPlugin } from "./lib/db";
import { PartyView } from "./pages/party/[shortName]";
import { getConfig } from "./lib/config";

const HTMX_PATH = path.resolve(path.join(__dirname, "..", "node_modules", "htmx.org", "dist", "htmx.js"))

const config = getConfig();
console.log("Using configuration", config);

const app = new Elysia()
    .use(html())
    .use(staticPlugin({
        noCache: config.isDev,
    }))
    .use(dbPlugin(config))
    .headers({
        "Content-Security-Policy": "default-src 'self';",
        "X-XSS-Protection": "1; mode=block",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Strict-Transport-Security": config.isDev ? "" : "max-age=63072000; includeSubDomains; preload",
        "X-Frame-Options": "DENY",
    })
    .get("/public/scripts/htmx.js", () => Bun.file(HTMX_PATH))
    .get("/", ({ db }) => Index({ db }))
    .get("/party/:partyShortName", ({db, params: {partyShortName}}) => PartyView({db, partyShortName: decodeURI(partyShortName)}))
    .listen(3000);

console.log(`Server is running on http://${app.server?.hostname}:${app.server?.port}`)
