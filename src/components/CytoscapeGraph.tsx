import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {OntologyGraphBuilder} from "../ontology/OntologyGraphBuilder.ts";
import cytoscape from "cytoscape";
import type {Ontology} from "../ontology/Ontology.ts";
import type {OntologyClass} from "../ontology/types/OntologyClass.ts";
import {createContext} from "../assets/GraphContextBuilder.ts";
import "./css/CytoscapeGraph.css";
import {renderEdgeTooltip, renderNodeTooltip} from "../assets/CytoscapeGraphTooltipBuilder.ts";
import type { CQResult } from "../competencyQuestions/model/CQResult.ts";

type Props = {
    ontology: Ontology,
    visibleRelations: string[],
    searchResults: OntologyClass[] | null,
    setSearchResults: (results: OntologyClass[] | null) => void,
    cqResult: CQResult | null,
    setCQResult: (result: CQResult | null) => void,
};
export type GraphContext = {
    originClasses: OntologyClass[];
    relations: GraphRelation[];
    visibleRelations: string[];
}
export type GraphRelation = {
    source: OntologyClass;
    target: OntologyClass;
    predicate: string;
}

const GRAPH_STYLE: cytoscape.StylesheetJson = [
    {
        selector: "node",
        style: {
            width: 45,
            height: 45,

            "background-color": "#5B8DEF",
            "border-width": 2,
            "border-color": "#AFC8FF",

            label: "data(label)",
            color: "#F5F5F5",
            "font-size": 12,

            "text-valign": "center",
            "text-halign": "center",

            "text-max-width": "100",
            "text-wrap": "wrap",
        }
    },
    {
        selector: ".focus",
        style: {
            width: 50,
            height: 50,

            "background-color": "#ef5b71",
            "border-color": "#FFFFFF",

            "font-size": 14,
            "font-weight": "bold",
            "text-valign": "center",
            "text-halign": "center",
        }
    },
    {
        selector: "edge",
        style: {
            width: 2,

            "line-color": "#777",
            "target-arrow-shape": "triangle",
            "target-arrow-color": "#777",

            "curve-style": "bezier",

            label: "data(label)",
            color: "#D0D0D0",
            "font-size": 10,

            "text-background-color": "#15161C",
            "text-background-opacity": 0.85,
            "text-background-padding": "3",
            "text-max-width": "100",
            "text-wrap": "wrap",

            "text-rotation": "autorotate",

        }
    },
    {
        selector: ".outgoing",
        style: {
            width: 3,
            "line-color": "#ef5b71",
            "target-arrow-color": "#ef5b71",

            color: "#ef5b71",
        }
    },
    {
        selector: ".incoming",
        style: {
            width: 3,
            "line-color": "#5B8DEF",
            "target-arrow-color": "#5B8DEF",

            color: "#8DB3FF",
        }
    },
];

export default function CytoscapeGraph({
                                           ontology,
                                           visibleRelations,
                                           searchResults,
                                           setSearchResults,
                                           cqResult,
                                           setCQResult,
                                       }: Props) {

    const graphRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<cytoscape.Core | null>(null);
    const [focusClasses, setFocusClasses] = useState<OntologyClass[] | null>(null);
    const rootClasses = useMemo(
        () => ontology.rootClassesIDs
            .map(id => ontology.classes.get(id))
            .filter((c): c is OntologyClass => c !== undefined),
        [ontology]
    );
    const [breadCrumb, setBreadCrumb] = useState<OntologyClass[]>([]);

    const currentFocusClasses = cqResult?.focusClasses ?? (focusClasses ?? rootClasses);
    const displayClasses = searchResults ?? currentFocusClasses;

    const cqGraphContext = cqResult?.graphContext;

    const graphContext: GraphContext = useMemo(
        () =>
            (// If given, load CQ Graph
                cqGraphContext ??
                // If search is active, display results, otherwise create full context
                (searchResults !== null ?
                        {
                            originClasses: searchResults,
                            relations: [],
                            visibleRelations: visibleRelations
                        }
                        : createContext(
                            currentFocusClasses,
                            ontology,
                            visibleRelations
                        )
                )
            ),
        [cqGraphContext, currentFocusClasses, ontology, searchResults, visibleRelations]
    );

    const dynamicLayout = useMemo(() => {
        return displayClasses.length === 1
            ? {
                name: "concentric",
                padding: 0,
                animate: "end",

                concentric: (node: cytoscape.NodeSingular) =>
                    node.id() === displayClasses[0].id ? 2 : 1,

                levelWidth: () => 1,
                minNodeSpacing: 10
            }
            : {
                name: "cose",
                spacingFactor: 1.4,
                padding: 80,
                avoidOverlap: true,
                animate: "end"
            };
    }, [displayClasses]);

    const hideTooltip = useCallback(() => {
        tooltipRef.current?.classList.remove("visible");
    }, []);

    const navigateToRoot = useCallback(() => {
        hideTooltip();
        setSearchResults(null);
        setCQResult(null);
        setFocusClasses(null);
        setBreadCrumb([]);
    }, [hideTooltip, setCQResult, setSearchResults]);

    const navigateToClass = useCallback((focusClass: OntologyClass) => {
        hideTooltip();
        setSearchResults(null);
        setCQResult(null);
        setFocusClasses([focusClass]);

        setBreadCrumb(prev => {
            const existingIndex = prev.findIndex(c => c.id === focusClass.id);

            if (existingIndex !== -1) {
                return prev.slice(0, existingIndex + 1);
            }

            return [...prev, focusClass];
        });
    }, [hideTooltip, setCQResult, setSearchResults]);

    useEffect(() => {
        if (!graphRef.current) return;

        const cy = cytoscape({
            pixelRatio: "auto",
            container: graphRef.current,

            style: GRAPH_STYLE
        });

        cyRef.current = cy;

        return () => {
            cyRef.current = null;
            cy.destroy();
        };
    }, []);

    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        const onNodeTap = (event: cytoscape.EventObject) => {
            const clazz = ontology.classes.get(event.target.id());

            if (!clazz) return;

            navigateToClass(clazz);
        };
        const onNodeMouseOver = (event: cytoscape.EventObject) => {
            renderNodeTooltip(event, ontology, tooltipRef, graphRef);
        };
        const onEdgeMouseOver = (event: cytoscape.EventObject) => {
            renderEdgeTooltip(event, tooltipRef, ontology);
        };

        cy.on("tap", "node", onNodeTap);
        cy.on("mouseover", "node", onNodeMouseOver);
        cy.on("mouseover", "edge", onEdgeMouseOver);
        cy.on("mouseout", "node, edge", hideTooltip);

        return () => {
            if (cy.destroyed()) return;

            cy.removeListener("tap", "node", onNodeTap);
            cy.removeListener("mouseover", "node", onNodeMouseOver);
            cy.removeListener("mouseover", "edge", onEdgeMouseOver);
            cy.removeListener("mouseout", "node, edge", hideTooltip);
        };
    }, [hideTooltip, navigateToClass, ontology]);

    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        const builder = new OntologyGraphBuilder();
        const elements = builder.build(graphContext);
        const elementIDs = new Set(elements.map(element => String(element.data.id)));
        let structureChanged = false;

        cy.batch(() => {
            structureChanged = cy.elements()
                .filter(element => !elementIDs.has(element.id()))
                .remove()
                .length > 0;

            elements.forEach(element => {
                const existing = cy.getElementById(String(element.data.id));

                if (existing.empty()) {
                    cy.add(element);
                    structureChanged = true;
                } else if (existing.isNode()) {
                    existing.data(element.data);
                }
            });
        });

        if (structureChanged) {
            cy.layout(dynamicLayout).run();
        }
    }, [dynamicLayout, graphContext]);

    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        cy.edges().removeClass("outgoing incoming");
        cy.nodes().removeClass("focus");

        cy.edges().forEach(edge => {
            if (currentFocusClasses.some(c => edge.source().id() === c.id)) {
                edge.addClass("outgoing");
            } else if (currentFocusClasses.some(c => edge.target().id() === c.id)) {
                edge.addClass("incoming");
            }
        });

        currentFocusClasses.forEach(clazz => cy.getElementById(clazz.id).addClass("focus"));
    }, [currentFocusClasses, graphContext]);

    return (
        <div className="cytoscape-container">
            <div className="cytoscape-breadcrumb">
                <span className="cytoscape-breadcrumb-list">
                    <button type="button" onClick={navigateToRoot}
                            className="cytoscape-breadcrumb-link">
                        Root
                    </button>
                </span>
                {breadCrumb.map(c => (
                    <span key={c.id} className="cytoscape-breadcrumb-list">
                        {" > "}
                        <button type="button" onClick={() => navigateToClass(c)}
                                className="cytoscape-breadcrumb-link">
                            {c.label ?? c.id}
                        </button>
                    </span>
                ))}
            </div>
            <div
                ref={graphRef}
                className="cytoscape-graph"
            />
            <div
                ref={tooltipRef}
                className="cytoscape-tooltip"
            />

        </div>
    );
}
