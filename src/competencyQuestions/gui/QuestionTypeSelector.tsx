import Selector from "./Selector.tsx";
import {CQ_DEFINITIONS, type CQDefinition} from "../model/CQDefinitions.ts";

type Props = {
    selectedDefinition: CQDefinition | null,
    setSelectedDefinition: (definition: CQDefinition | null) => void,
}

export default function QuestionTypeSelector({selectedDefinition, setSelectedDefinition}: Props) {

    const handleClickEvent = (label: string) => {
        const definition = CQ_DEFINITIONS.find(d => d.label === label);
        if(definition) {
            setSelectedDefinition(definition);
        }
    }

    return (

        <Selector
            label={selectedDefinition?.label ?? "Choose Query"}
            headerText="Choose a Query to explore the Ontology."
            content={CQ_DEFINITIONS.map(
                definition => ({
                    value: definition.label,
                    label: definition.label,
                    toolTip: `Example: ${definition.example}`
                })
            )}
            onClickEvent={content => handleClickEvent(content.value)}
        />
        )
}