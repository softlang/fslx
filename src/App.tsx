import './App.css'
import {useState} from "react";
import {OntologyLoader} from "./ontology/OntologyLoader.ts";
import CytoscapeGraph from "./components/CytoscapeGraph.tsx";
import PredicatesPicker from "./components/PredicatesPicker.tsx";
import OntologySearch from "./components/OntologySearch.tsx";
import Breadcrumb from "./components/Breadcrumb.tsx";
import ResourceDetails from "./components/ResourceDetails.tsx";
import CategoryBrowser from "./components/CategoryBrowser.tsx";
import OntologyStatus from "./components/OntologyStatus.tsx";
import CompetencyQuestions from './competencyQuestions/gui/CompetencyQuestions.tsx';
import {useGraphNavigation} from "./hooks/useGraphNavigation.ts";

function App() {
    const [ontology] = useState(() => new OntologyLoader().load());
    const [visiblePredicates, setVisiblePredicates] = useState<string[]>([]);
    const navigation = useGraphNavigation(ontology, visiblePredicates);

    return (
        <div className="content-container">
            <header className="header">
                <h1>FSL <span>eXplorer</span></h1>
                <div className="header-actions">
                    {ontology &&
                        <OntologySearch ontology={ontology} setSearchResults={navigation.showSearchResults}/>
                    }
                    <OntologyStatus ontology={ontology}/>
                </div>
            </header>
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
                <div className="workspace">
                    <aside className="side-bar">
                        <CategoryBrowser ontology={ontology} selectedClass={navigation.selectedClass}
                                         navigateToClass={navigation.navigateToClass}/>
                        <div className="side-bar-divider">or</div>
                        <section className="side-bar-section">
                            <CompetencyQuestions ontology={ontology} setCQResult={navigation.setCQResult}
                                                 setBreadCrumb={navigation.setBreadCrumb}/>
                        </section>
                    </aside>
                    <main className="main-panel">
                        <div className="graph-header">
                            <Breadcrumb breadCrumb={navigation.breadCrumb}
                                        navigateToRoot={navigation.navigateToRoot}
                                        navigateToBreadcrumbItem={navigation.navigateToBreadcrumbItem}/>
                            <PredicatesPicker setPredicates={setVisiblePredicates}
                                              allPredicates={ontology.allPredicates}/>
                        </div>
                        <CytoscapeGraph
                            ontology={ontology}
                            graphContext={navigation.graphContext}
                            onSelectClass={navigation.navigateToClass}
                        />
                    </main>
                    <ResourceDetails ontology={ontology} clazz={navigation.selectedClass}
                                     visibleRelations={visiblePredicates}/>
                </div>
            }
        </div>
    )
}

export default App
