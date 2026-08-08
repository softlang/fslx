import {Namespace} from "rdflib";

const NS = Namespace("http://www.w3.org/2002/07/owl#");

export const OWL = {
    Class: NS("Class"),
    imports: NS("imports"),
    sameAs: NS("sameAs"),
} as const;
