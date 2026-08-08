import type cytoscape from "cytoscape";
import type {OntologyClass} from "./types/OntologyClass.ts";
import type {GraphContext} from "../components/CytoscapeGraph.tsx";

export class OntologyGraphBuilder {
    private nodes = new Map<string, cytoscape.ElementDefinition>();
    private edges = new Map<string, cytoscape.ElementDefinition>();

    public build(context: GraphContext): cytoscape.ElementDefinition[] {
        this.nodes.clear();
        this.edges.clear();
        const visibleRelations = new Set(context.visibleRelations);

        context.originClasses.forEach(clazz => this.addNode(clazz, visibleRelations));

        context.relations.forEach(relation => {
            if (!visibleRelations.has(relation.predicate)) {
                return;
            }
            this.addNode(relation.source, visibleRelations);
            this.addNode(relation.target, visibleRelations);
            this.addEdge(relation.source, relation.target, relation.predicate);
        })

        return [
            ...this.nodes.values(),
            ...this.edges.values()
        ];
    }

    private addEdge(source: OntologyClass, target: OntologyClass, predicate: string) {
        const id = source.id + "|" + predicate + "|" + target.id;

        this.edges.set(id, {
            data: {
                id: id,
                source: source.id,
                target: target.id,
                label: predicate,
            }
        });
    }

    private addNode(clazz: OntologyClass, visibleRelations: Set<string>) {
        if (this.nodes.has(clazz.id)) {
            return;
        }

        const size = clazz.relations.filter(r => visibleRelations.has(r.predicate)).length
            + clazz.incomingRelations.filter(r => visibleRelations.has(r.predicate)).length;

        this.nodes.set(clazz.id, {
            data: {
                id: clazz.id,
                label: (clazz.label ?? clazz.id) + " [" + size + "]",
                clazz: clazz,
            }
        });
    }
}