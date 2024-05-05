import { withBaseLayout, type LayoutContext } from "../components/baseLayout.tsx";
import { UploadImage } from "../components/uploadImage.tsx";
import type { PlakatDb } from "../db/index.ts";
import type { View } from "../lib/view.ts";

export const Index: View<{ db: PlakatDb }> = ({ db }) => withBaseLayout(({ ctx }) => {
    ctx.addStyle(<link rel="stylesheet" href="/public/styles/reset.css"></link>);
    ctx.addStyle(<link rel="stylesheet" href="/public/styles/index.css"></link>);

    const parties = db.listParties();

    return (
        <main>
            <div>
                {parties.map(elem => <p>{JSON.stringify(elem)}</p>)}
            </div>

            <UploadImage />
        </main>
    );
})
