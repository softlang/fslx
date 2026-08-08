import {Namespace} from "rdflib";

export const TBOX_NAMESPACE = "http://www.softlang.org/ontologies/tbox#";

const NS = Namespace(TBOX_NAMESPACE);

export const TBOX = {
    elementOf: NS("elementOf"),
    isPartOf: NS("isPartOf"),
    hasArea: NS("hasArea"),
    hasSpace: NS("hasSpace"),
    uses: NS("uses"),
    extends: NS("extends"),
    serves: NS("serves"),
    supportsLanguage: NS("supportsLanguage"),
    conformsTo: NS("conformsTo"),
    isSpecifiedBy: NS("isSpecifiedBy"),
    hasToolKind: NS("hasToolKind"),
    hasArtifactKind: NS("hasArtifactKind"),
    describesArtifactKind: NS("describesArtifactKind"),
    processesArtifactKind: NS("processesArtifactKind"),
} as const;
