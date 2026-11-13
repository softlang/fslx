import type {OntologyClass} from "../../ontology/types/OntologyClass.ts";
import type {CQResult} from "../../competencyQuestions/model/CQResult.ts";

export type GraphView =
    | {kind: "root"}
    | {kind: "class", clazz: OntologyClass}
    | {kind: "cq", result: CQResult}
    | {kind: "search", results: OntologyClass[]}