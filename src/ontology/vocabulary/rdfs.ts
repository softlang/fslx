import {Namespace} from "rdflib";

const NS = Namespace("http://www.w3.org/2000/01/rdf-schema#");

export const RDFS = {
    Class: NS("Class"),
    label: NS("label"),
    comment: NS("comment"),
    subClassOf: NS("subClassOf"),
} as const;
