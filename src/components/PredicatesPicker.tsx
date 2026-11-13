import {useEffect, useState} from "react";
import "./css/PredicatesPicker.css";

type Props = {
    setPredicates: (predicates: string[]) => void,
    allPredicates: string[],
};

const typePredicate = "rdf:type";

export default function PredicatesPicker({setPredicates, allPredicates}: Props) {
    const [showType, setShowType] = useState(false);

    useEffect(() => {
        setPredicates(showType
            ? allPredicates
            : allPredicates.filter(predicate => predicate !== typePredicate));
    }, [allPredicates, setPredicates, showType]);

    return (
        <label className="predicates-picker">
            <input type="checkbox" checked={showType} onChange={event => setShowType(event.target.checked)}/>
            <span>Show rdf:type</span>
        </label>
    );
}
