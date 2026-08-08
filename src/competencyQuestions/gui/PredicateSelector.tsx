import Selector from "./Selector.tsx";

type Props = {
    label: string,
    predicates: string[],
    value: string[],
    onSelect: (value: string[]) => void,
}

// TODO: Maybe only show relevant Predicates when Class(-es) selected, meaning only Predicates included in Classes relations
export default function PredicatesSelector({label, predicates, value, onSelect}: Props) {

    const togglePredicate = (predicate: string) => {
        onSelect(value.includes(predicate)
            ? value.filter(p => p !== predicate)
            : [...value, predicate]);
    };

    const toggleAll = (select: boolean) => {
        onSelect(select ? [...predicates] : []);
    };

    function buildLabelOutOfValues() {
        return value.length < 3 ?
            value.join(", ")
            :
            label + " (" + value.length + ")";
    }

    return (
        <Selector
            label={value.length > 0 ? buildLabelOutOfValues() : label}
            headerText=""
            content={predicates.map(p => ({value: p, label: p, toolTip: ""}))}
            onClickEvent={content => togglePredicate(content.value)}
            searchable={true}
            multiSelect={true}
            multiSelected={value}
            toggleAll={toggleAll}
        />
    );
}