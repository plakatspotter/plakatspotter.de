import { withBaseLayout } from "../components/baseLayout.tsx";
import { ThemeToggle } from "../components/themeToggle.tsx";
import { UploadImage } from "../components/uploadImage.tsx";
import type { PlakatDb } from "../lib/db/index.ts";
import type { View } from "../lib/view.ts";

export const Index: View<{ db: PlakatDb }> = ({ db }) => withBaseLayout(({ ctx }) => {
    ctx.addStyle(<link rel="stylesheet" href="/public/styles/pages/index.css"></link>);

    const parties = db.listParties();

    return (
        <>
            <header>
                <ThemeToggle />
            </header>

            <main>
                <ul>
                    {parties.map(elem => <li><a href={`/party/${elem.shortName}/`}>{JSON.stringify(elem)}</a></li>)}
                </ul>

                <UploadImage />
            </main>
        </>
    );
})
