import L, { type LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./geojson-map.css";

import type { MapMode, ActionMappings, ActionId } from "./mappings";
import { EditPath } from "./edit-path";
import { KeybindsToActionMappings } from "./mappings";
import { type FeatureDto } from "@/api";

type GeoJSONConvertibleLayer = L.Polygon | L.Polyline | L.Marker;

type CommitMode = "polygon" | "polyline" | "marker";
type Commiter = (ep: EditPath) => GeoJSONConvertibleLayer;
const commiters: Record<CommitMode, Commiter> = {
    polygon: (ep) => ep.toPolygon(),
    polyline: (ep) => ep.toPolyline(),
    marker: (ep) => ep.toMarker(),
};

type Action = (m: HTMLGeoJSONMapElement) => void;

const keyboardHandlers: Record<ActionId, Action> = {
    deleteFeature: (m) => m.deleteFeature(),
    commitToMarker: (m) => {
        m.commitMode = "marker";
        m.updateModeIndicator("M");
    },
    commitToPolyline: (m) => {
        m.commitMode = "polyline";
        m.updateModeIndicator("L");
    },
    commitToPolygon: (m) => {
        m.commitMode = "polygon";
        m.updateModeIndicator("P");
    },
    undoPreviousEdit: (m) => m.undoPreviousEdit(),
    undoAllEdits: (m) => m.undoAllEdits(),
    commitFeature: (m) => {
        m.updateStatus("saving");
        m.commitFeature();
        setTimeout(() => m.updateStatus("saved"), 800);
    },
    switchToSelectMode: (m) => {
        m.mapMode = "select";
        m.updateModeIndicator("S");
    },
    switchToEditMode: (m) => {
        m.mapMode = "edit";
        m.updateModeIndicator("E");
    },
};

type SelectionHandler = (newSelection: GeoJSONConvertibleLayer | null) => void;
type SelectionChangeHandler = (
    oldSelection: GeoJSONConvertibleLayer | null,
    newSelection: GeoJSONConvertibleLayer | null,
) => void;

export class HTMLGeoJSONMapElement extends HTMLElement {
    private map: L.Map;
    private features: L.GeoJSON;
    private editPath: EditPath;
    private actionMappings: ActionMappings;
    private _selectedFeature: GeoJSONConvertibleLayer | null;

    public get selectedFeature() {
        return this._selectedFeature;
    }
    private set selectedFeature(feature: GeoJSONConvertibleLayer | null) {
        if (this.onSelection) this.onSelection(feature);
        if (this.onSelectionChange && this._selectedFeature !== feature) {
            this.onSelectionChange(this._selectedFeature, feature);
        }
        this._selectedFeature = feature;
    }

    public onSelection?: SelectionHandler;
    public onSelectionChange?: SelectionChangeHandler;

    public mapMode: MapMode;
    public commitMode: CommitMode;
    private statusIndicator: HTMLElement;

    constructor() {
        super();

        this.map = L.map(this).setView([25.725194867753334, -100.31513482332231], 10);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(this.map);

        this.features = L.geoJson().addTo(this.map);
        this.editPath = new EditPath(this.map, { color: "red" });
        this.actionMappings = KeybindsToActionMappings({});
        this._selectedFeature = null;

        this.mapMode = "select";
        this.commitMode = "polyline";

        const statusIndicator = document.createElement("div");
        statusIndicator.className = "status-indicator";
        statusIndicator.innerHTML = `
            <span class="dot saved"></span>
            <span class="text">Guardado</span>
            <span class="mode">S</span>
        `;
        this.appendChild(statusIndicator);
        this.statusIndicator = statusIndicator;

        const helpText = document.createElement("div");
        helpText.className = "map-help-text";
        helpText.innerHTML = `
            <span>S</span> Seleccionar <br>
            <span>E</span> Editar <br>
            <span>P</span> Polígono <br>
            <span>L</span> Polilínea <br>
            <span>M</span> Marcador <br>
            <span>Supr</span> Eliminar figura actual <br>
            <span>Enter</span> Guardar figura
            <br><strong>Guardado:</strong> Automático.
        `;
        this.appendChild(helpText);

        this.addEventListener("keydown", (e) => this.keyboardHandler(e));
        this.map.on("click", (e) => this.onMapClick(e));
        this.features.on("click", (e) => this.onFeatureClick(e));
    }

    connectedCallback() {
        this.map.invalidateSize();
    }

    loadFeatures(features: FeatureDto[]) {
        for (const feature of features as any[]) {
            feature.geojson.properties.id = feature.id;
            this.features.addData(feature);
        }
    }

    deleteFeature() {
        if (!this.selectedFeature) return;
        this.features.removeLayer(this.selectedFeature);
        this.selectedFeature = null;
    }

    undoPreviousEdit() {
        this.editPath.pop();
    }

    undoAllEdits() {
        this.editPath.clear();
    }

    commitFeature() {
        if (this.editPath.isEmpty()) return;
        const commiter = commiters[this.commitMode];
        const layer = commiter(this.editPath);
        this.features.addData(layer.toGeoJSON());
        this.editPath.clear();
    }

    private keyboardHandler(e: KeyboardEvent) {
        const actionMapper = this.actionMappings[this.mapMode];
        if (!(e.key in actionMapper)) return;
        const actionId = actionMapper[e.key];
        const action = keyboardHandlers[actionId];
        action(this);
    }

    private onFeatureClick(e: LeafletMouseEvent) {
        const codePath = {
            select: () => {
                this.selectedFeature = e.propagatedFrom;
                if (this.selectedFeature instanceof L.Path) {
                    this.selectedFeature.bringToFront();
                }
                L.DomEvent.stopPropagation(e);
            },
            edit: () => {},
        }[this.mapMode];
        codePath();
    }

    private onMapClick(e: LeafletMouseEvent) {
        const codePath = {
            select: () => {
                this.selectedFeature = null;
            },
            edit: () => {
                this.editPath.push(e.latlng);
            },
        }[this.mapMode];
        codePath();
    }

    public updateStatus(state: "saving" | "saved" | "error") {
        if (!this.statusIndicator) return;

        const dot = this.statusIndicator.querySelector(".dot") as HTMLElement;
        const text = this.statusIndicator.querySelector(".text") as HTMLElement;

        dot.className = "dot"; 
        dot.classList.add(state);

        text.textContent =
            state === "saving"
                ? "Guardando..."
                : state === "saved"
                ? "Guardado"
                : "Error al guardar";
    }

    public updateModeIndicator(mode: string) {
        if (!this.statusIndicator) return;
        const modeEl = this.statusIndicator.querySelector(".mode") as HTMLElement;
        if (modeEl) modeEl.textContent = mode.toUpperCase();
    }
}

customElements.define("geojson-map", HTMLGeoJSONMapElement);

export function GeoJsonMap(features: FeatureDto[]): HTMLGeoJSONMapElement {
    const map = new HTMLGeoJSONMapElement();
    map.loadFeatures(features);
    return map;
}
