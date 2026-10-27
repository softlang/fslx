import type {NamedNode} from "rdflib";
import type {OntologyRelation} from "./OntologyRelation.ts";
import {OntologyParser} from "../OntologyParser.ts";

export class OntologyClass {
    id: string;
    node: NamedNode;

    label?: string;
    comment?: string;

    relations: OntologyRelation[] = [];
    incomingRelations: OntologyRelation[] = [];

    constructor(node: NamedNode) {
        this.node = node;
        this.id = node.value;
    }

    get name(): string {
        return this.label ?? OntologyParser.shorten(this.id);
    }
}