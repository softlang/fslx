import type {OntologyClass} from "../ontology/types/OntologyClass.ts";
import type {OntologyRelation} from "../ontology/types/OntologyRelation.ts";
import type {GraphContext, GraphRelation} from "../components/CytoscapeGraph.tsx";
import type {Ontology} from "../ontology/Ontology.ts";

export const createContext = (originClasses: OntologyClass[], ontology: Ontology, visibleRelations: string[]): GraphContext => {
    const relations: GraphRelation[] = [];
    const visiblePredicates = ontology.predicateIRIsOf(visibleRelations);

    function processRelation(relation: OntologyRelation) {
        if (!visiblePredicates.has(relation.predicate.value)) {
            return;
        }

        const source = ontology.classes.get(relation.subject.value);
        const target = ontology.classes.get(relation.object.value);

        if (!source || !target) {
            return;
        }

        relations.push({
            source,
            target,
            predicate: ontology.predicateName(relation)
        })
    }

    for (const origin of originClasses) {
        origin.relations.forEach(processRelation);
        origin.incomingRelations.forEach(processRelation);
    }

    return {originClasses, relations, visibleRelations};
};