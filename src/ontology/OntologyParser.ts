import {parse, type Store} from "rdflib";

export class OntologyParser {

    static parse(name: string, ttl: string, store: Store) {
        parse(ttl, store, "file:///" + name, "text/turtle");
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
