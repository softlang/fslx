import {useCallback, useMemo, useState} from "react";
import type {Ontology} from "../ontology/Ontology.ts";
import type {OntologyClass} from "../ontology/types/OntologyClass.ts";
import type {CQResult} from "../competencyQuestions/model/CQResult.ts";
import type {GraphContext} from "../components/CytoscapeGraph.tsx";
import type {GraphView} from "../components/types/GraphView.ts";
import type {BreadcrumbItem} from "../components/types/BreadcrumbItem.ts";
import {createContext} from "../assets/GraphContextBuilder.ts";

export function useGraphNavigation(ontology: Ontology | undefined, visibleRelations: string[]) {
    const [searchResults, setSearchResults] = useState<OntologyClass[] | null>(null);
    const [cqResult, setCQResult] = useState<CQResult | null>(null);
    const [focusClass, setFocusClass] = useState<OntologyClass | null>(null);
    const [breadCrumb, setBreadCrumb] = useState<BreadcrumbItem[]>([]);

    const rootClasses = useMemo(
        () => (ontology?.rootClassesIDs ?? [])
            .map(id => ontology?.classes.get(id))
            .filter((c): c is OntologyClass => c !== undefined),
        [ontology]
    );

    const currentView: GraphView = useMemo(() => {
        if (cqResult) {
            return {kind: "cq", result: cqResult};
        }
        if (searchResults !== null) {
            return {kind: "search", results: searchResults};
        }
        if (focusClass) {
            return {kind: "class", clazz: focusClass};
        }
        return {kind: "root"};
    }, [cqResult, focusClass, searchResults]);

    const graphContext: GraphContext = useMemo(() => {
        if (!ontology) {
            return {originClasses: [], relations: [], visibleRelations};
        }

        switch (currentView.kind) {
            case "cq":
                return {...currentView.result.graphContext, visibleRelations};
            case "search":
                return {originClasses: currentView.results, relations: [], visibleRelations};
            case "class":
                return createContext([currentView.clazz], ontology, visibleRelations);
            case "root":
                return createContext(rootClasses, ontology, visibleRelations);
        }
    }, [currentView, ontology, rootClasses, visibleRelations]);

    const selectedClass = currentView.kind === "class" ? currentView.clazz : null;

    const showView = useCallback((view: GraphView) => {
        setCQResult(view.kind === "cq" ? view.result : null);
        setSearchResults(view.kind === "search" ? view.results : null);
        setFocusClass(view.kind === "class" ? view.clazz : null);
    }, []);

    const navigateToRoot = useCallback(() => {
        showView({kind: "root"});
        setBreadCrumb([]);
    }, [showView]);

    const navigateToClass = useCallback((clazz: OntologyClass) => {
        showView({kind: "class", clazz});

        setBreadCrumb(prev => [...prev, {
            label: clazz.name,
            view: {kind: "class", clazz}
        }]);
    }, [showView]);

    const navigateToBreadcrumbItem = useCallback((item: BreadcrumbItem, index: number) => {
        setBreadCrumb(prev => prev.slice(0, index + 1));
        showView(item.view);
    }, [showView]);

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

    return {
        graphContext,
        selectedClass,
        breadCrumb,
        setBreadCrumb,
        setCQResult,
        showSearchResults,
        navigateToRoot,
        navigateToClass,
        navigateToBreadcrumbItem,
    };
}
