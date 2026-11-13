import {Namespace} from "rdflib";

export const RDFS_NAMESPACE = "http://www.w3.org/2000/01/rdf-schema#";

const NS = Namespace(RDFS_NAMESPACE);

export const RDFS = {
    Class: NS("Class"),
    label: NS("label"),
    comment: NS("comment"),
    subClassOf: NS("subClassOf"),
} as const;
