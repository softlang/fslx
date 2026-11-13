import {RDF, RDF_NAMESPACE} from "./vocabulary/rdf.ts";
import {OWL, OWL_NAMESPACE} from "./vocabulary/owl.ts";
import {RDFS, RDFS_NAMESPACE} from "./vocabulary/rdfs.ts";
import {TBOX_NAMESPACE} from "./vocabulary/tbox.ts";
import type {NamedNode, Statement, Store} from "rdflib";
import {OntologyClass} from "./types/OntologyClass.ts";
import type {OntologyRelation} from "./types/OntologyRelation.ts";
import {OntologyParser} from "./OntologyParser.ts";

export class Ontology {

    public readonly store: Store;
    public readonly classes: Map<string, OntologyClass> = new Map();
    public rootClassesIDs: string[] = [];
    public categoryIDs: string[] = [];
    public allPredicates: string[] = [];
    private readonly predicateIRIs: Map<string, string> = new Map();
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
        this.parseCategories();
    }

    private parsePredicates(relations: OntologyRelation[]) {
        const predicates = new Set(["rdf:type", "rdfs:subClassOf", "tbox:elementOf"]);

        relations.forEach(relation => {
            const predicate = this.qualifiedName(relation.predicate.value);
            this.predicateIRIs.set(predicate, relation.predicate.value);
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

    private parseCategories() {
        const declaredClasses = [
            ...this.store.each(null, RDF.type, OWL.Class),
            ...this.store.each(null, RDF.type, RDFS.Class)
        ];
        const typeObjects = this.store.statementsMatching(null, RDF.type, null)
            .map(statement => statement.object)
            .filter(node => !Ontology.isVocabulary(node.value));
        const subClassNodes = this.store.statementsMatching(null, RDFS.subClassOf, null)
            .flatMap(statement => [statement.subject, statement.object]);

        const categoryIDs = new Set([...declaredClasses, ...typeObjects, ...subClassNodes]
            .filter(Ontology.isNamedNode)
            .map(node => node.value));

        this.categoryIDs = [...categoryIDs].filter(id => this.classes.has(id));
    }

    public individualsOf(category: OntologyClass): OntologyClass[] {
        const categoryIDs = new Set([category.id]);
        const queue = [category.id];

        while (queue.length > 0) {
            const current = this.classes.get(queue.shift()!);
            if (!current) continue;

            this.subClassesOf(current)
                .filter(id => !categoryIDs.has(id))
                .forEach(id => {
                    categoryIDs.add(id);
                    queue.push(id);
                });
        }

        const individuals = new Set<OntologyClass>();
        categoryIDs.forEach(id => this.classes.get(id)?.incomingRelations
            .filter(relation => relation.predicate.equals(RDF.type))
            .forEach(relation => {
                const individual = this.classes.get(relation.subject.value);
                if (individual) {
                    individuals.add(individual);
                }
            }));

        return [...individuals];
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
        return this.predicateNames.get(relation.predicate.value) ?? this.qualifiedName(relation.predicate.value);
    }

    public qualifiedName(iri: string): string {
        const namespace = Object.entries(this.store.namespaces)
            .find(([, uri]) => iri.startsWith(uri));

        return namespace ? namespace[0] + ":" + iri.substring(namespace[1].length) : iri;
    }

    public expandedName(name: string): string {
        const separator = name.indexOf(":");
        const namespace = separator > 0 ? this.store.namespaces[name.substring(0, separator)] : undefined;

        return namespace ? namespace + name.substring(separator + 1) : name;
    }

    public literalsOf(clazz: OntologyClass): Statement[] {
        return this.store.statementsMatching(clazz.node, null, null)
            .filter(statement => statement.object.termType === "Literal");
    }

    public predicateIRIsOf(predicates: string[]): Set<string> {
        return new Set(predicates
            .map(predicate => this.predicateIRIs.get(predicate))
            .filter(iri => iri !== undefined));
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

    private static isVocabulary(iri: string): boolean {
        return [OWL_NAMESPACE, RDF_NAMESPACE, RDFS_NAMESPACE].some(namespace => iri.startsWith(namespace));
    }

    private static isNamedNode(node: {termType: string}): node is NamedNode {
        return node.termType === "NamedNode";
    }
}
