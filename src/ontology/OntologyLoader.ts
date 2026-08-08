import {graph} from "rdflib";
import {OntologyModule} from "./OntologyModule.ts";
import {OntologyParser} from "./OntologyParser.ts";
import {Ontology} from "./Ontology.ts";
import {OntologyValidator} from "./OntologyValidator.ts";

export class OntologyLoader {
    public constructor() {}

    public async load(files: FileList | null): Promise<Ontology> {
        const store = graph();
        const mods: OntologyModule[] = [];

        for (const file of Array.from(files ?? [])) {
            mods.push(await OntologyParser.parse(file, store));
        }

        const ontology = new Ontology(store, mods);
        const validator = new OntologyValidator();
        validator.validate(ontology);
        console.error(validator.errorMessages);
        return ontology;
    }
}
