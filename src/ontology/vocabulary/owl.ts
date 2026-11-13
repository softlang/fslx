import {Namespace} from "rdflib";

export const OWL_NAMESPACE = "http://www.w3.org/2002/07/owl#";

const NS = Namespace(OWL_NAMESPACE);

export const OWL = {
    Class: NS("Class")
} as const;
