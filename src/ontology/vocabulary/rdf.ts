import {Namespace} from "rdflib";

const NS = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");

export const RDF = {
    type: NS("type"),
    first: NS("first"),
    rest: NS("rest"),
} as const;
