import type {Ontology} from "../../ontology/Ontology.ts";
import Selector from "./Selector.tsx";
import type {OntologyClass} from "../../ontology/types/OntologyClass.ts";

type Props = {
    label: string,
    ontology: Ontology,
    value: string | null,
    onSelect: (value: string) => void,
}

export default function ClassSelector({label, ontology, value, onSelect}: Props) {
    const classes: Map<string, OntologyClass> = ontology.classes;

    return (
        <Selector
            label={value ?? label}
            headerText=""
            content={
            Array.from(classes.values())
                .map(c => ({value: c.id, label: c.label ?? "", toolTip: c.comment ?? ""}))
                .filter(c => c.label !== "")
                .sort((a, b) => a.label.localeCompare(b.label))
        }
            onClickEvent={content => onSelect(content.value)}
            searchable={true}
        />
    );
}