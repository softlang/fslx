import {parse, type Store, sym} from "rdflib";
import {OntologyModule} from "./OntologyModule.ts";
import {OWL} from "./vocabulary/owl.ts";

export class OntologyParser {

    static async parse(file: File, store: Store): Promise<OntologyModule> {
        const ttl = await file.text();
        const doc = sym("file:///" + file.name);

        parse(ttl, store, doc.value, "text/turtle");

        const imports = store.match(null, OWL.imports, null, doc)
            .map(statement => OntologyParser.shorten(statement.object.value));

        return new OntologyModule(file, doc, imports);
    }

    public static shorten(uri: string): string {

        const hash = uri.lastIndexOf("#");
        if (hash >= 0)
            return uri.substring(hash + 1);

        const slash = uri.lastIndexOf("/");
        if (slash >= 0)
            return uri.substring(slash + 1);

        return uri;
    }

}
