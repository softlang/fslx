import {useCallback, useEffect, useMemo, useRef} from "react";
import {OntologyGraphBuilder} from "../ontology/OntologyGraphBuilder.ts";
import cytoscape from "cytoscape";
import type {Ontology} from "../ontology/Ontology.ts";
import type {OntologyClass} from "../ontology/types/OntologyClass.ts";
import "./css/CytoscapeGraph.css";

type Props = {
    ontology: Ontology,
    graphContext: GraphContext,
    onSelectClass: (clazz: OntologyClass) => void,
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

const MAX_LAYOUT_ZOOM = 2;

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
            "text-outline-color": "#5B8DEF",
            "text-outline-width": 2,

            "text-valign": "center",
            "text-halign": "center",

            "text-max-width": "100",
            "text-wrap": "wrap",
            "min-zoomed-font-size": 8,
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
            "text-outline-color": "#ef5b71",
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
            color: "#555",
            "font-size": 10,

            "text-background-color": "#F9FBFE",
            "text-background-opacity": 0.85,
            "text-background-padding": "3",
            "text-max-width": "100",
            "text-wrap": "wrap",

            "text-rotation": "autorotate",
            "min-zoomed-font-size": 8,

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

            color: "#5B8DEF",
        }
    },
];

export default function CytoscapeGraph({ontology, graphContext, onSelectClass}: Props) {

    const graphRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<cytoscape.Core | null>(null);

    const displayClasses = graphContext.originClasses;

    const dynamicLayout = useMemo(() => {
        return displayClasses.length === 1
            ? {
                name: "concentric",
                padding: 30,
                animate: "end",

                concentric: (node: cytoscape.NodeSingular) =>
                    node.id() === displayClasses[0].id ? 2 : 1,

                levelWidth: () => 1,
                minNodeSpacing: 60
            }
            : {
                name: "cose",
                spacingFactor: 1.4,
                padding: 80,
                avoidOverlap: true,
                animate: "end"
            };
    }, [displayClasses]);

    const zoomBy = useCallback((factor: number) => {
        const cy = cyRef.current;
        if (!cy) return;

        cy.zoom({
            level: cy.zoom() * factor,
            renderedPosition: {x: cy.width() / 2, y: cy.height() / 2}
        });
    }, []);

    const fitGraph = useCallback(() => {
        cyRef.current?.fit(undefined, 30);
    }, []);

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

            onSelectClass(clazz);
        };

        cy.on("tap", "node", onNodeTap);

        return () => {
            if (cy.destroyed()) return;

            cy.removeListener("tap", "node", onNodeTap);
        };
    }, [onSelectClass, ontology]);

    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        const builder = new OntologyGraphBuilder();
        const elements = builder.build(graphContext, ontology);
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
            const maxZoom = cy.maxZoom();
            cy.maxZoom(MAX_LAYOUT_ZOOM);

            const layout = cy.layout(dynamicLayout);
            layout.one("layoutstop", () => cy.maxZoom(maxZoom));
            layout.run();
        }
    }, [dynamicLayout, graphContext, ontology]);

    useEffect(() => {
        const cy = cyRef.current;
        if (!cy) return;

        cy.edges().removeClass("outgoing incoming");
        cy.nodes().removeClass("focus");

        cy.edges().forEach(edge => {
            if (displayClasses.some(c => edge.source().id() === c.id)) {
                edge.addClass("outgoing");
            } else if (displayClasses.some(c => edge.target().id() === c.id)) {
                edge.addClass("incoming");
            }
        });

        displayClasses.forEach(clazz => cy.getElementById(clazz.id).addClass("focus"));
    }, [displayClasses, graphContext]);

    return (
        <div className="cytoscape-container">
            <div className="cytoscape-panel">
                <div
                    ref={graphRef}
                    className="cytoscape-graph"
                />
                <div className="cytoscape-tools">
                    <button type="button" title="Zoom in" onClick={() => zoomBy(1.25)}>+</button>
                    <button type="button" title="Zoom out" onClick={() => zoomBy(0.8)}>−</button>
                    <button type="button" title="Fit graph" className="fit" onClick={fitGraph}>Fit</button>
                </div>
                <div className="cytoscape-hint">
                    Click a node to explore it · Drag to pan · Scroll to zoom
                </div>
            </div>
            <div className="cytoscape-legend">
                <span><i className="legend-dot focus"/> Selected resource</span>
                <span><i className="legend-line outgoing"/> Outgoing relation</span>
                <span><i className="legend-line incoming"/> Incoming relation</span>
                <span>Arrow direction follows RDF subject → object</span>
            </div>

        </div>
    );
}
