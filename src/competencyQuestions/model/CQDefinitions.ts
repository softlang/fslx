export type CQDefinition = typeof CQ_DEFINITIONS[number];

// TODO: more
export const CQ_DEFINITIONS = [
    {
        id: "relation",
        label: "Related concepts",
        example: "Which concepts are related to Java?",
        fields: [
            {
                name: "subject",
                type: "class",
                label: "Subject",
            },
            {
                name: "predicate",
                type: "predicate",
                label: "Relation",
                optional: true
            }
        ]
    },

    {
        id: "shared",
        label: "Shared concepts",
        example: "Which concepts do Java and Python share?",
        fields: [
            {
                name: "subjectA",
                type: "class",
                label: "Subject"
            },
            {
                name: "subjectB",
                type: "class",
                label: "Subject"
            },
            {
                name: "predicate",
                type: "predicate",
                label: "Relation",
                optional: true
            }
        ]
    },

    {
        id: "distinguishing",
        label: "Distinguishing concepts",
        example: "Which concepts distinguish Java from Python?",
        fields: [
            {
                name: "subjectA",
                type: "class",
                label: "Subject"
            },
            {
                name: "subjectB",
                type: "class",
                label: "Subject"
            },
            {
                name: "predicate",
                type: "predicate",
                label: "Relation",
                optional: true
            }
        ]
    },

    {
        id: "classification",
        label: "Classification",
        example: "Is HTML a Markup Language?",
        fields: [
            {
                name: "subject",
                type: "class",
                label: "Subject"
            },
            {
                name: "class",
                type: "class",
                label: "Class",
            }
        ]
    }
];
