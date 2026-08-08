import {useCallback, useEffect, useRef, useState} from "react";
import {useDropdownDismiss} from "../../hooks/useDropdownDismiss.ts";
import "./css/Selector.css";

type Props = {
    label: string,
    headerText: string,
    content: Content[],
    onClickEvent: (content: Content) => void,
    searchable?: boolean,
    multiSelect?: boolean,
    multiSelected?: string[],
    toggleAll?: (select: boolean) => void,
}

type Content = {
    value: string,
    label: string,
    toolTip: string,
}

export default function Selector({
                                     label,
                                     headerText,
                                     content,
                                     onClickEvent,
                                     searchable,
                                     multiSelect,
                                     multiSelected,
                                     toggleAll
                                 }: Props) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const visibleContent = searchable ? content.filter(c => c.label.toLowerCase().includes(searchTerm.toLowerCase())) : content;

    const allSelected = multiSelect && content.length > 0
        && content.every(c => multiSelected?.includes(c.value) ?? false);

    const close = useCallback(() => setOpen(false), []);
    useDropdownDismiss(dropdownRef, close);

    useEffect(() => {
        if (open) {
            searchRef.current?.focus();
        }
    }, [open]);

    const handleClick = (c: Content) => {
        onClickEvent(c);
        if (!multiSelect) {
            setOpen(false);
        }
    }

    return (
        <div className="selector" ref={dropdownRef}>

            <button
                type="button"
                className="selector-button"
                aria-expanded={open}
                onClick={() => setOpen(prev => !prev)}
            >
                <span>
                    {label}
                </span>

                <span className={`selector-arrow ${open ? "open" : ""}`}>
                    ▾
                </span>
            </button>

            {open && (
                <div className="selector-dropdown">

                    {(headerText || searchable || multiSelect) &&
                        <div className="selector-header">
                            {searchable &&
                                <input ref={searchRef} className="selector-search" type="text" value={searchTerm}
                                       placeholder="Search..." onChange={e => setSearchTerm(e.target.value)}/>
                            }
                            {headerText &&
                                <span className="selector-header-text">{headerText}</span>
                            }
                            {multiSelect && toggleAll &&
                                <label className="selector-option">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={() => toggleAll?.(!allSelected)}
                                    />
                                    <span>Select All</span>
                                </label>
                            }
                        </div>
                    }

                    <div className="selector-list">
                        {multiSelect ?
                            visibleContent
                                .map(c => (
                                    <label
                                        key={c.value}
                                        className="selector-option"
                                        title={c.toolTip}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={multiSelected?.includes(c.value) ?? false}
                                            onChange={() => handleClick(c)}
                                        />

                                        <span>{c.label}</span>
                                    </label>
                                ))
                            :
                            visibleContent
                                .map(c => (
                                    <button
                                        type="button"
                                        key={c.value}
                                        className="selector-option"
                                        onClick={() => handleClick(c)}
                                        title={c.toolTip}
                                    >
                                        <span>{c.label}</span>
                                    </button>
                                ))}
                    </div>

                    {multiSelect &&
                        <div className="selector-footer">Selected {multiSelected?.length ?? 0} out
                            of {content.length}
                        </div>
                    }
                </div>
            )}

        </div>
    );
}