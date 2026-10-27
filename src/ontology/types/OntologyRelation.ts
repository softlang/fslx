import type {NamedNode, Statement} from "rdflib";

export type OntologyRelation = Statement<NamedNode, NamedNode, NamedNode>;