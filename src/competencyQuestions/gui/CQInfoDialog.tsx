import {useRef} from "react";
import {useDropdownDismiss} from "../../hooks/useDropdownDismiss.ts";
import type {CQDefinition} from "../model/CQDefinitions.ts";
import "./css/CQInfoDialog.css";

type Props = {
    definition: CQDefinition,
    onClose: () => void,
}

export default function CQInfoDialog({definition, onClose}: Props) {
    const dialogRef = useRef<HTMLDivElement>(null);
    useDropdownDismiss(dialogRef, onClose);

    return (
        <div className="cq-info-overlay">
            <div className="cq-info-dialog" ref={dialogRef} role="dialog" aria-label={definition.label}>
                <div className="cq-info-header">
                    <h2>{definition.label}</h2>
                    <button type="button" className="cq-info-close" onClick={onClose} aria-label="Close">×</button>
                </div>

                <p className="cq-info-question">
                    {definition.question.split(/(\{\w+})/).map((part, index) =>
                        part.startsWith("{")
                            ? <span key={index} className="cq-info-parameter">{part.slice(1, -1)}</span>
                            : part
                    )}
                </p>
                <p className="cq-info-text">{definition.info}</p>

                <h3>Parameters</h3>
                <dl className="cq-info-parameters">
                    {definition.fields.map(field =>
                        <div key={field.name}>
                            <dt><span className="cq-info-parameter">{field.name}</span> {field.label}</dt>
                        </div>
                    )}
                </dl>
            </div>
        </div>
    );
}
