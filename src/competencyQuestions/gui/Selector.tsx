import {type CSSProperties, useCallback, useEffect, useRef, useState} from "react";
import {useDropdownDismiss} from "../../hooks/useDropdownDismiss.ts";
import "./css/Selector.css";

type Props = {
    label: string,
    headerText: string,
    content: Content[],
    onClickEvent: (content: Content) => void,
    searchable?: boolean,
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
                                     searchable
                                 }: Props) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownPosition, setDropdownPosition] = useState<CSSProperties>({});
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const visibleContent = searchable ? content.filter(c => c.label.toLowerCase().includes(searchTerm.toLowerCase())) : content;

    const close = useCallback(() => setOpen(false), []);
    useDropdownDismiss(dropdownRef, close);

    useEffect(() => {
        if (open) {
            searchRef.current?.focus();
        }
    }, [open]);

    const toggleOpen = () => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!open && rect) {
            setDropdownPosition({
                top: rect.bottom + 6,
                left: rect.left,
                width: rect.width,
                maxHeight: window.innerHeight - rect.bottom - 18
            });
        }
        setOpen(prev => !prev);
    }

    const handleClick = (c: Content) => {
        onClickEvent(c);
        setOpen(false);
    }

    return (
        <div className="selector" ref={dropdownRef}>

            <button
                ref={buttonRef}
                type="button"
                className="selector-button"
                aria-expanded={open}
                onClick={toggleOpen}
            >
                <span>
                    {label}
                </span>

                <span className={`selector-arrow ${open ? "open" : ""}`}>
                    ▾
                </span>
            </button>

            {open && (
                <div className="selector-dropdown" style={dropdownPosition}>

                    {(headerText || searchable) &&
                        <div className="selector-header">
                            {searchable &&
                                <input ref={searchRef} className="selector-search" type="text" value={searchTerm}
                                       placeholder="Search..." onChange={e => setSearchTerm(e.target.value)}/>
                            }
                            {headerText &&
                                <span className="selector-header-text">{headerText}</span>
                            }
                        </div>
                    }

                    <div className="selector-list">
                        {visibleContent
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
                </div>
            )}

        </div>
    );
}