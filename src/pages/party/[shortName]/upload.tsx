import { t } from "elysia";
import type { PlakatDb } from "../../../lib/db";
import type { View } from "../../../lib/view";

export const UploadView: View<{db: PlakatDb, partyShortName: string}> = ({db, partyShortName}) => {
    throw "Not Implemented"
}

export const uploadSchema = {
    name: t.String(),
    file: t.File(),
}