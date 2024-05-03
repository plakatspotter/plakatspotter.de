import {Base} from "../components/base.tsx";
import type {Component} from "@kitajs/html";
import type { PlakatDb } from "../db/index.ts";

export const Index: Component<{ db: PlakatDb }> = ({db}) => {
    const parties = db.listParties();

    return (
        <Base>
        {parties.map(elem => <p>{elem.name}</p>)}
        </Base>
    );
}
