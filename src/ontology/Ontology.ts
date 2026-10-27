import {RDF} from "./vocabulary/rdf.ts";
import {OWL} from "./vocabulary/owl.ts";
import {RDFS} from "./vocabulary/rdfs.ts";
import {TBOX_NAMESPACE} from "./vocabulary/tbox.ts";
import {type NamedNode, type Node, type Statement, type Store} from "rdflib";
import {OntologyClass} from "./types/OntologyClass.ts";
import type {OntologyRelation} from "./types/OntologyRelation.ts";
import {OntologyParser} from "./OntologyParser.ts";

export class Ontology {

    public readonly store: Store;
    public readonly classes: Map<string, OntologyClass> = new Map();
    public rootClassesIDs: string[] = [];
    public allPredicates: string[] = [];
    private readonly predicateIRIs: Map<string, Set<string>> = new Map();
    private readonly predicateNames: Map<string, string> = new Map();

    public constructor(store: Store) {
        this.store = store;
        this.parseData();
    }

    private parseData() {
        // Fill Ontology Cache
        const relations = this.store.statements.filter(Ontology.isRelation);
        this.parsePredicates(relations);
        this.parseClasses(relations);
        this.parseAnnotations();
        this.parseRelations(relations);
        this.parseRootClasses();
    }

    private parsePredicates(relations: OntologyRelation[]) {
        const predicates = new Set(["type", "subClassOf", "elementOf"]);

        relations.forEach(relation => {
            const predicate = OntologyParser.shorten(relation.predicate.value);
            let iris = this.predicateIRIs.get(predicate);
            if (!iris) {
                iris = new Set();
                this.predicateIRIs.set(predicate, iris);
            }
            iris.add(relation.predicate.value);
            this.predicateNames.set(relation.predicate.value, predicate);

            if (relation.predicate.value.startsWith(TBOX_NAMESPACE)) {
                predicates.add(predicate);
            }
        });

        this.allPredicates = [...predicates];
    }

    private parseClasses(relations: OntologyRelation[]) {
        [
            ...this.store.each(null, RDF.type, OWL.Class),
            ...this.store.each(null, RDF.type, RDFS.Class)
        ]
            .filter(Ontology.isNamedNode)
            .forEach(node => {
                this.getOrCreateClass(node);
                this.rootClassesIDs.push(node.value);
            });

        this.store.statementsMatching(null, RDFS.label, null)
            .map(statement => statement.subject)
            .filter(Ontology.isNamedNode)
            .forEach(node => this.getOrCreateClass(node));

        const visiblePredicates = this.predicateIRIsOf(this.allPredicates);
        relations
            .filter(relation => visiblePredicates.has(relation.predicate.value))
            .forEach(relation => {
                this.getOrCreateClass(relation.subject);
                this.getOrCreateClass(relation.object);
            });
    }

    private parseAnnotations() {
        this.store.statementsMatching(null, RDFS.label, null)
            .forEach(statement => {
                const clazz = this.classes.get(statement.subject.value);
                if (clazz) {
                    clazz.label ??= statement.object.value;
                }
            });

        this.store.statementsMatching(null, RDFS.comment, null)
            .forEach(statement => {
                const clazz = this.classes.get(statement.subject.value);
                if (clazz) {
                    clazz.comment ??= statement.object.value;
                }
            });
    }

    private parseRelations(relations: OntologyRelation[]) {
        relations.forEach(relation => {
            this.classes.get(relation.subject.value)?.relations.push(relation);
            this.classes.get(relation.object.value)?.incomingRelations.push(relation);
        });
    }

    private parseRootClasses() {
        const rootIDs = new Set<string>();

        Array.from(this.classes.values())
            .filter(clazz => this.subClassesOf(clazz).length > 0)
            .filter(clazz => !clazz.relations.some(relation => relation.predicate.equals(RDFS.subClassOf)))
            .forEach(clazz => {
                rootIDs.add(clazz.id);
                this.subClassesOf(clazz).forEach(id => rootIDs.add(id));
            });

        if (rootIDs.size > 0) {
            this.rootClassesIDs = [...rootIDs];
        }
    }

    private subClassesOf(clazz: OntologyClass): string[] {
        return clazz.incomingRelations
            .filter(relation => relation.predicate.equals(RDFS.subClassOf))
            .map(relation => relation.subject.value);
    }

    private getOrCreateClass(node: NamedNode): OntologyClass {
        let clazz = this.classes.get(node.value);
        if (!clazz) {
            clazz = new OntologyClass(node);
            this.classes.set(node.value, clazz);
        }
        return clazz;
    }

    public predicateName(relation: OntologyRelation): string {
        return this.predicateNames.get(relation.predicate.value) ?? OntologyParser.shorten(relation.predicate.value);
    }

    public predicateIRIsOf(predicates: string[]): Set<string> {
        const iris = new Set<string>();
        predicates.forEach(predicate => this.predicateIRIs.get(predicate)?.forEach(iri => iris.add(iri)));
        return iris;
    }

    public simpleSearchOntology(query: string): OntologyClass[] {
        if(!query) {
            return [];
        }

        return Array.from(this.classes.values())
            .filter(c => c.label?.toLowerCase().includes(query) || OntologyParser.shorten(c.id).toLowerCase().includes(query));
    }

    private static isRelation(statement: Statement): statement is OntologyRelation {
        return statement.subject.termType === "NamedNode"
            && statement.object.termType === "NamedNode"
            && !(statement.predicate.equals(RDF.type) &&
                (statement.object.equals(OWL.Class) ||
                    statement.object.equals(RDFS.Class)));
    }

    private static isNamedNode(node: Node): node is NamedNode {
        return node.termType === "NamedNode";
    }
}
