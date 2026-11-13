import {useMemo} from "react";
import type {Literal} from "rdflib";
import type {Ontology} from "../ontology/Ontology.ts";
import type {OntologyClass} from "../ontology/types/OntologyClass.ts";
import {OntologyParser} from "../ontology/OntologyParser.ts";
import {RDFS} from "../ontology/vocabulary/rdfs.ts";
import "./css/ResourceDetails.css";

type Props = {
    ontology: Ontology,
    clazz: OntologyClass | null,
    visibleRelations: string[],
}

const linkPredicates = ["foaf:page", "foaf:isPrimaryTopicOf"];

export default function ResourceDetails({ontology, clazz, visibleRelations}: Props) {

    const details = useMemo(() => {
        if (!clazz) {
            return null;
        }

        const objectsOf = (predicate: string) => clazz.relations
            .filter(relation => ontology.predicateName(relation) === predicate)
            .map(relation => ontology.classes.get(relation.object.value)?.name ?? ontology.qualifiedName(relation.object.value));
        const visiblePredicates = ontology.predicateIRIsOf(visibleRelations);

        return {
            types: objectsOf("rdf:type"),
            superClasses: objectsOf("rdfs:subClassOf"),
            links: [...new Set(clazz.relations
                .filter(relation => linkPredicates.includes(ontology.predicateName(relation)))
                .map(relation => relation.object.value))],
            outgoing: clazz.relations.filter(relation => visiblePredicates.has(relation.predicate.value)).length,
            incoming: clazz.incomingRelations.filter(relation => visiblePredicates.has(relation.predicate.value)).length,
            literals: ontology.literalsOf(clazz)
                .filter(statement => !statement.predicate.equals(RDFS.label) && !statement.predicate.equals(RDFS.comment)),
        };
    }, [clazz, ontology, visibleRelations]);

    if (!clazz || !details) {
        return (
            <aside className="details-panel">
                <h2>Resource details</h2>
                <p className="details-muted">Select a node to see its properties.</p>
            </aside>
        );
    }

    return (
        <aside className="details-panel">
            <span className="details-kicker">Current resource</span>
            <h2 className="details-title">{clazz.name}</h2>

            {clazz.comment &&
                <p className="details-comment">{clazz.comment}</p>
            }

            <h3>IRI</h3>
            <div className="details-iri" title={clazz.id}>{ontology.qualifiedName(clazz.id)}</div>

            <h3>Types</h3>
            {details.types.length > 0
                ? <div className="details-pills">
                    {details.types.map(type => <span key={type} className="details-pill">{type}</span>)}
                </div>
                : <p className="details-muted">No asserted type</p>
            }

            {details.superClasses.length > 0 &&
                <>
                    <h3>Superclasses</h3>
                    <div className="details-pills">
                        {details.superClasses.map(superClass =>
                            <span key={superClass} className="details-pill">{superClass}</span>)}
                    </div>
                </>
            }

            <h3>Connections</h3>
            <div className="details-counts">
                <div><strong>{details.incoming}</strong><small>Incoming</small></div>
                <div><strong>{details.outgoing}</strong><small>Outgoing</small></div>
            </div>

            {details.links.length > 0 &&
                <>
                    <h3>Links</h3>
                    <ul className="details-links">
                        {details.links.map(link =>
                            <li key={link}>
                                <a href={link} target="_blank" rel="noreferrer" title={link}>
                                    {OntologyParser.shorten(link)}
                                </a>
                            </li>
                        )}
                    </ul>
                </>
            }

            {details.literals.length > 0 &&
                <>
                    <h3>Properties</h3>
                    <dl className="details-literals">
                        {details.literals.map((statement, index) =>
                            <div key={index}>
                                <dt>{ontology.qualifiedName(statement.predicate.value)}</dt>
                                <dd>
                                    {statement.object.value}
                                    {(statement.object as Literal).language &&
                                        <small> @{(statement.object as Literal).language}</small>
                                    }
                                </dd>
                            </div>
                        )}
                    </dl>
                </>
            }
        </aside>
    );
}
