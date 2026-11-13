import {useMemo, useState} from "react";
import type {Ontology} from "../ontology/Ontology.ts";
import type {OntologyClass} from "../ontology/types/OntologyClass.ts";
import Selector from "../competencyQuestions/gui/Selector.tsx";
import "./css/CategoryBrowser.css";

type Props = {
    ontology: Ontology,
    selectedClass: OntologyClass | null,
    navigateToClass: (clazz: OntologyClass) => void,
}

const byName = (a: OntologyClass, b: OntologyClass) =>
    a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: "base"});

export default function CategoryBrowser({ontology, selectedClass, navigateToClass}: Props) {
    const [category, setCategory] = useState<OntologyClass | null>(null);

    const categories = useMemo(() => ontology.categoryIDs
            .map(id => ontology.classes.get(id))
            .filter((c): c is OntologyClass => c !== undefined)
            .map(clazz => ({clazz, count: ontology.individualsOf(clazz).length}))
            .filter(entry => entry.count > 0)
            .sort((a, b) => b.count - a.count || byName(a.clazz, b.clazz)),
        [ontology]);

    const individuals = useMemo(
        () => category ? ontology.individualsOf(category).sort(byName) : [],
        [category, ontology]);

    const selectedIndividual = individuals.find(individual => individual === selectedClass);
    const selectedCount = categories.find(entry => entry.clazz === category)?.count ?? 0;

    const selectCategory = (id: string) => {
        setCategory(ontology.classes.get(id) ?? null);
    }

    const selectIndividual = (id: string) => {
        const individual = ontology.classes.get(id);
        if (individual) {
            navigateToClass(individual);
        }
    }

    return (
        <>
            <section className="side-bar-section">
                <div className="step-heading">
                    <span className="step">01</span>
                    <div>
                        <h2>Choose a category</h2>
                        <p>{categories.length} categories with individuals</p>
                    </div>
                </div>
                <Selector
                    label={category ? `${category.name} (${selectedCount})` : "Select a category…"}
                    headerText=""
                    content={categories.map(({clazz, count}) => ({
                        value: clazz.id,
                        label: `${clazz.name} (${count})`,
                        toolTip: clazz.comment ?? ""
                    }))}
                    onClickEvent={content => selectCategory(content.value)}
                    searchable={true}
                />
            </section>
            <section className="side-bar-section">
                <div className="step-heading">
                    <span className="step">02</span>
                    <div>
                        <h2>Choose an individual</h2>
                        <p>{category
                            ? `${individuals.length} individuals of ${category.name}`
                            : "Select a category first"}</p>
                    </div>
                </div>
                {category
                    ? <Selector
                        label={selectedIndividual?.name ?? "Select an individual…"}
                        headerText=""
                        content={individuals.map(individual => ({
                            value: individual.id,
                            label: individual.name,
                            toolTip: individual.comment ?? ""
                        }))}
                        onClickEvent={content => selectIndividual(content.value)}
                        searchable={true}
                    />
                    : <p className="step-note">Individuals appear here after category selection.</p>
                }
            </section>
        </>
    );
}
