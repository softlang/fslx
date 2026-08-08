import type {GraphContext} from "../../components/CytoscapeGraph.tsx";
import type { OntologyClass } from "../../ontology/types/OntologyClass.ts";

export type CQResult = {
    graphContext: GraphContext;
    focusClasses: OntologyClass[];
};