import './App.css'
import {useCallback, useState} from "react";
import {OntologyLoader} from "./ontology/OntologyLoader.ts";
import CytoscapeGraph, {type BreadcrumbItem} from "./components/CytoscapeGraph.tsx";
import PredicatesPicker from "./components/PredicatesPicker.tsx";
import OntologySearch from "./components/OntologySearch.tsx";
import type {OntologyClass} from "./ontology/types/OntologyClass.ts";
import CompetencyQuestions from './competencyQuestions/gui/CompetencyQuestions.tsx';
import type {CQResult} from "./competencyQuestions/model/CQResult.ts";

function App() {
    const [ontology] = useState(() => new OntologyLoader().load());
    const [visiblePredicates, setVisiblePredicates] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<OntologyClass[] | null>(null);
    const [cqResult, setCQResult] = useState<CQResult | null>(null);
    const [breadCrumb, setBreadCrumb] = useState<BreadcrumbItem[]>([]);

    const showSearchResults = useCallback((results: OntologyClass[] | null, term: string) => {
        setSearchResults(results);
        setCQResult(null);

        if (!results) {
            return;
        }

        const item: BreadcrumbItem = {label: "Search: " + term, view: {kind: "search", results}};
        setBreadCrumb(prev => prev.at(-1)?.view.kind === "search"
            ? [...prev.slice(0, -1), item]
            : [...prev, item]);
    }, []);

    return (
        <>
            {!ontology &&
                <div className="ontology-missing">
                    <h2>No ontology found</h2>
                    {import.meta.env.DEV
                        ? <p>Run <code>git submodule update --init</code> and restart the dev server.</p>
                        : <p>The ontology could not be loaded. Please try again later.</p>
                    }
                </div>
            }
            {ontology &&
                <div className="content-container">
                    <div className="top-bar-container">
                        <PredicatesPicker setPredicates={setVisiblePredicates} allPredicates={ontology.allPredicates}/>
                        <CompetencyQuestions ontology={ontology} setCQResult={setCQResult}
                                             setBreadCrumb={setBreadCrumb}/>
                        <OntologySearch ontology={ontology} setSearchResults={showSearchResults}/>
                    </div>
                    <CytoscapeGraph
                        ontology={ontology}
                        visibleRelations={visiblePredicates}
                        searchResults={searchResults}
                        setSearchResults={setSearchResults}
                        cqResult={cqResult}
                        setCQResult={setCQResult}
                        breadCrumb={breadCrumb}
                        setBreadCrumb={setBreadCrumb}
                    />
                </div>
            }
        </>
    )
}

export default App
