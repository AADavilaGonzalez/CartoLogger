import { State } from "@/state";
import { setRoute } from "@/routing";

import {
    addMapToFavorites,
    createMapResorce,
    deleteMapResource,
    getUserFavoriteMaps,
    getUserMaps,
    removeMapFromFavorites,
    updateMapResource,
    type MapDto
} from "@/api";

import "./dashboard.css";
import html from "./dashboard.html?raw";

type MapData = MapDto & {isFavorite: boolean};


function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function createMapCardHtml(map: MapDto, sectionType: string): string {
    return `
        <div class="map-card" id="map-card-${sectionType}-${map.id}">
            <h4>${escapeHtml(map.title)}</h4>
        </div>
    `;
}

function arrayRemove<T>(arr: T[], predicate: (elem: T) => boolean) {
    for(let i = arr.length-1; i >= 0; --i) {
        if(predicate(arr[i])) {
            arr.splice(i,1);
        }
    }
}

function arrayIndex<T>(arr: T[], predicate: (elem: T) => boolean) {
    for(let i=0; i<arr.length; ++i) {
        if(predicate(arr[i])) {
            return i;
        }
    }
    return -1;
}

export function Dashboard(root: HTMLElement): void {
    root.innerHTML = html;
    
    // Get all DOM elements
    const usernameElement = document.getElementById('username') as HTMLElement;
    const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
    const favoritesGrid = document.getElementById('favorites-grid') as HTMLElement;
    const myMapsGrid = document.getElementById('my-maps-grid') as HTMLElement;
    const favoritesLoading = document.getElementById('favorites-loading') as HTMLElement;
    const myMapsLoading = document.getElementById('my-maps-loading') as HTMLElement;
    const createMapBtn = document.getElementById('create-map-btn') as HTMLButtonElement;
    const mapDetails = document.getElementById('map-details') as HTMLElement;
    
    let selectedMapId: number | null = null;
    let maps: MapData[] = [];
    
    // Initialize dashboard
    initializeDashboard();
    
    async function initializeDashboard(): Promise<void> {

        const state = State.get();

        if(!state.userId) {
            setRoute("/login");
            alert("Please Login First");
            return;
        }
        
        usernameElement.textContent = state.username ?? "Usuario";
        
        // Add event listeners
        logoutBtn.addEventListener('click', handleLogout);
        createMapBtn.addEventListener('click', handleCreateMap);
        
        await loadUserMaps();
    }
    
    async function loadUserMaps(): Promise<void> {
        try {
            const userId = State.get().userId!;

            const userDtos = await getUserMaps(userId);
            userDtos.forEach((m) => { (m as any).isFavorite = false; });
            const userMaps = userDtos as MapData[];

            const favDtos = await getUserFavoriteMaps(userId);
            for(const dto of favDtos) {
                if(dto.userId === userId) {
                    const i = arrayIndex(userMaps, (m) => m.id === dto.id);
                    userMaps[i].isFavorite = true;
                }
            }

            arrayRemove(favDtos, (m) => m.userId === userId);
            favDtos.forEach((m) => { (m as any).IsFavorite = true; });
            const foreignMaps = favDtos as MapData[];

            maps = [...userMaps, ...foreignMaps]; 

            displayMaps(); 
        } catch (error) {
            showError('Ha ocurrido un error al cargar los mapas');
        }
    }
    
    function displayMaps(): void {
        const userId = State.get().userId!;
        // Display user maps
        displayMapGrid(
            maps.filter((m) => m.userId === userId),
            myMapsGrid,
            myMapsLoading,
            'No tienes ningún mapa'
        );
        // Display favorites
        displayMapGrid(
            maps.filter((m) => m.isFavorite === true),
            favoritesGrid,
            favoritesLoading,
            'No hay mapas favoritos'
        ); 
    }
    
    function displayMapGrid(
        maps: MapData[],
        gridElement: HTMLElement,
        loadingElement: HTMLElement,
        emptyMessage: string
    ): void {

        loadingElement.style.display = 'none';
        
        if (maps.length === 0) {
            gridElement.innerHTML = `<div class="loading">${emptyMessage}</div>`;
            return;
        }
        
        // Determine section type for unique IDs
        const sectionType = gridElement.id === 'favorites-grid' ? 'fav' : 'my';
        
        const mapsHtml = maps.map(map => createMapCardHtml(map, sectionType)).join('');
        gridElement.innerHTML = mapsHtml;
        
        // Add event listeners to map cards
        maps.forEach(map => {
            const mapCard = document.getElementById(`map-card-${sectionType}-${map.id}`);
            if (mapCard) {
                // Single click - show details
                mapCard.addEventListener('click', () => handleMapClick(map)); 
                // Double click - open editor
                mapCard.addEventListener('dblclick', () => handleMapDoubleClick(map));
            }
        });
    }
    
    
    function handleMapClick(map: MapData): void {
        // Update selected map
        selectedMapId = map.id;
        
        // Clear all previous selections in both sections
        document.querySelectorAll('.map-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selection to all cards with this map ID (both favorites and my maps)
        const favCard = document.getElementById(`map-card-fav-${map.id}`);
        const myCard = document.getElementById(`map-card-my-${map.id}`);
               
        if (favCard) {
            favCard.classList.add('selected');
        }
        if (myCard) {
            myCard.classList.add('selected');
        }
        
        // Show map details
        showMapDetails(map);
    }
    
    function handleMapDoubleClick(map: MapData): void {
        State.set({mapId: map.id});
        setRoute("/editor");
    }
    
    function showMapDetails(map: MapData): void {
        const favoriteButton = map.isFavorite
            ? `<button class="remove-favorite-btn" onclick="removeMapFromFavorites(${map.id})">⭐ Quitar de Favoritos</button>`
            : `<button class="add-to-favorite-btn" onclick="addMapToFavorites(${map.id})">⭐ Agregar a Favoritos</button>`;
            
        mapDetails.innerHTML = `
            <div class="selected-map">
                <h3>*Detalles del Mapa Seleccionado*</h3>
                <div class="map-info">
                    <div class="map-info-item">
                        <label>Título:</label>
                        <div class="value">${escapeHtml(map.title)}</div>
                    </div>
                    <div class="map-info-item">
                        <label>*Descripción*:</label>
                        <div class="value">${escapeHtml(map.description)}</div>
                    </div>
                    <div class="map-info-item">
                        <label>*Otros datos*:</label>
                        <div class="value">
                            Favorito: ${map.isFavorite ? 'Sí ⭐' : 'No'}<br>
                            Características: ${map.features ? map.features.length : 0}
                        </div>
                    </div>
                </div>
                <div class="map-actions">
                    <button class="edit-btn" onclick="editMap(${map.id})">Editar</button>
                    <button class="delete-btn" onclick="deleteMap(${map.id})">Eliminar</button>
                    ${favoriteButton}
                </div>
            </div>
        `;
    }
    

    async function handleCreateMap(): Promise<void> {
        const userId = State.get().userId!;
        const dto: MapDto = await createMapResorce(
            {userId: userId, title:"New Map", description:""}
        ); 
        const map: MapData = {...dto, isFavorite: false};
        maps.push(map);
        displayMaps();
    }
    

    async function handleEditMap(map: MapData): Promise<void> {
        const newTitle = prompt('Nuevo Titulo', map.title);
        if(newTitle === null) { return; }
        
        const newDescription = prompt('Nueva Descripcion', map.description);
        if(newDescription === null) { return; }

        try {
            updateMapResource(map.id, {
                title: newTitle,
                description: newDescription
            });
            map.title = newTitle;
            map.description = newDescription;
            displayMaps();
        } catch(error) {
            console.error(error);
            alert("Ocurrio un error al intentar actualizar el mapa");
        }
    }

    (window as any).editMap = (mapId: number) => {
        const map = maps.find(m => m.id === mapId);
        if (map) handleEditMap(map);
    };
 

    async function handleDeleteMap(map: MapData): Promise<void> {
        const msg = `¿Estás seguro de que quieres eliminar el mapa "${map.title}"?`;
        if(!confirm(msg)) { return; }
        
        try { 
            deleteMapResource(map.id);
            arrayRemove(maps, (m) => m.id === map.id);
 
            // Clear details if deleted map was selected
            if (selectedMapId === map.id) {
                mapDetails.innerHTML = `
                    <div class="no-selection">
                        <h3>*Detalles del Mapa Seleccionado*</h3>
                        <p>Haz clic en un mapa para ver sus detalles</p>
                    </div>
                `;
                selectedMapId = null;
            }
            
            displayMaps();
            
        } catch (error) {
            console.error(error);
            alert('Ocurrio un error al intentar eliminar el mapa');
        }
    }

    (window as any).deleteMap = (mapId: number) => {
        const map = maps.find(m => m.id === mapId);
        if (map) handleDeleteMap(map);
    };


    async function handleAddMapToFavorites(map: MapData): Promise<void> { 
        try {
            await addMapToFavorites(State.get().userId!, map.id);
            map.isFavorite = true;
            displayMaps();
            //setTimeout(() => handleMapClick(map), 100);
        } catch {
            alert("Ha ocurrido un error al intentar agregar el mapa a favoritos");
        }
    }

    (window as any).addMapToFavorites = (mapId: number) => {
        const map = maps.find(m => m.id === mapId);
        if (map) handleAddMapToFavorites(map);
    };


    async function handleRemoveMapFromFavorites(map: MapData): Promise<void> {
        try {
            const userId = State.get().userId!
            console.log(userId, map.id);
            await removeMapFromFavorites(State.get().userId!, map.id);
            map.isFavorite = false;
            displayMaps();
            //setTimeout(() => handleMapClick(map), 100);
        } catch {
            alert("Ha ocurrido un error al intentar eliminar el mapa a favoritos");
        }
    }
    
    (window as any).removeMapFromFavorites = (mapId: number) => {
        const map = maps.find(m => m.id === mapId);
        if (map) handleRemoveMapFromFavorites(map);
    };


    function handleLogout(): void {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Clear user state
            State.set({ userId: undefined, username: undefined }); 
            // Redirect to login
            setRoute("/login");
        }
    }
    
    function showError(message: string): void {
        favoritesLoading.style.display = 'none';
        myMapsLoading.style.display = 'none'; 
        favoritesGrid.innerHTML = `<div class="loading">Error: ${message}</div>`;
        myMapsGrid.innerHTML = `<div class="loading">Error: ${message}</div>`;
    }
    
}
