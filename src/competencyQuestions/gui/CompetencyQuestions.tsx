import {type Dispatch, type SetStateAction, useCallback, useEffect, useState} from "react";
import type {BreadcrumbItem} from "../../components/types/BreadcrumbItem.ts";
import {type CQDefinition} from "../model/CQDefinitions.ts";
import QuestionTypeSelector from "./QuestionTypeSelector.tsx";
import type {Ontology} from "../../ontology/Ontology.ts";
import ClassSelector from "./ClassSelector.tsx";
import CQInfoDialog from "./CQInfoDialog.tsx";
import "./css/CompetencyQuestions.css";
import {CQExecutor} from "../model/CQExecutor.ts";
import type {CQValues} from "../model/CQValues.ts";
import type {CQResult} from "../model/CQResult.ts";

type Props = {
    ontology: Ontology,
    setCQResult: (cqResult: CQResult | null) => void,
    setBreadCrumb: Dispatch<SetStateAction<BreadcrumbItem[]>>,
}

export default function CompetencyQuestions({ontology, setCQResult, setBreadCrumb}: Props) {
    const [selectedDefinition, setSelectedDefinition] = useState<CQDefinition | null>(null);
    const [values, setValues] = useState<CQValues>({});
    const [infoOpen, setInfoOpen] = useState(false);

    const isComplete = selectedDefinition?.fields.every(field => Boolean(values[field.name])) ?? false;

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

    const setFieldValue = (fieldName: string, value: string) => {
        setValues(prevValues => ({...prevValues, [fieldName]: value}));
    }

    const classValue = (fieldName: string): string | null => {
        const value = values[fieldName];
        return typeof value === "string" ? value : null;
    }

    const closeInfo = useCallback(() => setInfoOpen(false), []);

    const filledQuestion = selectedDefinition?.question.replace(/\{(\w+)}/g, (_, name: string) => {
        const field = selectedDefinition.fields.find(f => f.name === name);
        const value = classValue(name);
        return (value && ontology.classes.get(value)?.name) || `[${field?.label ?? name}]`;
    });

    return (
        <div className="cq-builder">

            <div className="cq-builder-header">
                <h2>Ask a competency question</h2>

                <div className="cq-builder-selection">
                    <QuestionTypeSelector selectedDefinition={selectedDefinition}
                                          setSelectedDefinition={selectDefinition}/>
                    {selectedDefinition &&
                        <button type="button" className="cq-builder-info" title="About this question"
                                onClick={() => setInfoOpen(true)}>i</button>
                    }
                </div>

            </div>

            {selectedDefinition && (
                <>
                    <p className="cq-builder-question-text">{filledQuestion}</p>
                    <div className="cq-builder-question">
                        {selectedDefinition.fields.map(field => (
                            <div key={field.name} className="cq-builder-field">
                                <ClassSelector
                                    ontology={ontology}
                                    label={field.label}
                                    value={classValue(field.name)}
                                    onSelect={(value: string) => setFieldValue(field.name, value)}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}

            {selectedDefinition && infoOpen &&
                <CQInfoDialog definition={selectedDefinition} onClose={closeInfo}/>
            }

        </div>
    );
}