import {Namespace} from "rdflib";

export const RDF_NAMESPACE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

const NS = Namespace(RDF_NAMESPACE);

export const RDF = {
    type: NS("type")
} as const;
