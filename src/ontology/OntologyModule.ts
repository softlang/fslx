import {type NamedNode} from "rdflib";

export class OntologyModule {
    public readonly file: File;
    public readonly fileName: string;
    public readonly doc: NamedNode;
    public readonly imports: string[];
    public readonly ontologyIRI: string;

    public constructor(file: File, doc: NamedNode, imports: string[]) {
        this.file = file;
        this.fileName = file.name;
        this.ontologyIRI = this.fileName.split(".")[0];
        this.doc = doc;
        this.imports = imports;
    }
}
