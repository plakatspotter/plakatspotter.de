import { t } from "elysia";
import path from "node:path";
import type { PlakatDb } from "../../../lib/db";
import type { View } from "../../../lib/view";
import { storeImageBlob } from "../../../lib/media";

export const UploadView: View<{db: PlakatDb, mediaDir: string, partyShortName: string, body: (typeof uploadSchema)["static"]}> = async ({db, mediaDir, partyShortName, body}) => {
    const name = await storeImageBlob(body.file, path.join(mediaDir, body.name + ".webp"));
    return `Wrote ${name}`;
}

export const uploadSchema = t.Object({
    name: t.String(),
    file: t.File(),
})
