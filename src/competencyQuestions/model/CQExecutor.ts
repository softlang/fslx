import type {CQDefinition} from "./CQDefinitions.ts";
import type {Ontology} from "../../ontology/Ontology.ts";
import type {GraphRelation} from "../../components/CytoscapeGraph.tsx";
import type {OntologyClass} from "../../ontology/types/OntologyClass.ts";
import type {CQValues} from "./CQValues.ts";
import type {CQResult} from "./CQResult.ts";

type Edge = {
    predicate: string;
    otherId: string;
    outgoing: boolean;
};

export class CQExecutor {
    public executeCQ(cq: CQDefinition | null, ontology: Ontology, query: CQValues): CQResult | null {
        // TODO: Transitivity
        if (!cq || !query || !ontology) {
            return null;
        }
        switch (cq.id) {
            case "relation":
                return this.executeRelation(ontology, query);

            case "shared":
                return this.executeShared(ontology, query);

            case "distinguishing":
                return this.executeDistinguishing(ontology, query);

            case "classification":
                return this.executeClassification(ontology, query);

            default:
                return null;
        }
    }

    private executeRelation(ontology: Ontology, query: CQValues): CQResult | null {
        const subject = this.classOf(ontology, query.subject);
        if (!subject) {
            return null;
        }

        const predicates = this.predicatesOf(query);
        const relations: GraphRelation[] = [];

        for (const edge of this.edgesOf(subject, predicates)) {
            const other = ontology.classes.get(edge.otherId);
            if (!other) {
                continue;
            }
            relations.push(this.toGraphRelation(subject, other, edge));
        }

        return this.buildResult(ontology, predicates, relations, [subject]);
    }

    private executeShared(ontology: Ontology, query: CQValues): CQResult | null {
        const subjectA = this.classOf(ontology, query.subjectA);
        const subjectB = this.classOf(ontology, query.subjectB);
        if (!subjectA || !subjectB) {
            return null;
        }

        const predicates = this.predicatesOf(query);
        const relations: GraphRelation[] = [];

        for (const edge of this.edgesOf(subjectA, predicates)) {
            if (!this.hasEdge(subjectB, edge)) {
                continue;
            }

            const other = ontology.classes.get(edge.otherId);
            if (!other) {
                continue;
            }
            relations.push(this.toGraphRelation(subjectA, other, edge));
            relations.push(this.toGraphRelation(subjectB, other, edge));
        }

        return this.buildResult(ontology, predicates, relations, [subjectA, subjectB]);
    }

    private executeDistinguishing(ontology: Ontology, query: CQValues): CQResult | null {
        const subjectA = this.classOf(ontology, query.subjectA);
        const subjectB = this.classOf(ontology, query.subjectB);
        if (!subjectA || !subjectB) {
            return null;
        }

        const predicates = this.predicatesOf(query);
        const relations: GraphRelation[] = [];

        for (const [subject, counterpart] of [[subjectA, subjectB], [subjectB, subjectA]]) {
            for (const edge of this.edgesOf(subject, predicates)) {
                if (this.hasEdge(counterpart, edge)) {
                    continue;
                }

                const other = ontology.classes.get(edge.otherId);
                if (!other) {
                    continue;
                }
                relations.push(this.toGraphRelation(subject, other, edge));
            }
        }

        return this.buildResult(ontology, predicates, relations, [subjectA, subjectB]);
    }

    private executeClassification(ontology: Ontology, query: CQValues): CQResult | null {
        const subject = this.classOf(ontology, query.subject);
        const classification = this.classOf(ontology, query.class);
        if (!subject || !classification) {
            return null;
        }

        const relations = this.edgesOf(subject)
            .filter(edge => edge.otherId === classification.id)
            .map(edge => this.toGraphRelation(subject, classification, edge));

        return this.buildResult(ontology, [], relations, [subject, classification]);
    }

    private classOf(ontology: Ontology, value: string | string[] | undefined): OntologyClass | undefined {
        return typeof value === "string" ? ontology.classes.get(value) : undefined;
    }

    private predicatesOf(query: CQValues): string[] {
        const value = query.predicate;
        return Array.isArray(value) ? value : [];
    }

    private edgesOf(clazz: OntologyClass, predicates: string[] = []): Edge[] {
        const edges: Edge[] = [
            ...clazz.relations.map(r => ({predicate: r.predicate, otherId: r.targetId, outgoing: true})),
            ...clazz.incomingRelations.map(r => ({predicate: r.predicate, otherId: r.sourceId, outgoing: false}))
        ];

        return predicates.length > 0 ? edges.filter(edge => predicates.includes(edge.predicate)) : edges;
    }

    private hasEdge(clazz: OntologyClass, edge: Edge): boolean {
        return edge.outgoing
            ? clazz.relations.some(r => r.predicate === edge.predicate && r.targetId === edge.otherId)
            : clazz.incomingRelations.some(r => r.predicate === edge.predicate && r.sourceId === edge.otherId);
    }

    private toGraphRelation(subject: OntologyClass, other: OntologyClass, edge: Edge): GraphRelation {
        return edge.outgoing
            ? {source: subject, target: other, predicate: edge.predicate}
            : {source: other, target: subject, predicate: edge.predicate};
    }

    private buildResult(ontology: Ontology, predicates: string[], relations: GraphRelation[],
                        focusClasses: OntologyClass[]): CQResult {
        return {
            graphContext: {
                originClasses: focusClasses,
                relations,
                visibleRelations: predicates.length > 0 ? predicates : ontology.allPredicates
            },
            focusClasses
        };
    }
}
