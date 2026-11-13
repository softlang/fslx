export type CQDefinition = typeof CQ_DEFINITIONS[number];

// TODO: more
export const CQ_DEFINITIONS = [
    {
        id: "relation",
        label: "Related concepts",
        question: "Which concepts are related to {subject}?",
        info: "All resources that are directly connected to the resource, in either direction and by any predicate.",
        fields: [
            {
                name: "subject",
                label: "Resource"
            }
        ]
    },

    {
        id: "shared",
        label: "Shared concepts",
        question: "Which concepts do {subjectA} and {subjectB} share?",
        info: "All resources that both resources are connected to by the same predicate and in the same direction.",
        fields: [
            {
                name: "subjectA",
                label: "First resource"
            },
            {
                name: "subjectB",
                label: "Second resource"
            }
        ]
    },

    {
        id: "distinguishing",
        label: "Distinguishing concepts",
        question: "Which concepts distinguish {subjectA} from {subjectB}?",
        info: "All resources that only one of the two resources is connected to by a given predicate and direction.",
        fields: [
            {
                name: "subjectA",
                label: "First resource"
            },
            {
                name: "subjectB",
                label: "Second resource"
            }
        ]
    },

    {
        id: "classification",
        label: "Classification",
        question: "Is {subject} a {class}?",
        info: "Shows how the resource is directly connected to the category, for example by rdf:type or rdfs:subClassOf.",
        fields: [
            {
                name: "subject",
                label: "Resource"
            },
            {
                name: "class",
                label: "Category"
            }
        ]
    }
];
