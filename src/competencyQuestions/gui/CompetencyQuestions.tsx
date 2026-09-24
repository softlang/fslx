import {type Dispatch, type SetStateAction, useEffect, useMemo, useState} from "react";
import type {BreadcrumbItem} from "../../components/CytoscapeGraph.tsx";
import {type CQDefinition} from "../model/CQDefinitions.ts";
import QuestionTypeSelector from "./QuestionTypeSelector.tsx";
import type {Ontology} from "../../ontology/Ontology.ts";
import ClassSelector from "./ClassSelector.tsx";
import "./css/CompetencyQuestions.css";
import PredicatesSelector from "./PredicateSelector.tsx";
import {CQExecutor} from "../model/CQExecutor.ts";
import type {CQValues} from "../model/CQValues.ts";
import type {CQResult} from "../model/CQResult.ts";
import type {OntologyClass} from "../../ontology/types/OntologyClass.ts";

type Props = {
    ontology: Ontology,
    setCQResult: (cqResult: CQResult | null) => void,
    setBreadCrumb: Dispatch<SetStateAction<BreadcrumbItem[]>>,
}

export default function CompetencyQuestions({ontology, setCQResult, setBreadCrumb}: Props) {
    const [selectedDefinition, setSelectedDefinition] = useState<CQDefinition | null>(null);
    const [values, setValues] = useState<CQValues>({});

    const relevantPredicates = useMemo(() => {
        const classes = Object.values(values)
            .filter(value => typeof value === "string")
            .filter(value => value.length > 0);

        if (classes.length === 0) {
            return ontology.allPredicates;
        }

        const p = new Set<string>();
        for (const c of classes) {
            const ontologyClass: OntologyClass | undefined = ontology.classes.get(c);
            if (!ontologyClass) {
                continue;
            }
            ontologyClass.relations.forEach(r => p.add(r.predicate));
            ontologyClass.incomingRelations.forEach(r => p.add(r.predicate));
        }

        return ontology.allPredicates.filter(predicate => p.has(predicate));
    }, [ontology.allPredicates, ontology.classes, values]);
    
    const isComplete = selectedDefinition?.fields.every(field => {
        if (field.optional) {
            return true;
        }

        const value = values[field.name];
        return Array.isArray(value) ? value.length > 0 : Boolean(value);
    }) ?? false;

    useEffect(() => {
        if (!isComplete) {
            setCQResult(null);
            return;
        }
        const result = new CQExecutor().executeCQ(selectedDefinition, ontology, values);
        setCQResult(result);

        if (!result || !selectedDefinition) {
            return;
        }

        const item: BreadcrumbItem = {label: selectedDefinition.label, view: {kind: "cq", result}};
        setBreadCrumb(prev => prev.at(-1)?.view.kind === "cq"
            ? [...prev.slice(0, -1), item]
            : [...prev, item]);
    }, [isComplete, ontology, selectedDefinition, setBreadCrumb, setCQResult, values])

    const selectDefinition = (definition: CQDefinition | null) => {
        setSelectedDefinition(definition);
        setValues({});
        setCQResult(null);
    }

    const setFieldValue = (fieldName: string, value: string | string[]) => {
        setValues(prevValues => ({...prevValues, [fieldName]: value}));
    }

    const classValue = (fieldName: string): string | null => {
        const value = values[fieldName];
        return typeof value === "string" ? value : null;
    }

    const predicateValues = (fieldName: string): string[] => {
        const value = values[fieldName];
        return Array.isArray(value) ? value : [];
    }

    return (
        <div className="cq-builder">

            <div className="cq-builder-header">
                <h2>Query Ontology</h2>

                <QuestionTypeSelector selectedDefinition={selectedDefinition}
                                      setSelectedDefinition={selectDefinition}/>

            </div>

            {selectedDefinition && (
                <div className="cq-builder-question">
                    {selectedDefinition.fields.map(field => (
                        <div key={field.name} className="cq-builder-field">

                            {field.type === "class" ?

                                <ClassSelector
                                    ontology={ontology}
                                    label={field.label}
                                    value={classValue(field.name)}
                                    onSelect={(value: string) => setFieldValue(field.name, value)}
                                />
                                :
                                <PredicatesSelector
                                    predicates={relevantPredicates}
                                    label={field.label}
                                    value={predicateValues(field.name)}
                                    onSelect={(value: string[]) => setFieldValue(field.name, value)}
                                />
                            }
                        </div>
                    ))}
                </div>
            )}


        </div>
    );
}