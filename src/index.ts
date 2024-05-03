import {Elysia} from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";
import {Index} from "./pages";
import path from "node:path"
import {dbPlugin} from "./db";

const HTMX_PATH = path.resolve(path.join(__dirname, "..", "node_modules", "htmx.org", "dist", "htmx.js"))

const app = new Elysia()
    .use(html())
    .use(staticPlugin())
    .use(dbPlugin(":memory:"))
    .get("/public/scripts/htmx.js", () => Bun.file(HTMX_PATH))
    .get("/", ({db}) => Index({db}))
    .listen(3000);

console.log(`Server is running on http://${app.server?.hostname}:${app.server?.port}`)
