import { state } from "@/state";

export function Dashboard(root: HTMLElement): void {
    var userId = state.get().userId;
    root.innerText = `Current User id: ${userId}`; 
}
