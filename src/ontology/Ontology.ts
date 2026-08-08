import type {OntologyModule} from "./OntologyModule.ts";
import {RDF} from "./vocabulary/rdf.ts";
import {OWL} from "./vocabulary/owl.ts";
import {RDFS} from "./vocabulary/rdfs.ts";
import {TBOX_NAMESPACE} from "./vocabulary/tbox.ts";
import {type Store} from "rdflib";
import {OntologyClass} from "./types/OntologyClass.ts";
import {OntologyParser} from "./OntologyParser.ts";

const SUB_CLASS_OF = OntologyParser.shorten(RDFS.subClassOf.value);

export class Ontology {

    public readonly store: Store;
    public readonly modules: OntologyModule[];
    public readonly classes: Map<string, OntologyClass> = new Map();
    public rootClassesIDs: string[] = [];
    public allPredicates: string[] = [];

    public constructor(store: Store, modules: OntologyModule[]) {
        this.store = store;
        this.modules = modules;
        this.parseData();
    }

    private parseData() {
        this.parseClasses();
        this.parseAnnotations();
        this.parseRelations();
        this.parseRootClasses();
    }

    private parseClasses() {
        [
            ...this.store.each(null, RDF.type, OWL.Class),
            ...this.store.each(null, RDF.type, RDFS.Class)
        ]
            .filter(node => node.termType === "NamedNode")
            .forEach(node => {
                const subject = OntologyParser.shorten(node.value);
                this.classes.set(subject, new OntologyClass(subject));
                this.rootClassesIDs.push(subject);
            });
    }

    private parseAnnotations() {
        this.store.match(null, RDFS.label, null)
            .forEach(statement => this.getOrCreateClass(OntologyParser.shorten(statement.subject.value)).label = statement.object.value);

        this.store.match(null, RDFS.comment, null)
            .forEach(statement => this.getOrCreateClass(OntologyParser.shorten(statement.subject.value)).comment = statement.object.value);
    }

    private parseRelations() {
        const predicates = new Set(["type", "subClassOf", "elementOf"]);
        this.store.match(null, null, null)
            .filter(statement => statement.object.termType === "NamedNode")
            .filter(statement => !(
                statement.predicate.equals(RDF.type) &&
                (statement.object.equals(OWL.Class) ||
                    statement.object.equals(RDFS.Class))
            ))
            .forEach(statement => {
                const predicate = OntologyParser.shorten(statement.predicate.value);
                const subject = this.getOrCreateClass(OntologyParser.shorten(statement.subject.value));
                const object = this.getOrCreateClass(OntologyParser.shorten(statement.object.value));

                subject.relations.push({predicate, targetId: object.id});
                object.incomingRelations.push({predicate, sourceId: subject.id});

                if (statement.predicate.value.startsWith(TBOX_NAMESPACE)) {
                    predicates.add(predicate);
                }
            });

        this.allPredicates = [...predicates];
    }

    private parseRootClasses() {
        const rootIDs = new Set<string>();

        Array.from(this.classes.values())
            .filter(clazz => this.subClassesOf(clazz).length > 0)
            .filter(clazz => !clazz.relations.some(relation => relation.predicate === SUB_CLASS_OF))
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
            .filter(relation => relation.predicate === SUB_CLASS_OF)
            .map(relation => relation.sourceId);
    }

    private getOrCreateClass(id: string): OntologyClass {
        let clazz = this.classes.get(id);
        if (!clazz) {
            clazz = new OntologyClass(id);
            this.classes.set(id, clazz);
        }
        return clazz;
    }

    public simpleSearchOntology(query: string): OntologyClass[] {
        if(!query) {
            return [];
        }

        return Array.from(this.classes.values())
            .filter(c => c.label?.toLowerCase().includes(query) || c.id?.toLowerCase().includes(query));
    }
}
