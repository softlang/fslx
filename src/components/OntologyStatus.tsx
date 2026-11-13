import {useMemo} from "react";
import type {Ontology} from "../ontology/Ontology.ts";
import "./css/OntologyStatus.css";

type Props = {
    ontology: Ontology | undefined,
}

export default function OntologyStatus({ontology}: Props) {

    const individualCount = useMemo(() => {
        if (!ontology) {
            return 0;
        }

        const individuals = new Set<string>();
        ontology.categoryIDs
            .map(id => ontology.classes.get(id))
            .forEach(category => category && ontology.individualsOf(category)
                .forEach(individual => individuals.add(individual.id)));
        return individuals.size;
    }, [ontology]);

    if (!ontology) {
        return (
            <div className="ontology-status">
                <span className="status-dot missing"/>
                <span>No ontology loaded</span>
            </div>
        );
    }

    return (
        <div className="ontology-status">
            <span className="status-dot"/>
            <span>{ontology.store.statements.length.toLocaleString("en")} RDF triples</span>
            <span className="status-separator">·</span>
            <span>{ontology.categoryIDs.length} categories</span>
            <span className="status-separator">·</span>
            <span>{individualCount} individuals</span>
        </div>
    );
}
