import {useEffect, useState} from "react";
import "./css/PredicatesPicker.css";
import PredicatesSelector from "../competencyQuestions/gui/PredicateSelector.tsx";

type Props = {
    setPredicates: (predicates: string[]) => void,
    allPredicates: string[],
};

const storageKey = "predicates";

const defaultPredicates = [
    "subClassOf",
    "elementOf",
]

const readStoredPredicates = (): string[] => {
    try {
        const storedPredicates = window.localStorage.getItem(storageKey);

        if (!storedPredicates) {
            return defaultPredicates;
        }

        const parsed: unknown = JSON.parse(storedPredicates);

        if (!Array.isArray(parsed) || parsed.some(value => typeof value !== "string")) {
            return defaultPredicates;
        }

        return parsed as string[];
    } catch {
        return defaultPredicates;
    }
}

export default function PredicatesPicker({setPredicates, allPredicates}: Props) {
    const [selectedPredicates, setSelectedPredicates] = useState<string[]>(readStoredPredicates);

    useEffect(() => {
        setPredicates(selectedPredicates);
        window.localStorage.setItem(storageKey, JSON.stringify(selectedPredicates));
    }, [selectedPredicates, setPredicates]);

    return (
        <PredicatesSelector label="Predicates" predicates={allPredicates} value={selectedPredicates} onSelect={setSelectedPredicates}/>
    );
}
