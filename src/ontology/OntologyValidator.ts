import type {Ontology} from "./Ontology.ts";

export class OntologyValidator {

    public errorMessages: string[] = [];
    public constructor() {}

    public validate(ontology: Ontology): boolean {
        this.errorMessages = [];
        if (ontology.modules.length === 0) {
            this.errorMessages.push("No modules found");
        }
        for(const module of ontology.modules) {
            for(const i of module.imports) {
                if(!ontology.modules.some(value => value.ontologyIRI === i)) {
                    if(!this.errorMessages.includes("Imported module not found: " + i)) {
                        this.errorMessages.push("Imported module not found: " + i);
                    }
                }
            }
        }
        return this.errorMessages.length === 0;
    }
}