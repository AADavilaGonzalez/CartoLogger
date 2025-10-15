/*
    * Set up simple hash routing for SPA navigation
*/

type View = (root: HTMLElement) => void;

type RouteTable = {[key: string] : View};

const getRoute = () => "/" + location.hash.slice(1);

export function SetRoutes(
    root: HTMLElement,
    routeTable: RouteTable,
    defaultView: View
) {
    
    function route() {
        root.innerHTML = "";
        const view = routeTable[getRoute()] || defaultView;
        view(root);
    }

    window.addEventListener("hashchange", route);
    window.addEventListener("load", route)
    
}
