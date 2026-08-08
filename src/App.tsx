import './App.css'
import {useCallback, useState} from "react";
import type {Ontology} from "./ontology/Ontology.ts";
import UploadArea from "./components/UploadArea.tsx";
import CytoscapeGraph from "./components/CytoscapeGraph.tsx";
import PredicatesPicker from "./components/PredicatesPicker.tsx";
import OntologySearch from "./components/OntologySearch.tsx";
import type {OntologyClass} from "./ontology/types/OntologyClass.ts";
import CompetencyQuestions from './competencyQuestions/gui/CompetencyQuestions.tsx';
import type {CQResult} from "./competencyQuestions/model/CQResult.ts";

function App() {
    const [ontology, setOntology] = useState<Ontology>();
    const [visiblePredicates, setVisiblePredicates] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<OntologyClass[] | null>(null);
    const [cqResult, setCQResult] = useState<CQResult | null>(null);

    const showSearchResults = useCallback((results: OntologyClass[] | null) => {
        setSearchResults(results);
        setCQResult(null);
    }, []);

    return (
        <>
            {!ontology &&
                // TODO: automatic Git "Download" from /fsl - check possible implementations (clone/pull/download/..)
                <UploadArea setOntology={setOntology}/>
            }
            {ontology &&
                <div className="content-container">
                    <div className="top-bar-container">
                        <PredicatesPicker setPredicates={setVisiblePredicates} allPredicates={ontology.allPredicates}/>
                        <CompetencyQuestions ontology={ontology} setCQResult={setCQResult}/>
                        <OntologySearch ontology={ontology} setSearchResults={showSearchResults}/>
                    </div>
                    <CytoscapeGraph
                        ontology={ontology}
                        visibleRelations={visiblePredicates}
                        searchResults={searchResults}
                        setSearchResults={showSearchResults}
                        cqResult={cqResult}
                        setCQResult={setCQResult}
                    />
                </div>
            }
        </>
    )
}

export default App
