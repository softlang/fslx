import cytoscape from "cytoscape";
import type {Ontology} from "../ontology/Ontology.ts";
import * as React from "react";

// TODO: classes without a label render as "undefined" here
export function renderNodeTooltip(event: cytoscape.EventObject, ontology: Ontology, tooltipRef: React.RefObject<HTMLDivElement | null>, graphRef: React.RefObject<HTMLDivElement | null>) {
    const node = event.target;
    const hoveredId = node.id();
    const clazz = ontology.classes.get(hoveredId);

    if (!clazz || !tooltipRef || !tooltipRef.current || !graphRef || !graphRef.current) {
        return;
    }

    const tooltip = tooltipRef.current;

    const outgoing = clazz.relations.length;
    const incoming = clazz.incomingRelations.length;

    tooltip.innerHTML = `
                <div class="tooltip-title">
                    ${clazz.label}
                </div>
        
                ${clazz.comment ? `
                    <div class="tooltip-comment">
                        ${clazz.comment}
                    </div>
                ` : ""}
        
                <div class="tooltip-section">
        
                    <div>
                        <span class="tooltip-label">Outgoing</span>
                        <span>${outgoing}</span>
                    </div>
        
                    <div>
                        <span class="tooltip-label">Incoming</span>
                        <span>${incoming}</span>
                    </div>
                </div>
            `;

    const position = event.renderedPosition;

    tooltip.style.left = `${position.x + 15}px`;
    tooltip.style.top = `${position.y + 15}px`;
    tooltip.classList.add("visible");
}

export function renderEdgeTooltip(event: cytoscape.EventObject, tooltipRef: React.RefObject<HTMLDivElement | null>, ontology: Ontology) {
    const edge = event.target;

    if (!tooltipRef ||!tooltipRef.current) {
        return;
    }

    const sourceId = edge.source().id();
    const targetId = edge.target().id();

    const source = ontology.classes.get(sourceId);
    const target = ontology.classes.get(targetId);

    if (!source || !target) {
        return;
    }

    const predicate = edge.data("label");

    tooltipRef.current.innerHTML = `
                <div class="tooltip-title">
                    ${predicate}
                </div>
        
                <div class="tooltip-relation">
                    <div>
                        <span class="tooltip-label">From</span>
                        ${source.label}
                    </div>
        
                    <div class="tooltip-arrow">
                        →
                    </div>
        
                    <div>
                        <span class="tooltip-label">To</span>
                        ${target.label}
                    </div>
                </div>
            `;

    const position = event.renderedPosition;

    tooltipRef.current.style.left = `${position.x + 15}px`;
    tooltipRef.current.style.top = `${position.y + 15}px`;

    tooltipRef.current.classList.add("visible");
}