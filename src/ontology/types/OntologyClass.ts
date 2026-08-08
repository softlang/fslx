import type {IncomingRelation, OntologyRelation} from "./OntologyRelation.ts";

export class OntologyClass {
    id: string;

    label?: string;
    comment?: string;

    relations: OntologyRelation[] = [];
    incomingRelations: IncomingRelation[] = [];

    constructor(id: string) {
        this.id = id;
    }
}