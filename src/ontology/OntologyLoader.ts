import {graph} from "rdflib";
import {OntologyParser} from "./OntologyParser.ts";
import {Ontology} from "./Ontology.ts";

const TTLS = import.meta.glob<string>("/fsl/ontologies/*.ttl", {query: "?raw", import: "default", eager: true});

export class OntologyLoader {
    public constructor() {}

    public load(): Ontology | undefined {
        const files = Object.entries(TTLS);

        if (files.length === 0) {
            return undefined;
        }

        const store = graph();
        files.forEach(([path, ttl]) => OntologyParser.parse(OntologyParser.shorten(path), ttl, store));

        return new Ontology(store);
    }
}
