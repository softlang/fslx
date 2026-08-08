import type {ChangeEvent} from "react";
import type {Ontology} from "../ontology/Ontology.ts";
import type {OntologyClass} from "../ontology/types/OntologyClass.ts";
import "./css/OntologySearch.css"

type Props = {
    ontology: Ontology,
    setSearchResults: (results: OntologyClass[] | null) => void,
}

export default function OntologySearch({ontology, setSearchResults}: Props) {

    const searchTermChanged = (event: ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        const lowerCaseTerm = term.trim().toLowerCase();
        if(lowerCaseTerm.length > 0) {
            const result = ontology.simpleSearchOntology(lowerCaseTerm);
            setSearchResults(result);
        } else {
            setSearchResults(null);
        }
    }

    return (
        <div className="search-container">
            <input className="ontology-search" type="text" placeholder="Search..." onChange={searchTermChanged}/>
        </div>
    );
}
