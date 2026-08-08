import {OntologyLoader} from "../ontology/OntologyLoader.ts";
import * as React from "react";
import type {Ontology} from "../ontology/Ontology.ts";

type Props = {
    setOntology: (ontology: Ontology) => void,
}

export default function UploadArea({setOntology}: Props) {
    // const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        setOntology(await new OntologyLoader().load(files));
    }

    // const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    //     e.preventDefault();
    //     setIsDragging(true);
    // };
    //
    // const handleDragLeave = () => {
    //     setIsDragging(false);
    // };
    const handleFileDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        // setIsDragging(false);

        setOntology(await new OntologyLoader().load(e.dataTransfer.files));
    };
    
    return (
        <div className={"file-input-overlay"}>
            <div className={"file-input-container"}>
                <label className={`upload-area`}
                       onDrop={handleFileDrop}
                       // onDragOver={handleDragOver}
                       // onDragLeave={handleDragLeave}
                >
                    <input
                        hidden
                        type="file"
                        multiple
                        accept=".ttl"
                        onChange={handleFileUpload}
                    />

                    <h2>Load ontology</h2>
                    <p>Drop files here or click</p>
                </label>
            </div>
        </div>
    );
}