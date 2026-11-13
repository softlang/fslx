import type {CSSProperties} from "react";
import type {BreadcrumbItem} from "./types/BreadcrumbItem.ts";
import "./css/Breadcrumb.css";

type Props = {
    breadCrumb: BreadcrumbItem[],
    navigateToRoot: () => void,
    navigateToBreadcrumbItem: (item: BreadcrumbItem, index: number) => void,
}

const VISIBLE_BREADCRUMB_ITEMS = 8;

export default function Breadcrumb({breadCrumb, navigateToRoot, navigateToBreadcrumbItem}: Props) {
    return (
        <div className="breadcrumb"
             style={{"--breadcrumb-slots": VISIBLE_BREADCRUMB_ITEMS + 2} as CSSProperties}>
            <span className="breadcrumb-list">
                <button type="button" onClick={navigateToRoot}
                        className="breadcrumb-link">
                    Root
                </button>
            </span>
            {breadCrumb.length > VISIBLE_BREADCRUMB_ITEMS &&
                <span className="breadcrumb-list">{" > …"}</span>
            }
            {breadCrumb
                .map((item, index) => ({item, index}))
                .slice(-VISIBLE_BREADCRUMB_ITEMS)
                .map(({item, index}) => (
                    <span key={index} className="breadcrumb-list">
                        {" > "}
                        <button type="button" onClick={() => navigateToBreadcrumbItem(item, index)}
                                title={item.label}
                                className={`breadcrumb-link ${item.view.kind === "class" ? "" : "query"}`}>
                            {item.label}
                        </button>
                    </span>
                ))}
        </div>
    );
}
