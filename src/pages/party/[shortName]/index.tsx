import type { Component } from "@kitajs/html";
import { withBaseLayout } from "../../../components/baseLayout";
import type { PlakatDb } from "../../../lib/db";
import type { Party } from "../../../lib/db/001_create_parties_table";
import type { View } from "../../../lib/view";
import type { Spotting } from "../../../lib/db/002_create_spotting_table";
import { NotFound } from "../../../components/404";

const SafePartyView: Component<{ partyShortName: string, party: Party, spottings: Spotting[] }> = ({ partyShortName, party, spottings }) => (
    <main>
        <h1>{partyShortName} Overview</h1>
        <ul>
            {spottings.map(elem => <li>{JSON.stringify(elem)}</li>)}
        </ul>
    </main>
);

export const PartyView: View<{ db: PlakatDb, partyShortName: string }> = ({ db, partyShortName }) => withBaseLayout(({ ctx }) => {
    ctx.setTitle(partyShortName);

    const party = db.getPartyByShortName(partyShortName);
    const spottings = party != null ? db.listSpottingsForParty(party.id) : undefined;

    return party && spottings ?
        <SafePartyView party={party} spottings={spottings} partyShortName={partyShortName} /> :
        <NotFound msg={`There is no party ${partyShortName}`} />
});
