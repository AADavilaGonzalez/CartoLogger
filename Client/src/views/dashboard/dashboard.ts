import { state } from "../../state";

import "./dashboard.css";
import html from "./dashboard.html?raw";

interface MapData {
    id: number;
    userId?: number;
    title: string;
    description: string;
    features?: any[];
    isFavorite?: boolean;
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
    const addFavoriteBtn = document.getElementById('add-favorite-btn') as HTMLButtonElement;
    const mapDetails = document.getElementById('map-details') as HTMLElement;
    
    let selectedMapId: number | null = null;
    let allMaps: MapData[] = [];
    
    // Initialize dashboard
    initializeDashboard();
    
    async function initializeDashboard(): Promise<void> {
        // Set username from state
        const currentState = state.get();
        
        // For testing purposes, set default user if none exists
        if (!currentState.userId) {
            state.set({ userId: 1, username: 123 }); // Using number as per state interface
        }
        
        const updatedState = state.get();
        if (updatedState.username) {
            usernameElement.textContent = updatedState.username.toString();
        }
        
        // Add event listeners
        logoutBtn.addEventListener('click', handleLogout);
        createMapBtn.addEventListener('click', handleCreateMap);
        addFavoriteBtn.addEventListener('click', handleAddToFavorites);
        
        // Load maps
        await loadUserMaps();
    }
    
    async function loadUserMaps(): Promise<void> {
        try {
            const currentState = state.get();
            
            if (!currentState.userId) {
                showError('Usuario no autenticado');
                return;
            }
            
            // Try to load from API, fallback to mock data
            try {
                const maps = await fetchUserMaps(currentState.userId);
                allMaps = maps;
                displayMaps();
            } catch (apiError) {
                console.warn('API not available, using mock data:', apiError);
                const maps = await getMockMaps(currentState.userId);
                allMaps = maps;
                displayMaps();
            }
            
        } catch (error) {
            console.error('Error loading maps:', error);
            showError('Error al cargar los mapas');
        }
    }
    
    async function fetchUserMaps(userId: number): Promise<MapData[]> {
        const response = await fetch(`http://localhost:7000/api/users/${userId}?maps=true`);
        if (!response.ok) throw new Error('Failed to fetch maps');
        const userData = await response.json();
        return userData.maps || [];
    }
    
    async function getMockMaps(userId: number): Promise<MapData[]> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        userId: userId,
                        title: "Map1",
                        description: "Un mapa detallado del centro de la ciudad con puntos de interés importantes.",
                        isFavorite: true
                    },
                    {
                        id: 2,
                        userId: userId,
                        title: "Map2",
                        description: "Colección de rutas de senderismo en la montaña con diferentes niveles de dificultad.",
                        isFavorite: false
                    },
                    {
                        id: 3,
                        userId: userId,
                        title: "Map3",
                        description: "Mapa del campus con ubicaciones de edificios, estacionamientos y servicios estudiantiles.",
                        isFavorite: true
                    },
                    {
                        id: 4,
                        userId: userId,
                        title: "Map4",
                        description: "Mapa de rutas ciclísticas urbanas con carriles seguros y estaciones de bicicletas.",
                        isFavorite: false
                    }
                ]);
            }, 1000);
        });
    }
    
    function displayMaps(): void {
        const favoriteMaps = allMaps.filter(map => map.isFavorite);
        const regularMaps = allMaps;
        
        // Display favorites
        displayMapGrid(favoriteMaps, favoritesGrid, favoritesLoading, 'No hay mapas favoritos');
        
        // Display all maps
        displayMapGrid(regularMaps, myMapsGrid, myMapsLoading, 'No tienes mapas todavía');
    }
    
    function displayMapGrid(maps: MapData[], gridElement: HTMLElement, loadingElement: HTMLElement, emptyMessage: string): void {
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
    
    function createMapCardHtml(map: MapData, sectionType: string): string {
        return `
            <div class="map-card" id="map-card-${sectionType}-${map.id}">
                <h4>${escapeHtml(map.title)}</h4>
            </div>
        `;
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
        
        console.log('Map selected:', map);
    }
    
    function handleMapDoubleClick(map: MapData): void {
        console.log('Opening map editor:', map);
        // Navigate to editor
        window.location.hash = `#/editor/${map.id}`;
    }
    
    function showMapDetails(map: MapData): void {
        const favoriteButton = map.isFavorite 
            ? `<button class="remove-favorite-btn" onclick="handleRemoveFromFavorites(${map.id})">⭐ Quitar de Favoritos</button>`
            : `<button class="add-to-favorite-btn" onclick="handleAddSingleToFavorites(${map.id})">⭐ Agregar a Favoritos</button>`;
            
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
                            ID: ${map.id}<br>
                            Usuario: ${map.userId}<br>
                            Favorito: ${map.isFavorite ? 'Sí ⭐' : 'No'}<br>
                            Características: ${map.features ? map.features.length : 0}
                        </div>
                    </div>
                </div>
                <div class="map-actions">
                    <button class="edit-btn" onclick="handleEditMapFromDetails(${map.id})">Editar</button>
                    <button class="delete-btn" onclick="handleDeleteMapFromDetails(${map.id})">Eliminar</button>
                    ${favoriteButton}
                </div>
            </div>
        `;
    }
    
    // Make functions globally accessible for onclick handlers
    (window as any).handleEditMapFromDetails = (mapId: number) => {
        const map = allMaps.find(m => m.id === mapId);
        if (map) handleEditMap(map);
    };
    
    (window as any).handleDeleteMapFromDetails = (mapId: number) => {
        const map = allMaps.find(m => m.id === mapId);
        if (map) handleDeleteMap(map);
    };
    
    (window as any).handleAddSingleToFavorites = (mapId: number) => {
        const map = allMaps.find(m => m.id === mapId);
        if (map) {
            map.isFavorite = true;
            alert(`⭐ Mapa "${map.title}" agregado a favoritos`);
            displayMaps();
            setTimeout(() => handleMapClick(map), 100);
        }
    };
    
    (window as any).handleRemoveFromFavorites = (mapId: number) => {
        const map = allMaps.find(m => m.id === mapId);
        if (map && confirm(`¿Quitar "${map.title}" de favoritos?`)) {
            map.isFavorite = false;
            alert(`Mapa "${map.title}" removido de favoritos`);
            displayMaps();
            setTimeout(() => handleMapClick(map), 100);
        }
    };
    
    function handleCreateMap(): void {
        console.log('Creating new map');
        window.location.hash = '#/editor/new';
    }
    
    function handleAddToFavorites(): void {
        // Get all non-favorite maps
        const nonFavoriteMaps = allMaps.filter(map => !map.isFavorite);
        
        if (nonFavoriteMaps.length === 0) {
            alert('¡Todos los mapas ya están en favoritos! 🌟');
            return;
        }
        
        // Create a simple selection interface
        let selectionText = 'Selecciona un mapa para agregar a favoritos:\n\n';
        nonFavoriteMaps.forEach(map => {
            selectionText += `${map.id}. ${map.title}\n`;
        });
        selectionText += '\nIngresa el número del mapa:';
        
        const selectedMapIdStr = prompt(selectionText);
        
        if (!selectedMapIdStr) return; // User cancelled
        
        const selectedMapId = parseInt(selectedMapIdStr);
        const selectedMap = nonFavoriteMaps.find(map => map.id === selectedMapId);
        
        if (!selectedMap) {
            alert('❌ Número de mapa inválido. Por favor, selecciona un número de la lista.');
            return;
        }
        
        // Update the map to be favorite
        selectedMap.isFavorite = true;
        
        // TODO: In a real app, you would make an API call here to update the favorite status
        // try {
        //     await fetch(`http://localhost:7000/api/map/favorite/${selectedMap.id}`, {
        //         method: 'POST',
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify({ isFavorite: true })
        //     });
        // } catch (error) {
        //     console.error('Error updating favorite status:', error);
        // }
        
        alert(`⭐ Mapa "${selectedMap.title}" agregado a favoritos`);
        
        // Refresh the display
        displayMaps();
        
        // Auto-select the newly favorited map
        setTimeout(() => handleMapClick(selectedMap), 100);
        
        console.log('Map added to favorites:', selectedMap);
    }
    
    async function handleEditMap(map: MapData): Promise<void> {
        const newTitle = prompt('Nuevo título del mapa:', map.title);
        if (!newTitle || newTitle === map.title) return;
        
        const newDescription = prompt('Nueva descripción del mapa:', map.description);
        if (newDescription === null) return;
        
        try {
            const response = await fetch(`http://localhost:7000/api/map/update/${map.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: map.userId,
                    title: newTitle,
                    description: newDescription || map.description
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update map');
            }
            
            alert(`Mapa "${newTitle}" actualizado correctamente`);
            await loadUserMaps();
            
            // Re-select the updated map after reload
            const updatedMap = allMaps.find(m => m.id === map.id);
            if (updatedMap) {
                setTimeout(() => handleMapClick(updatedMap), 200);
            }
            
        } catch (error) {
            console.error('Error updating map:', error);
            alert('Error al actualizar el mapa');
        }
    }
    
    async function handleDeleteMap(map: MapData): Promise<void> {
        if (!confirm(`¿Estás seguro de que quieres eliminar el mapa "${map.title}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:7000/api/map/delete/${map.id}`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete map');
            }
            
            console.log('Map deleted successfully:', map);
            alert(`Mapa "${map.title}" eliminado correctamente`);
            
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
            
            await loadUserMaps();
            
        } catch (error) {
            console.error('Error deleting map:', error);
            alert('Error al eliminar el mapa');
        }
    }
    
    function handleLogout(): void {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Clear user state
            state.set({ userId: undefined, username: undefined });
            
            // Redirect to login
            window.location.hash = '#/login';
        }
    }
    
    function showError(message: string): void {
        favoritesLoading.style.display = 'none';
        myMapsLoading.style.display = 'none';
        
        favoritesGrid.innerHTML = `<div class="loading">Error: ${message}</div>`;
        myMapsGrid.innerHTML = `<div class="loading">Error: ${message}</div>`;
    }
    
    function escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
