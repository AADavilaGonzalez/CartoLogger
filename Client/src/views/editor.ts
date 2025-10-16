import { Map } from "../components/map";

export function Editor(root: HTMLElement): void {
    const map = Map();
    root.appendChild(map);
}
