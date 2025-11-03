import { State } from "@/state";
import { 
    createFeatureResource,
    updateFeatureResource,
    deleteFeatureResource,
    getMapFeatures,
    updateMapResource
} from "@/api";
import { setRoute } from "@/routing"; 
import { GeoJsonMap, TextEditor } from "@/components";
import "./editor.css";

function handleUserDataError() {
    setRoute("/login");
    setTimeout(() => alert("Inicie sesión primero"), 100);
}

function handleMapDataError() {
    setRoute("/dashboard");
    setTimeout(() => alert(
        "Hubo un error al cargar el mapa, intentalo de nuevo"
    ), 100);
}

export async function Editor(root: HTMLElement) {

    const state = State.get();

    const userId = state.userId;
    if(!userId) {
        handleUserDataError();
        return;
    }

    const mapId = state.mapId;
    const mapView = state.mapView;
    if(!mapId || !mapView) {
        handleMapDataError();
        return;
    }

    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';

    const backButton = document.createElement('button');
    backButton.textContent = '← Volver al dashboard';
    backButton.className = 'editor-back-button';
    backButton.addEventListener('click', () => setRoute("/dashboard"));

    const mainContent = document.createElement('div');
    mainContent.className = 'editor-main-content';
    
    const map = GeoJsonMap();
    const textEditor = TextEditor();

    const sidebarContainer = document.createElement('div');
    sidebarContainer.className = 'editor-sidebar-container';

    sidebarContainer.appendChild(textEditor);
    sidebarContainer.appendChild(backButton);

    mainContent.appendChild(map);
    mainContent.appendChild(sidebarContainer);

    editorContainer.appendChild(mainContent);
    root.appendChild(editorContainer);


    map.view = mapView;
    const intervalId = setInterval(async () => {
        if (mapId !== State.get().mapId || !map.isConnected) {
            clearInterval(intervalId);
            return;
        }

        try {
            await updateMapResource(mapId, { view: map.view });
        } catch (err) {
            console.error(err);
        }
    }, 10_000);


    //Read all current features once
    const featureDtos = await getMapFeatures(mapId);
    for(const dto of featureDtos) {
        (dto.geojson.properties as any).id = dto.id;
    }
    const features = featureDtos.map((dto) => dto.geojson);
    map.loadFeatures(features);


    //Create feature as they are added to the map
    map.onFeatureCreate = async (feature) => {
        feature.properties.name = ""
        feature.properties.description = ""
        try {
            const dto = await createFeatureResource({
                userId: userId,
                mapId: mapId,
                geojson: {
                    type: feature.type,
                    properties: {
                        name: feature.properties.name ?? "New Feature",
                        description: feature.properties.description ?? ""
                    },
                    geometry: feature.geometry
                }
            });
            feature.properties.id = dto.id;
            return true;
        } catch(error) {
            console.error(error);
            alert("Ocurrio un error al intentar crear la caracteristica");
            return false;
        }
    }


    //Delete features as deleted by the user
    map.onFeatureDelete = async (feature) => {
        try {
            const featureId = feature.properties.id;
            if(!featureId) {
                throw new Error("Unable to retrieve feature id");
            }
            await deleteFeatureResource(featureId);
            return true; 
        } catch(error) {
            console.error(error)
            alert("Ocurrio un error al intentar eliminar la caracteristica");
            return false;
        }
    }


    //Update feature data on selection change
    map.onSelectionChange = async (oldSelection, newSelection) => {
  
        const oldTitleTextContent = textEditor.titleTextContent;
        const oldBodyTextContent = textEditor.bodyTextContent;

        //switch early then save
        if(newSelection?.feature) {
            const properties = newSelection.feature.properties;
            textEditor.titleTextContent = properties.name ?? "";
            textEditor.bodyTextContent = properties.description ?? "";
        }
        else {
            textEditor.titleTextContent = "";
            textEditor.bodyTextContent = "";
        }

        if(oldSelection?.feature) {
            const properties = oldSelection.feature.properties;
            properties.name = oldTitleTextContent;
            properties.description = oldBodyTextContent;
            try {
                const featureId = properties.id;
                if(!featureId) {
                    throw new Error("Unable to retrieve feature id");
                }
                await updateFeatureResource(featureId, {
                    geojson: {
                        properties: {
                            name: properties.name,
                            description: properties.description
                        }
                    }
                });
            } catch(error) { console.error(error); }
        }

    };

}
